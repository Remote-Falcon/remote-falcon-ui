import { Box, Grid } from '@mui/material';
import mixpanel from 'mixpanel-browser';

import { gridSpacing } from 'store/constant';

import DashboardCharts from './DashboardCharts';
import DashboardHeader from './DashboardHeader';
import DashboardSponsor from './DashboardSponsor';

const Dashboard = () => {
  mixpanel.track('Page View', {
    Page: 'Dashboard'
  });
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={gridSpacing}>
        <DashboardSponsor />
        <DashboardHeader />
        <DashboardCharts />
      </Grid>
    </Box>
  );
};

export default Dashboard;
