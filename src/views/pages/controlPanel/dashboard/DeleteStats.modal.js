import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import { CardContent, CardActions, Divider, Grid, IconButton, Typography, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

import MainCard from 'ui-component/cards/MainCard';

const DeleteStatsModal = ({ theme, dateMinus7Formatted, datePlus1Formatted, handleClose, deleteStats, isDeleting }) => (
  <MainCard
    sx={{
      position: 'absolute',
      width: { xs: 280, lg: 450 },
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}
    title="Delete Stats"
    content={false}
    secondary={
      <IconButton onClick={handleClose} size="large">
        <CloseIcon fontSize="small" />
      </IconButton>
    }
  >
    <CardContent>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Are you sure you want to do delete all stats from {dateMinus7Formatted} to {datePlus1Formatted}?
      </Typography>
    </CardContent>
    <Divider />
    <CardActions>
      <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
        <Grid item>
          <LoadingButton
            loading={isDeleting}
            loadingIndicator={<CircularProgress color="primary" size={30} />}
            variant="contained"
            size="large"
            sx={{ background: theme.palette.primary.main, '&:hover': { background: theme.palette.primary.dark } }}
            onClick={handleClose}
          >
            Cancel
          </LoadingButton>
        </Grid>
        <Grid item>
          <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
            <Grid item>
              <LoadingButton
                loading={isDeleting}
                loadingIndicator={<CircularProgress color="error" size={30} />}
                variant="contained"
                size="large"
                sx={{ background: theme.palette.error.main, '&:hover': { background: theme.palette.error.dark } }}
                onClick={deleteStats}
              >
                Delete Stats
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardActions>
  </MainCard>
);

DeleteStatsModal.propTypes = {
  theme: PropTypes.object,
  dateMinus7Formatted: PropTypes.string,
  datePlus1Formatted: PropTypes.string,
  handleClose: PropTypes.func,
  deleteStats: PropTypes.func,
  isDeleting: PropTypes.bool
};

export default DeleteStatsModal;
