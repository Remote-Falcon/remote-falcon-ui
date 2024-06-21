import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';

import { useLazyQuery, useMutation } from '@apollo/client';
import { Box, Grid, Stack, Typography, Switch, CardActions } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import _ from 'lodash';

import { useDispatch, useSelector } from 'store';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

import { flags } from '../../../../index';
import { savePreferencesService } from '../../../../services/controlPanel/mutations.service';
import { setShow } from '../../../../store/slices/show';
import { UPDATE_PREFERENCES } from '../../../../utils/graphql/controlPanel/mutations';
import { SHOWS_ON_MAP } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';
import TrackerRow from '../tracker/TrackerRow';

const ShowsMap = () => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [showsOnMap, setShowsOnMap] = useState([]);

  const [updatePreferencesMutation] = useMutation(UPDATE_PREFERENCES);
  const [showsOnMapQuery] = useLazyQuery(SHOWS_ON_MAP);

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

  const containerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: 41.69194824042432,
    lng: -97.64580975379515
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process?.env?.REACT_APP_GOOGLE_MAPS_KEY
  });

  useEffect(() => {
    getShowsOnMap();
  }, [getShowsOnMap]);

  return (
    <Box sx={{ mt: 2 }}>
      {flags.ShowMap.isEnabled() ? (
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
              {isLoaded ? (
                <CardActions sx={{ height: '39em' }}>
                  <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={3}>
                    <>
                      {_.map(showsOnMap, (show) => (
                        <Marker position={{ lat: show?.location?.lat, lng: show?.location?.lng }} title={show?.showName} />
                      ))}
                    </>
                    <></>
                  </GoogleMap>
                </CardActions>
              ) : (
                <></>
              )}
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
