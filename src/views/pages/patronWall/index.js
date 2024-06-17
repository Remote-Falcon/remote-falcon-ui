import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';

import { Grid, Container, Box, LinearProgress, Typography, Divider, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { withStyles } from '@mui/styles';

import { useDispatch } from 'store';
import { gridSpacing } from 'store/constant';

import axios from '../../../utils/axios';

const PatronWall = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [showLinearProgress, setShowLinearProgress] = useState(false);
  const [patrons, setPatrons] = useState([]);
  const [patronProgress, setPatronProgress] = useState(0);

  const fetchPatronWall = useCallback(async () => {
    setShowLinearProgress(true);
    const patronGoal = 150;
    const response = await axios.get('/controlPanel/patrons');
    setShowLinearProgress(false);
    setPatronProgress(Math.round((response?.data?.length / patronGoal) * 100));
    setPatrons(response?.data);
  }, [setPatrons, setShowLinearProgress]);

  useEffect(() => {
    fetchPatronWall();

    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.setAttribute('src', 'https://c6.patreon.com/becomePatronButton.bundle.js');
    head.appendChild(script);
  }, [fetchPatronWall]);

  const BorderLinearProgress = withStyles(() => ({
    root: {
      height: 15,
      borderRadius: 5
    },
    bar: {
      borderRadius: 5
    }
  }))(LinearProgress);

  return (
    <Container sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h1" align="center">
          Patron Wall
        </Typography>
        <Divider sx={{ mt: 1 }} />
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            {showLinearProgress && <LinearProgress />}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h2" align="center">
              Thank you to all of the Patrons who support Remote Falcon!
            </Typography>
            <Typography variant="h3" align="center" sx={{ mt: 4 }}>
              Patron Goal - 150
            </Typography>
            <Box margin="auto" justifyContent="center" position="relative" display="flex">
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs>
                  <BorderLinearProgress variant="determinate" color="secondary" value={patronProgress} />
                </Grid>
                <Grid item>
                  <Typography variant="caption">{Math.round(patronProgress)}%</Typography>
                </Grid>
              </Grid>
            </Box>
            <Grid container justifyContent="center" spacing={2} sx={{ mt: 6, mb: 4 }}>
              {patrons.map((patron) => (
                <Grid item xs={12} md={4} lg={2}>
                  <Typography variant="h4" align="center">
                    {patron?.fullName}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Typography variant="h4" align="center" sx={{ mt: 6 }}>
              <a href="https://www.patreon.com/RemoteFalcon" target="_blank" rel="noreferrer">
                <img src="https://icon-library.com/images/patreon-icon-png/patreon-icon-png-29.jpg" alt="become-a-patron" width="278" />
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PatronWall;
