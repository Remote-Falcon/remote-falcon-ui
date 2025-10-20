
import newAxios from 'axios';
import { Grid } from '@mui/material';

import MainCard from '../../../../ui-component/cards/MainCard';
import RFLoadingButton from '../../../../ui-component/RFLoadingButton';

const FPPTest = ({ }) => {
  const getFPPVersion = async () => {
    newAxios.get('http://192.168.68.156/api/fppd/version');
  };

  return (
    <Grid item xs={12}>
      <MainCard content={false}>
        <RFLoadingButton sx={{ ml: 3 }} color="error" onClick={() => getFPPVersion()}>
          Get Feedback
        </RFLoadingButton>
      </MainCard>
    </Grid>
  );
};

export default FPPTest;
