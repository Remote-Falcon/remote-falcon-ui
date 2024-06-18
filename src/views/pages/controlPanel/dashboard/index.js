import { Box, Grid } from '@mui/material';

import { gridSpacing } from 'store/constant';

import DashboardCharts from './DashboardCharts';
import DashboardHeader from './DashboardHeader';
import DashboardSponsor from './DashboardSponsor';

const Dashboard = () => (
  <Box sx={{ mt: 2 }}>
    <Grid container spacing={gridSpacing}>
      <DashboardSponsor />
      <DashboardHeader />
      <DashboardCharts />
    </Grid>
  </Box>
);

export default Dashboard;
