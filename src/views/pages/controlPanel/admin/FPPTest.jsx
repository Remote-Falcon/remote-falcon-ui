import { useState } from 'react';
import newAxios from 'axios';
import { Grid, TextField } from '@mui/material';

import MainCard from '../../../../ui-component/cards/MainCard';
import RFLoadingButton from '../../../../ui-component/RFLoadingButton';

const FPPTest = ({ }) => {

  const [url, setUrl] = useState('');

  const getFPPVersion = async () => {
    newAxios.get(url);
  };

  return (
    <Grid item xs={12}>
      <MainCard content={false}>
        <TextField
          type="text"
          fullWidth
          label="URL"
          value={url}
          onChange={(e) => setUrl(e?.target?.value)}
        />
        <RFLoadingButton sx={{ ml: 3 }} color="error" onClick={() => getFPPVersion()}>
          Get Feedback
        </RFLoadingButton>
      </MainCard>
    </Grid>
  );
};

export default FPPTest;
