import { useState } from 'react';

import { useMutation, useLazyQuery } from '@apollo/client';
import { Grid, CardActions, Divider, Typography, Table, TableRow, TableHead, TableCell, TableContainer, TableBody, Stack, TextField, Link, Modal } from '@mui/material';
import _ from 'lodash';
import { JsonEditor } from 'json-edit-react';

import MainCard from '../../../../ui-component/cards/MainCard';
import { useDispatch, useSelector } from '../../../../store';
import { setShow } from '../../../../store/slices/show';
import { ADMIN_UPDATE_SHOW } from '../../../../utils/graphql/controlPanel/mutations';
import { GET_WATTSON_FEEDBACK, GET_WATTSON_RESPONSE } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';
import { savePreferencesService } from "../../../../services/controlPanel/mutations.service";
import RFLoadingButton from '../../../../ui-component/RFLoadingButton';
import WattsonResponse from './WattsonRespoonse';

const WattsonFeedback = ({ }) => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [filterBy, setFilterBy] = useState("THUMBS_DOWN");
  const [wattsonFeedback, setWattsonFeedback] = useState({});
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [wattsonResponse, setWattsonResponse] = useState();
  const [wattsonResponseOpen, setWattsonResponseOpen] = useState(false);

  const [getWattsonFeedbackQuery] = useLazyQuery(GET_WATTSON_FEEDBACK);
  const [getWattsonResponseQuery] = useLazyQuery(GET_WATTSON_RESPONSE);

  const getFeedback = async () => {
    setIsGettingFeedback(true);
    setWattsonFeedback({});
    await getWattsonFeedbackQuery({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      variables: {
        filterBy
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        setWattsonFeedback(data?.getWattsonFeedback);
        setIsGettingFeedback(false);
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
        setIsGettingFeedback(false);
      }
    });
  };

  const responseIdClicked = async (responseId) => {
    await getWattsonResponseQuery({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      variables: {
        responseId
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        setWattsonResponse(data?.getWattsonResponse);
        setWattsonResponseOpen(true);
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    });
  };

  return (
    <Grid item xs={12}>
      <MainCard content={false}>
        <Divider />
        <CardActions>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <Stack direction="row" spacing={2} pb={1}>
                <Typography variant="h4">Filter By</Typography>
              </Stack>
              <Typography component="div" variant="caption">
                Filter the feedback (THUMBS_UP or THUMBS_DOWN)
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                type="text"
                fullWidth
                label="Filter By"
                value={filterBy}
                onChange={(e) => setFilterBy(e?.target?.value)}
              />
            </Grid>
          </Grid>
        </CardActions>
        <RFLoadingButton sx={{ ml: 3 }} loading={isGettingFeedback} color="error" onClick={() => getFeedback()}>
          Get Feedback
        </RFLoadingButton>
        <CardActions>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={12} lg={12}>
              <TableContainer>
                <Table sx={{ minWidth: 350 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Response ID</TableCell>
                      <TableCell align="left">Show Subdomain</TableCell>
                      <TableCell align="left">Feedback</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="validation">
                    {_.map(wattsonFeedback, (feedback) => (
                      <TableRow hover key={`${feedback.responseId}`}>
                        <TableCell align="left">
                          <Link
                            style={{ cursor: 'pointer' }}
                            onClick={() => responseIdClicked(feedback.responseId)}
                          >
                            {feedback.responseId}
                          </Link>
                        </TableCell>
                        <TableCell align="left">{feedback.showSubdomain}</TableCell>
                        <TableCell align="left">{feedback.feedback}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardActions>
        <Divider />
      </MainCard>
      <Modal
        open={wattsonResponseOpen}
        onClose={() => setWattsonResponseOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <WattsonResponse handleClose={() => setWattsonResponseOpen(false)}
          prompt={wattsonResponse?.prompt}
          response={wattsonResponse?.response} />
      </Modal>
    </Grid>
  );
};

export default WattsonFeedback;
