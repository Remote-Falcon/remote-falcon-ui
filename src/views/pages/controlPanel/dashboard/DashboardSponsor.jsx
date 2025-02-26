import * as React from 'react';

import { Grid, Link, Stack, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import mixpanel from 'mixpanel-browser';

import SubCard from '../../../../ui-component/cards/SubCard';

const DashboardSponsor = () => {
  const theme = useTheme();

  const goToSponsor = () => {
    mixpanel.track('Sponsor Click', {
      Sponsor: 'YPS'
    });
    window.open('https://yourpixelstore.com/', '_blank').focus();
  };

  return (
    <Grid item xs={12} md={12}>
      <SubCard>
        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Typography variant="h2" color={theme.palette.secondary.main}>
            Dashboard Sponsored by:
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor}>
            <Box
              component="img"
              sx={{ width: 250 }}
              alt="Your Pixel Store"
              src="https://yourpixelstore.com/wp-content/uploads/2023/04/your-pixel-store.png"
            />
          </Link>
        </Stack>
      </SubCard>
    </Grid>
  );
};

export default DashboardSponsor;
