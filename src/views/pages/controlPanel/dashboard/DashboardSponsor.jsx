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
            Remote Falcon Vendor Sponsors:
          </Typography>
        </Stack>
        <Stack direction="row" spacing={8} justifyContent="center">
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://png.pngtree.com/png-clipart/20230804/original/pngtree-sponsored-by-stamp-vector-sign-vector-picture-image_9538217.png"
              />
              <Typography variant="h4">TwinkleTech</Typography>
            </Stack>
          </Link>
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://png.pngtree.com/png-vector/20220915/ourmid/pngtree-sponsored-by-sign-submit-red-vector-png-image_14530210.png"
              />
              <Typography variant="h4">GlowPro Lights</Typography>
            </Stack>
          </Link>
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://azvizslarescue.com/wp-content/uploads/2023/05/Title_Sponsor.png"
              />
              <Typography variant="h4">SparkWave Electronics</Typography>
            </Stack>
          </Link>
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://www.emeraldcoasttroyalumni.com/uploads/1/1/8/0/118037957/s720619751102830131_p13_i3_w623.png"
              />
              <Typography variant="h4">PixelWorks Supply</Typography>
            </Stack>
          </Link>
        </Stack>


        <Stack direction="row" spacing={8} justifyContent="center">
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://stuorgs.engineering.iastate.edu/dbia/files/2012/04/Gold-good.png"
              />
              <Typography variant="h4">Holiday Hub</Typography>
            </Stack>
          </Link>
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://e7.pngegg.com/pngimages/974/719/png-clipart-logo-brand-sponsor-iran-national-football-team-optic-gaming-shirt-text-team-thumbnail.png"
              />
              <Typography variant="h4">BrightBeam Co.</Typography>
            </Stack>
          </Link>
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://w7.pngwing.com/pngs/1016/436/png-transparent-medal-gold-sponsor-logo-silver-medal-emblem-label-medal.png"
              />
              <Typography variant="h4">LightForge Systems</Typography>
            </Stack>
          </Link>
          <Link style={{ cursor: 'pointer' }} onClick={goToSponsor} underline="none">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                sx={{ width: 50 }}
                alt="Sponsor"
                src="https://e7.pngegg.com/pngimages/874/194/png-clipart-logo-fila-brand-pahang-fa-sponsor-timberland-blue-text-thumbnail.png"
              />
              <Typography variant="h4">FestiLume</Typography>
            </Stack>
          </Link>
        </Stack>
      </SubCard>
    </Grid>
  );
};

export default DashboardSponsor;

