import { useEffect, useCallback } from 'react';
import * as React from 'react';

import { Grid, Link, Stack, Typography, Divider, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import SubCard from 'ui-component/cards/SubCard';

import { gridSpacing } from '../../../../store/constant';

const DashboardSponsor = () => {
  const theme = useTheme();

  return (
    <Grid item xs={12} md={12}>
      <SubCard>
        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Typography variant="h2" color={theme.palette.secondary.main}>
            Dashboard Sponsored by:
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link href="https://yourpixelstore.com/" target="_blank">
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
