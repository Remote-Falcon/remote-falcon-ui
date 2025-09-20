import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { CardContent, Grid, IconButton, Typography } from '@mui/material';

import MainCard from '../../../../ui-component/cards/MainCard';

const WattsonResponse = ({ handleClose, prompt, response}) => {
  return (
    <MainCard
      sx={{
        position: 'absolute',
        width: { xs: 450, lg: 450 },
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      title="Watttson Response"
      content={false}
      secondary={
        <IconButton onClick={handleClose} size="large">
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} sx={{ mb: 4 }}>
            <Typography variant='h4' sx={{ mb: 2 }}>Prompt:</Typography>
            <Typography>{prompt}</Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant='h4' sx={{ mb: 2 }}>Response:</Typography>
            <Typography>{response}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
};

export default WattsonResponse;
