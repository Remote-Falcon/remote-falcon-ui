/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { TextField } from '@mui/material';
import newAxios from 'axios';
import htmlToReact from 'html-to-react';
import loadjs from 'loadjs';
import _, { set } from 'lodash';
import moment from 'moment';
import Loading from 'react-fullscreen-loading';
import { Helmet } from 'react-helmet';

import useInterval from '../../../hooks/useInterval';
import { useDispatch } from '../../../store';
import { getSubdomain } from '../../../utils/route-guard/helpers/helpers';
import { trackPosthogEvent } from '../../../utils/analytics/posthog';

import { addSequenceToQueueService, voteForSequenceService } from '../../../services/viewer/mutations.service';
import { LocationCheckMethod, ViewerControlMode } from '../../../utils/enum';
import { ADD_SEQUENCE_TO_QUEUE, INSERT_VIEWER_PAGE_STATS, VOTE_FOR_SEQUENCE } from '../../../utils/graphql/viewer/mutations';
import { GET_ACTIVE_VIEWER_PAGE, GET_SHOW_FOR_VIEWER } from '../../../utils/graphql/viewer/queries';
import { showAlert } from '../globalPageHelpers';
import { defaultProcessingInstructions, processingInstructions, viewerPageMessageElements, viewerReadOnlyBannerElement, viewerReadOnlyMessageElements } from './helpers/helpers';

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const parseNumber = (value) => {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeSequenceName = (value) => (value == null ? '' : String(value).trim().toLowerCase());

const normalizeLocationCode = (value) => {
  if (value == null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const getDistanceMiles = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
};

const viewerReadOnlyMessages = {
  REQUESTS_DISABLED: 'Requests are currently disabled.',
  VOTES_DISABLED: 'Voting is currently disabled.',
  LOCATION_CODE_REQUIRED: 'Enter the location code to request or vote.',
  INVALID_LOCATION_CODE: 'That location code does not match.',
  QUEUE_FULL: 'The request queue is full.',
  ALREADY_VOTED: 'You have already voted for this session.',
  ALREADY_REQUESTED: 'You have already requested a sequence.',
  INVALID_LOCATION: 'Requests are limited to a specific location.'
};

const ExternalViewerPage = () => {
  const dispatch = useDispatch();

  const blockRedirectReferrers = ['https://player.pulsemesh.io/'];
  const viewerScriptsBasePath = '/viewer-scripts/';

  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState();
  const [activeViewerPage, setActiveViewerPage] = useState();

  const [remoteViewerReactPage, setRemoteViewerReactPage] = useState(null);
  const [viewerLatitude, setViewerLatitude] = useState(0.0);
  const [viewerLongitude, setViewerLongitude] = useState(0.0);
  const [enteredLocationCode, setEnteredLocationCode] = useState(null);
  const [messageDisplayTime] = useState(6000);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [nowPlayingTimer, setNowPlayingTimer] = useState(0);
  const [stickyReadOnlyReason, setStickyReadOnlyReason] = useState(null);
  const [hasHtmlReadOnlyMessages, setHasHtmlReadOnlyMessages] = useState(false);
  const hasInitializedRef = useRef(false);

  const [getShowQuery] = useLazyQuery(GET_SHOW_FOR_VIEWER);
  const [getActiveViewerPageQuery] = useLazyQuery(GET_ACTIVE_VIEWER_PAGE);
  const [insertViewerPageStatsMutation] = useMutation(INSERT_VIEWER_PAGE_STATS);
  const [addSequenceToQueueMutation] = useMutation(ADD_SEQUENCE_TO_QUEUE);
  const [voteForSequenceMutation] = useMutation(VOTE_FOR_SEQUENCE);

  // Polling query for continuous updates
  const { data: pollingData } = useQuery(GET_SHOW_FOR_VIEWER, {
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      showSubdomain: getSubdomain()
    },
    pollInterval: 5000,
    skip: loading, // Skip polling during initial load
    notifyOnNetworkStatusChange: true,
    onError: () => {
      showAlert(dispatch, { alert: 'error' });
    }
  });

  const setViewerLocation = useCallback(
    () =>
      new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = parseFloat(position.coords.latitude.toFixed(5));
            const longitude = parseFloat(position.coords.longitude.toFixed(5));
            setViewerLatitude(latitude);
            setViewerLongitude(longitude);
            resolve({ latitude, longitude });
          },
          () => resolve(null)
        );
      }),
    []
  );

  const refreshViewerLocationForShow = useCallback(
    (showData) => {
      if (showData?.preferences?.locationCheckMethod === LocationCheckMethod.GEO) {
        setViewerLocation();
      }
    },
    [setViewerLocation]
  );

  const showViewerMessage = useCallback(
    (response) => {
      const errorMessage = response?.error?.graphQLErrors[0]?.extensions?.message;
      if (response?.success) {
        viewerPageMessageElements.requestSuccessful.current = viewerPageMessageElements?.requestSuccessful?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Success' });
      } else if (errorMessage === 'NAUGHTY') {
        // Do nothing, say nothing
        trackPosthogEvent('viewer_interaction_result', { result: 'Naughty' });
      } else if (errorMessage === 'SEQUENCE_REQUESTED') {
        viewerPageMessageElements.requestPlaying.current = viewerPageMessageElements?.requestPlaying?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Sequence Already Requested' });
      } else if (errorMessage === 'INVALID_LOCATION') {
        viewerPageMessageElements.invalidLocation.current = viewerPageMessageElements?.invalidLocation?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Invalid Location' });
      } else if (errorMessage === 'QUEUE_FULL') {
        viewerPageMessageElements.queueFull.current = viewerPageMessageElements?.queueFull?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Queue Full' });
      } else if (errorMessage === 'INVALID_CODE') {
        viewerPageMessageElements.invalidLocationCode.current = viewerPageMessageElements?.invalidLocationCode?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Invalid Code' });
      } else if (errorMessage === 'ALREADY_VOTED') {
        viewerPageMessageElements.alreadyVoted.current = viewerPageMessageElements?.alreadyVoted?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Already Voted' });
      } else if (errorMessage === 'ALREADY_REQUESTED') {
        viewerPageMessageElements.alreadyRequested.current = viewerPageMessageElements?.alreadyRequested?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Viewer Already Requested' });
      } else {
        viewerPageMessageElements.requestFailed.current = viewerPageMessageElements?.requestFailed?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Failed' });
      }
      setTimeout(() => {
        _.map(viewerPageMessageElements, (message) => {
          message.current = message?.none;
        });
      }, messageDisplayTime);
    },
    [messageDisplayTime]
  );

  const getDynamicReadOnlyReason = useCallback(() => {
    setStickyReadOnlyReason(null);
    
    if (show?.preferences?.viewerPageViewOnly) {
      setStickyReadOnlyReason(show?.preferences?.viewerControlMode === ViewerControlMode.VOTING ? 'VOTES_DISABLED' : 'REQUESTS_DISABLED');
    }

    if (show?.preferences?.locationCheckMethod === LocationCheckMethod.CODE) {
      const configuredCode = normalizeLocationCode(show?.preferences?.locationCode);
      const enteredCode = normalizeLocationCode(enteredLocationCode);
      if (configuredCode != null && enteredCode !== configuredCode) {
        setStickyReadOnlyReason('INVALID_LOCATION_CODE');
      }
      if (!enteredCode) {
        setStickyReadOnlyReason('LOCATION_CODE_REQUIRED');
      }
    }

    if (show?.preferences?.locationCheckMethod === LocationCheckMethod.GEO) {
      const allowedRadius = parseNumber(show?.preferences?.allowedRadius);
      const showLatitude = parseNumber(show?.preferences?.showLatitude);
      const showLongitude = parseNumber(show?.preferences?.showLongitude);
      const viewerLat = parseNumber(viewerLatitude);
      const viewerLon = parseNumber(viewerLongitude);
      if (allowedRadius != null && showLatitude != null && showLongitude != null && viewerLat != null && viewerLon != null) {
        const distance = getDistanceMiles(showLatitude, showLongitude, viewerLat, viewerLon);
        if (distance > allowedRadius) {
          setStickyReadOnlyReason('INVALID_LOCATION');
        }
      }
    }

    if (show?.preferences?.viewerControlMode === ViewerControlMode.JUKEBOX) {
      const queueDepth = show?.preferences?.jukeboxDepth;
      if (queueDepth != null && show?.requests?.length >= queueDepth) {
        setStickyReadOnlyReason('QUEUE_FULL');
      }
    }

    if (show?.viewerStatus === 'ALREADY_REQUESTED' || show?.viewerStatus === 'ALREADY_VOTED') {
      setStickyReadOnlyReason(show?.viewerStatus);
    }
  }, [enteredLocationCode, show?.preferences, show?.requests?.length, show?.viewerStatus, viewerLatitude, viewerLongitude]);

  const isSequenceAlreadyRequested = useCallback(
    (sequenceName, sequenceDisplayName) => {
      const normalizedName = normalizeSequenceName(sequenceName);
      const normalizedDisplayName = normalizeSequenceName(sequenceDisplayName);
      const playingNow = normalizeSequenceName(show?.playingNow);
      const playingNext = normalizeSequenceName(show?.playingNext);

      if (playingNow === normalizedName || (normalizedDisplayName && playingNow === normalizedDisplayName)) {
        return true;
      }

      if (playingNext === normalizedName || (normalizedDisplayName && playingNext === normalizedDisplayName)) {
        return true;
      }

      const requestLimit = parseNumber(show?.preferences?.jukeboxRequestLimit);
      if (requestLimit && requestLimit !== 0) {
        const requestNamesLastToFirst = _.chain(show?.requests || [])
          .orderBy(['position'], ['desc'])
          .take(requestLimit)
          .map((request) => normalizeSequenceName(request?.sequence?.name))
          .value();
        return requestNamesLastToFirst.includes(normalizedName);
      }

      return false;
    },
    [show?.playingNow, show?.playingNext, show?.preferences?.jukeboxRequestLimit, show?.requests]
  );

  const addSequenceToQueue = useCallback(
    async (e) => {
      const sequenceName = e.target.attributes.getNamedItem('data-key') ? e.target.attributes.getNamedItem('data-key').value : '';
      const sequenceDisplayName = e.target.attributes.getNamedItem('data-key-2')
        ? e.target.attributes.getNamedItem('data-key-2').value
        : null;
      trackPosthogEvent('viewer_interaction', {
        action: 'Add Sequence to Queue',
        sequence: sequenceDisplayName != null ? sequenceDisplayName : sequenceName,
        show_name: show?.showName
      });

      if (isSequenceAlreadyRequested(sequenceName, sequenceDisplayName)) {
        viewerPageMessageElements.requestPlaying.current = viewerPageMessageElements?.requestPlaying?.block;
        trackPosthogEvent('viewer_interaction_result', { result: 'Sequence Already Requested' });
        setTimeout(() => {
          _.map(viewerPageMessageElements, (message) => {
            message.current = message?.none;
          });
        }, messageDisplayTime);
        return;
      }
      addSequenceToQueueService(
        addSequenceToQueueMutation,
        getSubdomain(),
        sequenceName,
        (response) => {
          showViewerMessage(response);
        }
      );
    },
    [addSequenceToQueueMutation, isSequenceAlreadyRequested, messageDisplayTime, show?.showName, showViewerMessage]
  );

  const voteForSequence = useCallback(
    async (e) => {
      const sequenceName = e.target.attributes.getNamedItem('data-key') ? e.target.attributes.getNamedItem('data-key').value : '';
      const sequenceDisplayName = e.target.attributes.getNamedItem('data-key-2')
        ? e.target.attributes.getNamedItem('data-key-2').value
        : null;
      trackPosthogEvent('viewer_interaction', {
        action: 'Vote for Sequence',
        sequence: sequenceDisplayName != null ? sequenceDisplayName : sequenceName,
        show_name: show?.showName
      });
      voteForSequenceService(
        voteForSequenceMutation,
        getSubdomain(),
        sequenceName,
        (response) => {
          showViewerMessage(response);
        }
      );
    },
    [show?.showName, voteForSequenceMutation, showViewerMessage]
  );

  const delay = useCallback(
    (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      }),
    []
  );

  const fetchViewerScripts = useCallback(
    async (attempt = 1) => {
      try {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        const response = await newAxios.get(`${viewerScriptsBasePath}scripts.json`, config);
        if (!Array.isArray(response?.data)) {
          throw new Error('Invalid scripts.json payload');
        }
        return response.data;
      } catch (error) {
        console.warn(`[Viewer] Failed to fetch scripts.json (attempt ${attempt})`, error);
        if (attempt < 3) {
          await delay(attempt * 300);
          return fetchViewerScripts(attempt + 1);
        }
        throw error;
      }
    },
    [delay, viewerScriptsBasePath]
  );

  const loadViewerScript = useCallback(
    (scriptName) =>
      new Promise((resolve, reject) => {
        const url = `${viewerScriptsBasePath}${scriptName}.js`;
        loadjs(url, {
          success: () => resolve(scriptName),
          error: () => {
            const error = new Error(`Failed to load viewer script ${url}`);
            console.warn('[Viewer] Failed to load viewer script', error);
            reject(error);
          }
        });
      }),
    [viewerScriptsBasePath]
  );

  const loadViewerEnhancements = useCallback(
    async (showData) => {
      try {
        const scripts = await fetchViewerScripts();
        const scriptsToLoad = _.filter(scripts, (script) => script !== 'makeItSnow' || showData?.preferences?.makeItSnow);
        await Promise.all(
          _.map(scriptsToLoad, (script) =>
            loadViewerScript(script).catch((error) => {
              console.warn(`[Viewer] Giving up on viewer script ${script}`, error);
              return null;
            })
          )
        );
      } catch (error) {
        console.warn('[Viewer] Unable to load external viewer scripts', error);
      }
    },
    [fetchViewerScripts, loadViewerScript]
  );

  const displayCurrentViewerMessages = (parsedViewerPage) => {
    _.map(viewerPageMessageElements, (message) => {
      parsedViewerPage = parsedViewerPage?.replace(message?.element, message?.current);
    });
    return parsedViewerPage;
  };

  const displayCurrentReadOnlyMessages = useCallback(
    (parsedViewerPage) => {
      if (!parsedViewerPage) {
        return parsedViewerPage;
      }
      _.forEach(viewerReadOnlyMessageElements, (message) => {
        message.current = message?.none;
      });
      viewerReadOnlyBannerElement.current = viewerReadOnlyBannerElement.none;
      if (stickyReadOnlyReason && viewerReadOnlyMessageElements[stickyReadOnlyReason]) {
        viewerReadOnlyMessageElements[stickyReadOnlyReason].current = viewerReadOnlyMessageElements[stickyReadOnlyReason].block;
        viewerReadOnlyBannerElement.current = viewerReadOnlyBannerElement.block;
      }
      parsedViewerPage = parsedViewerPage?.replace(viewerReadOnlyBannerElement.element, viewerReadOnlyBannerElement.current);
      _.forEach(viewerReadOnlyMessageElements, (message) => {
        parsedViewerPage = parsedViewerPage?.replace(message?.element, message?.current);
      });
      return parsedViewerPage;
    },
    [stickyReadOnlyReason]
  );

  const convertViewerPageToReact = useCallback(async () => {
    const isValidNode = () => true;

    let parsedViewerPage = activeViewerPage;

    const htmlToReactParser = new htmlToReact.Parser();
    const processNodeDefinitions = new htmlToReact.ProcessNodeDefinitions(React);
    let instructions = defaultProcessingInstructions(processNodeDefinitions);

    let formattedNowPlayingTimer = '0:00';
    if (show?.playingNow !== '') {
      const playingNowMinutes = Math.floor(nowPlayingTimer / 60);
      const playingNowSeconds = nowPlayingTimer - playingNowMinutes * 60;
      if (nowPlayingTimer) {
        formattedNowPlayingTimer = `${playingNowMinutes}:${playingNowSeconds}`;
        if (playingNowMinutes < 10) {
          formattedNowPlayingTimer = `0${playingNowMinutes}:${playingNowSeconds}`;
        }
        if (playingNowSeconds < 10) {
          formattedNowPlayingTimer = `${playingNowMinutes}:0${playingNowSeconds}`;
        }
      }
    }

    parsedViewerPage = parsedViewerPage?.replace(/{QUEUE_DEPTH}/g, show?.preferences?.jukeboxDepth);
    parsedViewerPage = displayCurrentViewerMessages(parsedViewerPage);
    const hasReadOnlyMarkers = /id="readOnly/.test(parsedViewerPage || '');
    setHasHtmlReadOnlyMessages((prev) => (prev === hasReadOnlyMarkers ? prev : hasReadOnlyMarkers));
    parsedViewerPage = displayCurrentReadOnlyMessages(parsedViewerPage);

    const sequencesElement = [];
    const categoriesPlaced = [];
    let jukeboxRequestsElement = [];

    let playingNow = <>{show?.playingNow}</>;
    let playingNext = <>{show?.playingNext}</>;

    _.map(show?.sequences, (sequence) => {
      if (sequence.visible && sequence.visibilityCount === 0) {
        let sequenceImageElement = [<></>];
        if (sequence && sequence.imageUrl && sequence.imageUrl.replace(/\s/g, '').length) {
          const classname = `sequence-image sequence-image-${sequence.index}`;
          sequenceImageElement = <img alt={sequence.name} className={classname} src={sequence.imageUrl} data-key={sequence.name} />;
        }
        if (show?.preferences?.viewerControlMode === ViewerControlMode.VOTING) {
          let sequenceVotes = 0;
          _.forEach(show?.votes, (vote) => {
            if (vote?.sequence?.name === sequence?.name || vote?.sequenceGroup?.name === sequence?.group) {
              sequenceVotes = vote?.votes;
            }
          });
          if (sequenceVotes !== -1) {
            if (sequence.category == null || sequence.category === '') {
              const votingListClassname = `cell-vote-playlist cell-vote-playlist-${sequence.index}`;
              const votingListArtistClassname = `cell-vote-playlist-artist cell-vote-playlist-artist-${sequence.index}`;

              if (show?.playingNowSequence != null) {
                const playingNowSequence = show?.playingNowSequence;
                let sequenceImageElement = [<></>];
                if (playingNowSequence && playingNowSequence?.imageUrl && playingNowSequence?.imageUrl.replace(/\s/g, '').length) {
                  const classname = `sequence-image sequence-image-${playingNowSequence?.index}`;
                  sequenceImageElement = (
                    <img
                      alt={playingNowSequence?.name}
                      className={classname}
                      src={playingNowSequence?.imageUrl}
                      data-key={playingNowSequence?.name}
                    />
                  );
                  playingNow = (
                    <>
                      {sequenceImageElement}
                      {playingNowSequence?.displayName}
                      <div className={votingListArtistClassname}>{playingNowSequence?.artist}</div>
                    </>
                  );
                } else {
                  playingNow = (
                    <>
                      {playingNowSequence?.displayName}
                      <div className={votingListArtistClassname}>{playingNowSequence?.artist}</div>
                    </>
                  );
                }
              }

              if (show?.playingNextSequence != null) {
                const playingNextSequence = show?.playingNextSequence;
                let sequenceImageElement = [<></>];
                if (playingNextSequence && playingNextSequence?.imageUrl && playingNextSequence?.imageUrl.replace(/\s/g, '').length) {
                  const classname = `sequence-image sequence-image-${playingNextSequence?.index}`;
                  sequenceImageElement = (
                    <img
                      alt={playingNextSequence?.name}
                      className={classname}
                      src={playingNextSequence?.imageUrl}
                      data-key={playingNextSequence?.name}
                    />
                  );
                  playingNext = (
                    <>
                      {sequenceImageElement}
                      {playingNextSequence?.displayName}
                      <div className={votingListArtistClassname}>{playingNextSequence?.artist}</div>
                    </>
                  );
                } else {
                  playingNext = (
                    <>
                      {playingNextSequence?.displayName}
                      <div className={votingListArtistClassname}>{playingNextSequence?.artist}</div>
                    </>
                  );
                }
              }

              sequencesElement.push(
                <>
                  <div
                    className={votingListClassname}
                    onClick={(e) => stickyReadOnlyReason ? _.noop() : voteForSequence(e)}
                    data-key={sequence.name}
                    data-key-2={sequence.displayName}
                  >
                    {sequenceImageElement}
                    {sequence.displayName}
                    <div data-key={sequence.name} data-key-2={sequence.displayName} className={votingListArtistClassname}>
                      {sequence.artist}
                    </div>
                  </div>
                  <div className="cell-vote">{sequenceVotes}</div>
                </>
              );
            } else if (!_.includes(categoriesPlaced, sequence.category)) {
              categoriesPlaced.push(sequence.category);
              const categorizedSequencesArray = [];
              const categorizedSequencesToIterate = _.cloneDeep(show?.sequences);
              _.map(categorizedSequencesToIterate, (categorizedSequence) => {
                let categorizedSequenceVotes = 0;
                _.forEach(show?.votes, (vote) => {
                  if (vote?.sequence?.name === categorizedSequence?.name) {
                    categorizedSequenceVotes = vote?.votes;
                  }
                });
                // const categorizedSequenceVotes = _.find(show?.votes, (vote) => vote?.sequence?.name === categorizedSequence?.name);
                if (categorizedSequence.visible) {
                  if (categorizedSequence.category === sequence.category) {
                    sequenceImageElement = [<></>];
                    if (categorizedSequence && categorizedSequence.imageUrl && categorizedSequence.imageUrl.replace(/\s/g, '').length) {
                      const classname = `sequence-image sequence-image-${categorizedSequence.index}`;
                      sequenceImageElement = (
                        <img
                          alt={categorizedSequence.name}
                          className={classname}
                          src={categorizedSequence.imageUrl}
                          data-key={categorizedSequence.name}
                        />
                      );
                    }
                    const categorizedVotingListClassname = `cell-vote-playlist cell-vote-playlist-${sequence.index}`;
                    const categorizedVotingListArtistClassname = `cell-vote-playlist-artist cell-vote-playlist-artist-${sequence.index}`;
                    const theElement = (
                      <>
                        <div
                          className={categorizedVotingListClassname}
                          onClick={(e) => stickyReadOnlyReason ? _.noop() : voteForSequence(e)}
                          data-key={categorizedSequence.name}
                        >
                          {sequenceImageElement}
                          {categorizedSequence.displayName}
                          <div data-key={categorizedSequence.name} className={categorizedVotingListArtistClassname}>
                            {categorizedSequence.artist}
                          </div>
                        </div>
                        <div className="cell-vote">{categorizedSequenceVotes}</div>
                      </>
                    );
                    categorizedSequencesArray.push(theElement);
                  }
                }
              });

              sequencesElement.push(
                <>
                  <div className="category-section" style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
                    <div className="category-label">{sequence.category}</div>
                    {categorizedSequencesArray}
                  </div>
                </>
              );
            }
          }
        } else if (show?.preferences?.viewerControlMode === ViewerControlMode.JUKEBOX) {
          const jukeboxListClassname = `jukebox-list jukebox-list-${sequence.index}`;
          const jukeboxListArtistClassname = `jukebox-list-artist jukebox-list-artist-${sequence.index}`;

          if (show?.playingNowSequence != null) {
            const playingNowSequence = show?.playingNowSequence;
            let sequenceImageElement = [<></>];
            if (playingNowSequence && playingNowSequence?.imageUrl && playingNowSequence?.imageUrl.replace(/\s/g, '').length) {
              const classname = `sequence-image sequence-image-${playingNowSequence?.index}`;
              sequenceImageElement = (
                <img
                  alt={playingNowSequence?.name}
                  className={classname}
                  src={playingNowSequence?.imageUrl}
                  data-key={playingNowSequence?.name}
                />
              );
              playingNow = (
                <>
                  {sequenceImageElement}
                  {playingNowSequence?.displayName}
                  <div className={jukeboxListArtistClassname}>{playingNowSequence?.artist}</div>
                </>
              );
            } else {
              playingNow = (
                <>
                  {playingNowSequence?.displayName}
                  <div className={jukeboxListArtistClassname}>{playingNowSequence?.artist}</div>
                </>
              );
            }
          }

          if (show?.playingNextSequence != null) {
            const playingNextSequence = show?.playingNextSequence;
            let sequenceImageElement = [<></>];
            if (playingNextSequence && playingNextSequence?.imageUrl && playingNextSequence?.imageUrl.replace(/\s/g, '').length) {
              const classname = `sequence-image sequence-image-${playingNextSequence?.index}`;
              sequenceImageElement = (
                <img
                  alt={playingNextSequence?.name}
                  className={classname}
                  src={playingNextSequence?.imageUrl}
                  data-key={playingNextSequence?.name}
                />
              );
              playingNext = (
                <>
                  {sequenceImageElement}
                  {playingNextSequence?.displayName}
                  <div className={jukeboxListArtistClassname}>{playingNextSequence?.artist}</div>
                </>
              );
            } else {
              playingNext = (
                <>
                  {playingNextSequence?.displayName}
                  <div className={jukeboxListArtistClassname}>{playingNextSequence?.artist}</div>
                </>
              );
            }
          }

          if (sequence.category == null || sequence.category === '') {
            sequencesElement.push(
              <>
                <div
                  className={jukeboxListClassname}
                  onClick={(e) => stickyReadOnlyReason ? _.noop() : addSequenceToQueue(e)}
                  data-key={sequence.name}
                  data-key-2={sequence.displayName}
                >
                  {sequenceImageElement}
                  {sequence.displayName}
                  <div data-key={sequence.name} data-key-2={sequence.displayName} className={jukeboxListArtistClassname}>
                    {sequence.artist}
                  </div>
                </div>
              </>
            );
          } else if (!_.includes(categoriesPlaced, sequence.category)) {
            categoriesPlaced.push(sequence.category);
            const categorizedSequencesArray = [];
            const categorizedSequencesToIterate = _.cloneDeep(show?.sequences);
            _.map(categorizedSequencesToIterate, (categorizedSequence) => {
              if (categorizedSequence.visible) {
                if (categorizedSequence.category === sequence.category) {
                  sequenceImageElement = [<></>];
                  if (categorizedSequence && categorizedSequence.imageUrl && categorizedSequence.imageUrl.replace(/\s/g, '').length) {
                    const classname = `sequence-image sequence-image-${categorizedSequence.index}`;
                    sequenceImageElement = (
                      <img
                        alt={categorizedSequence.name}
                        className={classname}
                        src={categorizedSequence.imageUrl}
                        data-key={categorizedSequence.name}
                      />
                    );
                  }
                  const categorizedJukeboxListClassname = `jukebox-list jukebox-list-${categorizedSequence.index}`;
                  const categorizedJukeboxListArtistClassname = `jukebox-list-artist jukebox-list-artist-${categorizedSequence.index}`;
                  const theElement = (
                    <>
                      <div
                        className={categorizedJukeboxListClassname}
                        onClick={(e) => stickyReadOnlyReason ? _.noop() : addSequenceToQueue(e)}
                        data-key={categorizedSequence.name}
                      >
                        {sequenceImageElement}
                        {categorizedSequence.displayName}
                        <div data-key={categorizedSequence.name} className={categorizedJukeboxListArtistClassname}>
                          {categorizedSequence.artist}
                        </div>
                      </div>
                    </>
                  );
                  categorizedSequencesArray.push(theElement);
                }
              }
            });

            sequencesElement.push(
              <>
                <div className="category-section ">
                  <div className="category-label">{sequence.category}</div>
                  {categorizedSequencesArray}
                </div>
              </>
            );
          }

          jukeboxRequestsElement = [];
          let updatedRequests = show?.requests;
          updatedRequests = _.orderBy(updatedRequests, ['position'], ['asc']);
          _.map(updatedRequests, (request, index) => {
            // Don't add Playing Now or Next Playing to list
            if (index !== 0) {
              let sequenceImageElement = [<></>];
              if (request?.sequence && request?.sequence.imageUrl && request?.sequence.imageUrl.replace(/\s/g, '').length) {
                const classname = `sequence-image sequence-image-${request?.sequence.index}`;
                sequenceImageElement = (
                  <img alt={request?.sequence.name} className={classname} src={request?.sequence.imageUrl} data-key={request?.sequence.name} />
                );
                jukeboxRequestsElement.push(
                  <>
                    <div className="jukebox-queue">
                      {sequenceImageElement}
                      {request?.sequence?.displayName}
                      <div className={jukeboxListArtistClassname}>{request?.sequence.artist}</div>
                    </div>
                  </>
                );
              } else {
                jukeboxRequestsElement.push(
                  <>
                    <div className="jukebox-queue">
                      {request?.sequence?.displayName}
                      <div className={jukeboxListArtistClassname}>{request?.sequence.artist}</div>
                    </div>
                  </>
                );
              }
            }
          });
        }
      }
    });

    const locationCodeElement = (
      <>
        <TextField type="number" name="locationCode" onChange={(e) => setEnteredLocationCode(e?.target?.value)} />
      </>
    );

    instructions = processingInstructions(
      processNodeDefinitions,
      show?.preferences?.viewerControlEnabled,
      show?.preferences?.viewerControlMode,
      show?.preferences?.locationCheckMethod,
      sequencesElement,
      jukeboxRequestsElement,
      playingNow,
      playingNext,
      show?.requests?.length,
      locationCodeElement,
      formattedNowPlayingTimer
    );

    const reactHtml = htmlToReactParser.parseWithInstructions(parsedViewerPage, isValidNode, instructions);
    setRemoteViewerReactPage(reactHtml);
  }, [activeViewerPage, show?.playingNow, show?.preferences?.jukeboxDepth, show?.preferences?.viewerControlEnabled, show?.preferences?.viewerControlMode, show?.preferences?.locationCheckMethod, show?.playingNext, show?.sequences, show?.requests, show?.votes, show?.playingNowSequence, show?.playingNextSequence, nowPlayingTimer, stickyReadOnlyReason, displayCurrentReadOnlyMessages, voteForSequence, addSequenceToQueue]);

  const getActiveViewerPage = useCallback(() => {
    getActiveViewerPageQuery({
      context: {
        headers: {
          Route: 'Viewer'
        }
      },
      variables: {
        showSubdomain: getSubdomain()
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        setActiveViewerPage(data?.getActiveViewerPage);
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    });
  }, [dispatch, getActiveViewerPageQuery]);

  const orderSequencesForVoting = useCallback((showData) => {
    let updatedSequences = [];
    _.forEach(showData?.sequences, (sequence) => {
      const sequenceVotes = _.find(
        showData?.votes,
        (vote) => vote?.sequence?.name === sequence?.name || vote?.sequenceGroup?.name === sequence?.name
      );
      updatedSequences.push({
        ...sequence,
        votes: sequenceVotes?.votes || 0,
        lastVoteTime: sequenceVotes?.lastVoteTime
      });
    });
    updatedSequences = _.orderBy(updatedSequences, ['votes', 'lastVoteTime'], ['desc', 'asc']);
    showData.sequences = updatedSequences;
  }, []);

  const getShowForInit = useCallback(() => {
    getShowQuery({
      context: {
        headers: {
          Route: 'Viewer'
        }
      },
      variables: {
        showSubdomain: getSubdomain()
      },
      onCompleted: async (data) => {
        const showData = { ...data?.getShow };

        const subdomain = getSubdomain();

        if (showData?.preferences?.selfHostedRedirectUrl) {
          const referrer = document.referrer;
          if (!_.includes(blockRedirectReferrers, referrer)) {
            window.location.href = showData?.preferences?.selfHostedRedirectUrl;
            return; // Exit early since we're redirecting
          }
        }

        if (subdomain === showData?.showSubdomain) {
          if (showData?.playingNext === '') {
            showData.playingNext = showData?.playingNextFromSchedule;
          }
          setNowPlaying(showData?.playingNow);
          if (showData?.preferences?.viewerControlMode === ViewerControlMode.VOTING) {
            orderSequencesForVoting(showData);
          }
          setShow(showData);
          getActiveViewerPage();
          refreshViewerLocationForShow(showData);
          trackPosthogEvent('viewer_page_view', { show_name: showData?.showName });

          setTimeout(() => {
            loadViewerEnhancements(showData);
          }, 500);

          setLoading(false);
        }
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    }).then();
  }, [getShowQuery, blockRedirectReferrers, getActiveViewerPage, orderSequencesForVoting, refreshViewerLocationForShow, loadViewerEnhancements, dispatch]);

  useEffect(() => {
    const init = async () => {
      if (hasInitializedRef.current) {
        return;
      }
      hasInitializedRef.current = true;
      setLoading(true);

      getShowForInit();
      insertViewerPageStatsMutation({
        context: {
          headers: {
            Route: 'Viewer'
          }
        },
        variables: {
          showSubdomain: getSubdomain(),
          date: moment().format('YYYY-MM-DDTHH:mm:ss')
        }
      }).then();
    };

    init().then();
  }, [getShowForInit, insertViewerPageStatsMutation]);

  // Process polling data updates
  useEffect(() => {
    if (pollingData?.getShow) {
      const showData = { ...pollingData.getShow };
      const subdomain = getSubdomain();
      if (subdomain === showData?.showSubdomain) {
        if (showData?.playingNext === '') {
          showData.playingNext = showData?.playingNextFromSchedule;
        }
        if (showData?.preferences?.viewerControlMode === ViewerControlMode.VOTING) {
          orderSequencesForVoting(showData);
        }
        setShow(showData);
        refreshViewerLocationForShow(showData);
        // Note: We don't fetch the active viewer page HTML during polling
        // It's only fetched on initial load and doesn't change during a viewer session
      }
    }
  }, [pollingData, orderSequencesForVoting, refreshViewerLocationForShow]);

  useInterval(async () => {
    await convertViewerPageToReact();
    getDynamicReadOnlyReason();
  }, 500);

  useInterval(async () => {
    if (nowPlaying !== show?.playingNow) {
      const playingNowSequence = _.find(show?.sequences, (sequence) => sequence?.displayName === show?.playingNow);
      setNowPlaying(show?.playingNow);
      setNowPlayingTimer(playingNowSequence?.duration - 2);
    }
    if (show?.playingNow === '' || show?.playingNow === ' ') {
      setNowPlaying('');
      setNowPlayingTimer(0);
    } else if (nowPlayingTimer && nowPlayingTimer > 0) {
      setNowPlayingTimer(nowPlayingTimer - 1);
    }
  }, 1000);

  return (
    <>
      {show && (
        <Helmet>
          <style type="text/css">
            {`
              #embedim--snow {
                text-align: inherit;
              }
            `}
          </style>
          <title>{show?.preferences?.pageTitle}</title>
          <link rel="icon" href={show?.preferences?.pageIconUrl} />
        </Helmet>
      )}
      <Loading loading={loading} background="black" loaderColor="white" />
      {stickyReadOnlyReason && !hasHtmlReadOnlyMessages && (
        <div
          className="interactionStatusBanner"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            margin: '12px auto',
            maxWidth: '90%',
            padding: '12px 16px',
            background: 'rgba(142, 59, 46, 0.9)',
            color: '#FFF2EE',
            border: '1px solid #A9574C',
            borderRadius: 10,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {viewerReadOnlyMessages[stickyReadOnlyReason]}
        </div>
      )}
      {remoteViewerReactPage}
    </>
  );
};

export default ExternalViewerPage;
