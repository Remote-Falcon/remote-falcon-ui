/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useState } from 'react';

import { useLazyQuery, useMutation } from '@apollo/client';
import { TextField } from '@mui/material';
import newAxios from 'axios';
import htmlToReact from 'html-to-react';
import sign from 'jwt-encode';
import loadjs from 'loadjs';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import moment from 'moment';
import Loading from 'react-fullscreen-loading';
import { Helmet } from 'react-helmet';

import useInterval from '../../../hooks/useInterval';
import { useDispatch } from '../../../store';
import { getSubdomain } from '../../../utils/route-guard/helpers/helpers';

import { addSequenceToQueueService, voteForSequenceService } from '../../../services/viewer/mutations.service';
import { LocationCheckMethod, ViewerControlMode } from '../../../utils/enum';
import { ADD_SEQUENCE_TO_QUEUE, INSERT_VIEWER_PAGE_STATS, VOTE_FOR_SEQUENCE } from '../../../utils/graphql/viewer/mutations';
import { GET_SHOW } from '../../../utils/graphql/viewer/queries';
import { showAlert } from '../globalPageHelpers';
import { defaultProcessingInstructions, processingInstructions, viewerPageMessageElements } from './helpers/helpers';

const ExternalViewerPage = () => {
  const dispatch = useDispatch();

  const blockRedirectReferrers = ['https://player.pulsemesh.io/'];
  const baseGithubPath = 'https://raw.githubusercontent.com/Remote-Falcon/remote-falcon-viewer-page-js/refs/heads/main/';
  const baseCdnPath = 'https://cdn.jsdelivr.net/gh/Remote-Falcon/remote-falcon-viewer-page-js@main/';

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

  const [getShowQuery] = useLazyQuery(GET_SHOW);
  const [insertViewerPageStatsMutation] = useMutation(INSERT_VIEWER_PAGE_STATS);
  const [addSequenceToQueueMutation] = useMutation(ADD_SEQUENCE_TO_QUEUE);
  const [voteForSequenceMutation] = useMutation(VOTE_FOR_SEQUENCE);

  const setViewerLocation = useCallback(async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewerLatitude(position.coords.latitude.toFixed(5));
        setViewerLongitude(position.coords.longitude.toFixed(5));
      });
    }
  }, []);

  const showViewerMessage = useCallback(
    (response) => {
      const errorMessage = response?.error?.graphQLErrors[0]?.extensions?.message;
      if (response?.success) {
        viewerPageMessageElements.requestSuccessful.current = viewerPageMessageElements?.requestSuccessful?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Success'
        });
      } else if (errorMessage === 'NAUGHTY') {
        // Do nothing, say nothing
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Naughty'
        });
      } else if (errorMessage === 'SEQUENCE_REQUESTED') {
        viewerPageMessageElements.requestPlaying.current = viewerPageMessageElements?.requestPlaying?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Sequence Already Requested'
        });
      } else if (errorMessage === 'INVALID_LOCATION') {
        viewerPageMessageElements.invalidLocation.current = viewerPageMessageElements?.invalidLocation?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Invalid Location'
        });
      } else if (errorMessage === 'QUEUE_FULL') {
        viewerPageMessageElements.queueFull.current = viewerPageMessageElements?.queueFull?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Queue Full'
        });
      } else if (errorMessage === 'INVALID_CODE') {
        viewerPageMessageElements.invalidLocationCode.current = viewerPageMessageElements?.invalidLocationCode?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Invalid Code'
        });
      } else if (errorMessage === 'ALREADY_VOTED') {
        viewerPageMessageElements.alreadyVoted.current = viewerPageMessageElements?.alreadyVoted?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Already Voted'
        });
      } else if (errorMessage === 'ALREADY_REQUESTED') {
        viewerPageMessageElements.alreadyRequested.current = viewerPageMessageElements?.alreadyRequested?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Viewer Already Requested'
        });
      } else {
        viewerPageMessageElements.requestFailed.current = viewerPageMessageElements?.requestFailed?.block;
        mixpanel.track('Viewer Interaction Result', {
          Result: 'Failed'
        });
      }
      setTimeout(() => {
        _.map(viewerPageMessageElements, (message) => {
          message.current = message?.none;
        });
      }, messageDisplayTime);
    },
    [messageDisplayTime]
  );

  const addSequenceToQueue = useCallback(
    async (e) => {
      const sequenceName = e.target.attributes.getNamedItem('data-key') ? e.target.attributes.getNamedItem('data-key').value : '';
      const sequenceDisplayName = e.target.attributes.getNamedItem('data-key-2')
        ? e.target.attributes.getNamedItem('data-key-2').value
        : null;
      mixpanel.track('Viewer Interaction', {
        Action: 'Add Sequence to Queue',
        Sequence: sequenceDisplayName != null ? sequenceDisplayName : sequenceName
      });
      if (show?.preferences?.enableGeolocation) {
        await setViewerLocation();
      }
      if (show?.preferences?.locationCheckMethod === LocationCheckMethod.CODE) {
        if (parseInt(enteredLocationCode, 10) !== parseInt(show?.preferences?.locationCode, 10)) {
          const invalidCodeResponse = {
            error: {
              graphQLErrors: [
                {
                  extensions: {
                    message: 'INVALID_CODE'
                  }
                }
              ]
            }
          };
          showViewerMessage(invalidCodeResponse);
          setEnteredLocationCode(null);
          return;
        }
      }
      addSequenceToQueueService(
        addSequenceToQueueMutation,
        getSubdomain(),
        sequenceName,
        viewerLatitude || 0.0,
        viewerLongitude || 0.0,
        (response) => {
          showViewerMessage(response);
        }
      );
    },
    [
      show?.preferences?.enableGeolocation,
      show?.preferences?.locationCheckMethod,
      show?.preferences?.locationCode,
      addSequenceToQueueMutation,
      viewerLatitude,
      viewerLongitude,
      setViewerLocation,
      enteredLocationCode,
      showViewerMessage
    ]
  );

  const voteForSequence = useCallback(
    async (e) => {
      const sequenceName = e.target.attributes.getNamedItem('data-key') ? e.target.attributes.getNamedItem('data-key').value : '';
      const sequenceDisplayName = e.target.attributes.getNamedItem('data-key-2')
        ? e.target.attributes.getNamedItem('data-key-2').value
        : null;
      mixpanel.track('Viewer Interaction', {
        Action: 'Vote for Sequence',
        Sequence: sequenceDisplayName != null ? sequenceDisplayName : sequenceName
      });
      if (show?.preferences?.enableGeolocation) {
        await setViewerLocation();
      }
      if (show?.preferences?.locationCheckMethod === LocationCheckMethod.CODE) {
        if (parseInt(enteredLocationCode, 10) !== parseInt(show?.preferences?.locationCode, 10)) {
          const invalidCodeResponse = {
            error: {
              graphQLErrors: [
                {
                  extensions: {
                    message: 'INVALID_CODE'
                  }
                }
              ]
            }
          };
          showViewerMessage(invalidCodeResponse);
          setEnteredLocationCode(null);
          return;
        }
      }
      voteForSequenceService(
        voteForSequenceMutation,
        getSubdomain(),
        sequenceName,
        viewerLatitude || 0.0,
        viewerLongitude || 0.0,
        (response) => {
          showViewerMessage(response);
        }
      );
    },
    [
      show?.preferences?.enableGeolocation,
      show?.preferences?.locationCheckMethod,
      show?.preferences?.locationCode,
      voteForSequenceMutation,
      viewerLatitude,
      viewerLongitude,
      setViewerLocation,
      enteredLocationCode,
      showViewerMessage
    ]
  );

  const displayCurrentViewerMessages = (parsedViewerPage) => {
    _.map(viewerPageMessageElements, (message) => {
      parsedViewerPage = parsedViewerPage?.replace(message?.element, message?.current);
    });
    return parsedViewerPage;
  };

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

    const sequencesElement = [];
    const categoriesPlaced = [];
    let jukeboxRequestsElement = [];

    let playingNow = <>{show?.playingNow}</>;
    let playingNext = <>{show?.playingNext}</>;

    _.map(show?.sequences, (sequence) => {
      if (sequence.visible && sequence.visibilityCount === 0) {
        let sequenceImageElement = [<></>];
        if (sequence && sequence.imageUrl && sequence.imageUrl.replace(/\s/g, '').length) {
          const classname = `sequence-image sequence-image-${sequence.key}`;
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
              const votingListClassname = `cell-vote-playlist cell-vote-playlist-${sequence.key}`;
              const votingListArtistClassname = `cell-vote-playlist-artist cell-vote-playlist-artist-${sequence.key}`;

              if (show?.playingNowSequence != null) {
                const playingNowSequence = show?.playingNowSequence;
                let sequenceImageElement = [<></>];
                if (playingNowSequence && playingNowSequence?.imageUrl && playingNowSequence?.imageUrl.replace(/\s/g, '').length) {
                  const classname = `sequence-image sequence-image-${playingNowSequence?.key}`;
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
                  const classname = `sequence-image sequence-image-${playingNextSequence?.key}`;
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
                    onClick={(e) => voteForSequence(e)}
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
                      const classname = `sequence-image sequence-image-${categorizedSequence.key}`;
                      sequenceImageElement = (
                        <img
                          alt={categorizedSequence.name}
                          className={classname}
                          src={categorizedSequence.imageUrl}
                          data-key={categorizedSequence.name}
                        />
                      );
                    }
                    const categorizedVotingListClassname = `cell-vote-playlist cell-vote-playlist-${sequence.key}`;
                    const categorizedVotingListArtistClassname = `cell-vote-playlist-artist cell-vote-playlist-artist-${sequence.key}`;
                    const theElement = (
                      <>
                        <div
                          className={categorizedVotingListClassname}
                          onClick={(e) => voteForSequence(e)}
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
          const jukeboxListClassname = `jukebox-list jukebox-list-${sequence.key}`;
          const jukeboxListArtistClassname = `jukebox-list-artist jukebox-list-artist-${sequence.key}`;

          if (show?.playingNowSequence != null) {
            const playingNowSequence = show?.playingNowSequence;
            let sequenceImageElement = [<></>];
            if (playingNowSequence && playingNowSequence?.imageUrl && playingNowSequence?.imageUrl.replace(/\s/g, '').length) {
              const classname = `sequence-image sequence-image-${playingNowSequence?.key}`;
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
              const classname = `sequence-image sequence-image-${playingNextSequence?.key}`;
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
                  onClick={(e) => addSequenceToQueue(e)}
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
                    const classname = `sequence-image sequence-image-${categorizedSequence.key}`;
                    sequenceImageElement = (
                      <img
                        alt={categorizedSequence.name}
                        className={classname}
                        src={categorizedSequence.imageUrl}
                        data-key={categorizedSequence.name}
                      />
                    );
                  }
                  const categorizedJukeboxListClassname = `jukebox-list jukebox-list-${categorizedSequence.key}`;
                  const categorizedJukeboxListArtistClassname = `jukebox-list-artist jukebox-list-artist-${categorizedSequence.key}`;
                  const theElement = (
                    <>
                      <div
                        className={categorizedJukeboxListClassname}
                        onClick={(e) => addSequenceToQueue(e)}
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
              _.map(show?.sequences, (sequence) => {
                if (request?.sequence?.name === sequence.name) {
                  let sequenceImageElement = [<></>];
                  if (sequence && sequence.imageUrl && sequence.imageUrl.replace(/\s/g, '').length) {
                    const classname = `sequence-image sequence-image-${sequence.key}`;
                    sequenceImageElement = (
                      <img alt={sequence.name} className={classname} src={sequence.imageUrl} data-key={sequence.name} />
                    );
                    jukeboxRequestsElement.push(
                      <>
                        <div className="jukebox-queue">
                          {sequenceImageElement}
                          {request?.sequence?.displayName}
                          <div className={jukeboxListArtistClassname}>{sequence.artist}</div>
                        </div>
                      </>
                    );
                  } else {
                    jukeboxRequestsElement.push(
                      <>
                        <div className="jukebox-queue">
                          {request?.sequence?.displayName}
                          <div className={jukeboxListArtistClassname}>{sequence.artist}</div>
                        </div>
                      </>
                    );
                  }
                }
              });
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
  }, [
    activeViewerPage,
    addSequenceToQueue,
    show?.requests,
    show?.playingNext,
    show?.playingNow,
    show?.preferences?.locationCheckMethod,
    show?.preferences?.jukeboxDepth,
    show?.preferences?.makeItSnow,
    show?.preferences?.viewerControlEnabled,
    show?.preferences?.viewerControlMode,
    show?.requests?.length,
    show?.sequences,
    voteForSequence,
    nowPlayingTimer
  ]);

  const getActiveViewerPage = (showData) => {
    _.forEach(showData?.pages, (page) => {
      if (page?.active) {
        setActiveViewerPage(page?.html);
      }
    });
  };

  const orderSequencesForVoting = (showData) => {
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
  };

  const getShow = useCallback(() => {
    getShowQuery({
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
        const showData = { ...data?.getShow };
        const subdomain = getSubdomain();
        if (subdomain === showData?.showSubdomain) {
          if (showData?.playingNext === '') {
            showData.playingNext = showData?.playingNextFromSchedule;
          }
          if (showData?.preferences?.viewerControlMode === ViewerControlMode.VOTING) {
            orderSequencesForVoting(showData);
          }
          setShow(showData);
          getActiveViewerPage(showData);
          if (showData?.preferences?.locationCheckMethod === LocationCheckMethod.GEO) {
            setViewerLocation();
          }
          setLoading(false);
        }
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    }).then();
  }, [dispatch, getShowQuery, setViewerLocation]);

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
          console.log('Referrer URL: ', referrer);
          if (!_.includes(blockRedirectReferrers, referrer)) {
            window.location.href = showData?.preferences?.selfHostedRedirectUrl;
          }
        } else if (subdomain === showData?.showSubdomain) {
          if (showData?.playingNext === '') {
            showData.playingNext = showData?.playingNextFromSchedule;
          }
          setNowPlaying(showData?.playingNow);
          if (showData?.preferences?.viewerControlMode === ViewerControlMode.VOTING) {
            orderSequencesForVoting(showData);
          }
          setShow(showData);
          getActiveViewerPage(showData);
          if (showData?.preferences?.locationCheckMethod === LocationCheckMethod.GEO) {
            setViewerLocation();
          }
          mixpanel.track('Viewer Page View', {
            Show_Name: showData?.showName
          });

          setTimeout(async () => {
            const config = {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            };
            await newAxios.get(`${baseGithubPath}scripts.json`, config).then(async (scriptsRes) => {
              _.forEach(scriptsRes?.data, (script) => {
                if (script === 'makeItSnow' && !showData?.preferences?.makeItSnow) {
                  return;
                }
                loadjs(`${baseCdnPath + script}.js`);
              });
            });
          }, 500);

          setLoading(false);
        }
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    }).then();
  }, [dispatch, getShowQuery, setViewerLocation]);

  useEffect(() => {
    const init = async () => {
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

  useInterval(() => {
    getShow();
  }, 2000);

  useInterval(async () => {
    await convertViewerPageToReact();
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
      <Loading loading={loading} background="black" loaderColor="white" />
      {remoteViewerReactPage}
    </>
  );
};

export default ExternalViewerPage;
