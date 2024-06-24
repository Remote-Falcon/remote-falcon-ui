import { useState, useCallback } from 'react';
import * as React from 'react';

import { Typography } from '@mui/material';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';

const MarkerWithInfo = ({ ...props }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const [infoWindowShown, setInfoWindowShown] = useState(false);

  // clicking the marker will toggle the infowindow
  const handleMarkerClick = useCallback(() => setInfoWindowShown((isShown) => !isShown), []);

  // if the maps api closes the infowindow, we have to synchronize our state
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <>
      <AdvancedMarker position={props.position} ref={markerRef} onClick={handleMarkerClick} />
      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose}>
          <Typography color="primary" variant="h3">
            {props?.showName}
          </Typography>
        </InfoWindow>
      )}
    </>
  );
};

export default MarkerWithInfo;
