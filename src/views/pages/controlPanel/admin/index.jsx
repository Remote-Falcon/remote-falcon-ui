import * as React from 'react';
import { useState } from 'react';

import { Box, Grid, LinearProgress, CardContent } from '@mui/material';
import _ from 'lodash';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import PersonOutlineTwoToneIcon from '@mui/icons-material/PersonOutlineTwoTone';
import { useTheme } from '@mui/material/styles';

import { useSelector } from '../../../../store';
import { gridSpacing } from '../../../../store/constant';
import MainCard from '../../../../ui-component/cards/MainCard';
import { RFTabPanel, RFTab } from '../../../../ui-component/RFTabPanel';
import AccountDetails from './AccountDetails';
import WattsonFeedback from './WattsonFeedback';

const Admin = () => {
  const theme = useTheme();
  const { show } = useSelector((state) => state.show);

  const [showLinearProgress, setShowLinearProgress] = useState(false);

  const tabOptions = [
    {
      label: 'Wattson Feedback',
      icon: <PersonOutlineTwoToneIcon />,
      caption: 'Ask Wattson Feedback'
    },
    {
      label: 'Account Maintenance',
      icon: <DescriptionTwoToneIcon />,
      caption: 'Account Maintenance'
    }
  ];

  return show.showRole === 'ADMIN' ? (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title="Remote Falcon Admin" content={false}>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12}>
                {showLinearProgress && <LinearProgress />}
              </Grid>
              <Grid item xs={12} lg={4}>
                <CardContent>
                  <RFTabPanel tabOptions={tabOptions} orientation="vertical" />
                </CardContent>
              </Grid>
              <Grid item xs={12} lg={8}>
                <CardContent
                  sx={{
                    borderLeft: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[200],
                    height: '100%'
                  }}
                >
                  <>
                    <RFTab index={0} value="WattsonFeedback">
                      <WattsonFeedback />
                    </RFTab>
                    <RFTab index={1} value="AccountMaintenance">
                      <AccountDetails />
                    </RFTab>
                  </>
                </CardContent>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  ) : (
    <></>
  );
};

export default Admin;
