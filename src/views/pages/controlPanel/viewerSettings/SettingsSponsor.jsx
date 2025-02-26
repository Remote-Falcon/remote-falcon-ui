import * as React from 'react';

import { Grid, Link, Stack, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import mixpanel from 'mixpanel-browser';

import wlLogo from '../../../../assets/images/WL.png';
import SubCard from '../../../../ui-component/cards/SubCard';

const SettingsSponsor = () => {
  const theme = useTheme();

  const goToSponsor = () => {
    mixpanel.track('Sponsor Click', {
      Sponsor: 'Wallys Lights'
    });
    window.open('https://wallyslights.com', '_blank').focus();
  };

  return (
    <Grid item xs={12} md={12}>
      <SubCard>
        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Typography variant="h2" color={theme.palette.secondary.main}>
            Remote Falcon Settings Sponsored by:
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor}>
            <Box component="img" sx={{ width: 300 }} alt="Wallys Lights" src={wlLogo} />
          </Link>
        </Stack>
      </SubCard>
    </Grid>
  );
};

export default SettingsSponsor;
