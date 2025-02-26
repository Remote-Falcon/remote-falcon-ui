import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';

import { useLazyQuery, useMutation } from '@apollo/client';
import { Box, Grid, Stack, Typography, Switch, CardActions } from '@mui/material';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import _ from 'lodash';

import { useDispatch, useSelector } from '../../../../store';
import { gridSpacing } from '../../../../store/constant';
import MainCard from '../../../../ui-component/cards/MainCard';
import TrackerSkeleton from '../../../../ui-component/cards/Skeleton/TrackerSkeleton';

import { savePreferencesService } from '../../../../services/controlPanel/mutations.service';
import { setShow } from '../../../../store/slices/show';
import RFLoadingButton from '../../../../ui-component/RFLoadingButton';
import { UPDATE_PREFERENCES } from '../../../../utils/graphql/controlPanel/mutations';
import { SHOWS_ON_MAP } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';
import MarkerWithInfo from './MarkerWithInfo';

const ShowsMap = () => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showsOnMap, setShowsOnMap] = useState([]);
  const [detectedLocation, setDetectedLocation] = useState({ lat: 0, long: 0 });

  const [updatePreferencesMutation] = useMutation(UPDATE_PREFERENCES);
  const [showsOnMapQuery] = useLazyQuery(SHOWS_ON_MAP);

  const detectLocation = useCallback(async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const showLatitude = parseFloat(position.coords.latitude.toFixed(5));
        const showLongitude = parseFloat(position.coords.longitude.toFixed(5));
        if (showLatitude === 0 || showLongitude === 0) {
          showAlert(dispatch, { alert: 'warning', message: 'Location cannot be accurately detected' });
          return;
        }
        setDetectedLocation({ lat: showLatitude, long: showLongitude });
      });
    } else {
      showAlert(dispatch, { alert: 'warning', message: 'Location is not enabled' });
    }
  }, [dispatch]);

  const getShowsOnMap = useCallback(async () => {
    setIsLoading(true);
    await showsOnMapQuery({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        const shows = [];
        _.forEach(data?.showsOnAMap, (show) => {
          shows.push({
            showName: show?.showName,
            location: {
              lat: show?.showLatitude,
              lng: show?.showLongitude
            }
          });
        });
        setShowsOnMap(shows);
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    });
    setIsLoading(false);
  }, [dispatch, showsOnMapQuery]);

  const handleShowMyShowSwitch = (event, value) => {
    if (value) {
      let showLatitude = show?.preferences?.showLatitude;
      let showLongitude = show?.preferences?.showLongitude;
      if (showLatitude === null || showLongitude === null) {
        showLatitude = detectedLocation.lat;
        showLongitude = detectedLocation.long;
      }
      const updatedPreferences = _.cloneDeep({
        ...show?.preferences,
        showOnMap: value,
        showLatitude,
        showLongitude
      });
      savePreferencesService(updatedPreferences, updatePreferencesMutation, (response) => {
        dispatch(
          setShow({
            ...show,
            preferences: {
              ...updatedPreferences
            }
          })
        );
        showAlert(dispatch, response?.toast);
        getShowsOnMap();
      });
    } else {
      const updatedPreferences = _.cloneDeep({
        ...show?.preferences,
        showOnMap: value
      });
      savePreferencesService(updatedPreferences, updatePreferencesMutation, (response) => {
        dispatch(
          setShow({
            ...show,
            preferences: {
              ...updatedPreferences
            }
          })
        );
        showAlert(dispatch, response?.toast);
        getShowsOnMap();
      });
    }
  };

  const updateToDetectedLocation = () => {
    if (detectedLocation.lat === 0 || detectedLocation.long === 0) {
      showAlert(dispatch, { alert: 'warning', message: 'Location cannot be accurately detected' });
      return;
    }
    const updatedPreferences = _.cloneDeep({
      ...show?.preferences,
      showLatitude: detectedLocation.lat,
      showLongitude: detectedLocation.long
    });
    savePreferencesService(updatedPreferences, updatePreferencesMutation, (response) => {
      dispatch(
        setShow({
          ...show,
          preferences: {
            ...updatedPreferences
          }
        })
      );
      showAlert(dispatch, response?.toast);
      getShowsOnMap();
    });
  };

  const center = {
    lat: 41.69194824042432,
    lng: -97.64580975379515
  };

  useEffect(() => {
    detectLocation();
    getShowsOnMap();
  }, [detectLocation, getShowsOnMap]);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title="Remote Falcon Shows Map" content={false}>
            {isLoading ? (
              <TrackerSkeleton />
            ) : (
              <>
                <CardActions>
                  <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
                    <Grid item xs={12} md={6} lg={4}>
                      <Stack direction="row" spacing={2} pb={1}>
                        <Typography variant="h4">Show {show?.showName} on the Map</Typography>
                      </Stack>
                      <Typography component="div" variant="caption">
                        If enabled, {show?.showName}&apos;s location will be displayed on the Remote Falcon Shows Map.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Switch
                        name="displayShowOnMap"
                        color="primary"
                        checked={show?.preferences?.showOnMap}
                        onChange={handleShowMyShowSwitch}
                      />
                    </Grid>
                  </Grid>
                </CardActions>
                {show?.preferences?.showOnMap && (
                  <CardActions>
                    <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
                      <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="h4" display="inline">
                          Current Show Location:
                          <Typography variant="h4" display="inline" color="primary" ml={1}>
                            {show?.preferences?.showLatitude}, {show?.preferences?.showLongitude}
                          </Typography>
                        </Typography>
                        <Typography variant="h4">
                          Detected Location:
                          <Typography variant="h4" display="inline" color="primary" ml={5.2}>
                            {detectedLocation.lat}, {detectedLocation.long}
                          </Typography>
                        </Typography>
                        <Typography component="div" variant="caption">
                          If your show location on the map is not accurate, click Update to Detected Location to set your shows location to
                          the current detected location.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6} lg={4}>
                        <RFLoadingButton onClick={updateToDetectedLocation} color="primary" disabled={!show?.preferences?.showOnMap}>
                          Update to Detected Location
                        </RFLoadingButton>
                      </Grid>
                    </Grid>
                  </CardActions>
                )}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h3" align="center" color="secondary">
                    Total Shows on Map: {showsOnMap?.length}
                  </Typography>
                </Box>
                <CardActions sx={{ height: '39em' }}>
                  <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY} onLoad={() => setMapLoaded(true)}>
                    {mapLoaded && (
                      <Map mapId="972618e58193992a" defaultZoom={1} defaultCenter={center}>
                        {_.map(showsOnMap, (show) => (
                          <MarkerWithInfo position={show?.location} showName={show?.showName} />
                        ))}
                      </Map>
                    )}
                  </APIProvider>
                </CardActions>
              </>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShowsMap;
