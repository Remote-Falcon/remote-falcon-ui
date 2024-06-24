import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';

import { useLazyQuery, useMutation } from '@apollo/client';
import { Box, Grid, Stack, Typography, Switch, CardActions } from '@mui/material';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import _ from 'lodash';
import { useFeatureFlagEnabled } from 'posthog-js/react';

import { useDispatch, useSelector } from 'store';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

import { savePreferencesService } from '../../../../services/controlPanel/mutations.service';
import { setShow } from '../../../../store/slices/show';
import { UPDATE_PREFERENCES } from '../../../../utils/graphql/controlPanel/mutations';
import { SHOWS_ON_MAP } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';
import MarkerWithInfo from './MarkerWithInfo';

const ShowsMap = () => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [showsOnMap, setShowsOnMap] = useState([]);

  const [updatePreferencesMutation] = useMutation(UPDATE_PREFERENCES);
  const [showsOnMapQuery] = useLazyQuery(SHOWS_ON_MAP);

  const rfShowMapEnabled = useFeatureFlagEnabled('rf-show-map');

  const getShowsOnMap = useCallback(async () => {
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
  }, [dispatch, showsOnMapQuery]);

  const handleShowMyShowSwitch = (event, value) => {
    if (value) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          let showLatitude = show?.preferences?.showLatitude;
          let showLongitude = show?.preferences?.showLongitude;
          if (showLatitude === null || showLongitude === null) {
            showLatitude = parseFloat(position.coords.latitude.toFixed(5));
            showLongitude = parseFloat(position.coords.longitude.toFixed(5));
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
        });
      } else {
        showAlert(dispatch, { alert: 'warning', message: 'Location is not enabled' });
      }
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

  const center = {
    lat: 41.69194824042432,
    lng: -97.64580975379515
  };

  useEffect(() => {
    getShowsOnMap();
  }, [getShowsOnMap]);

  return (
    <Box sx={{ mt: 2 }}>
      {rfShowMapEnabled ? (
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <MainCard title="Remote Falcon Shows Map" content={false}>
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
              <CardActions sx={{ height: '39em' }}>
                <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY} onLoad={() => setMapLoaded(true)}>
                  {mapLoaded && (
                    <Map mapId="972618e58193992a" defaultZoom={1} defaultCenter={center}>
                      {_.map(showsOnMap, (show) => (
                        <MarkerWithInfo position={show?.location} showName={show?.showName} />
                      ))}
                    </Map>
                  )}
                </APIProvider>
              </CardActions>
            </MainCard>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default ShowsMap;
