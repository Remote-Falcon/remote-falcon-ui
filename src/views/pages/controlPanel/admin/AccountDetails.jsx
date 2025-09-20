import { useState } from 'react';

import { useMutation, useLazyQuery } from '@apollo/client';
import { Grid, CardActions, Divider, Typography, Switch, Stack, TextField } from '@mui/material';
import _ from 'lodash';
import { JsonEditor } from 'json-edit-react';

import MainCard from '../../../../ui-component/cards/MainCard';
import { useDispatch, useSelector } from '../../../../store';
import { setShow } from '../../../../store/slices/show';
import { ADMIN_UPDATE_SHOW } from '../../../../utils/graphql/controlPanel/mutations';
import { GET_SHOW_BY_SHOW_SUBDOMAIN } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';
import { savePreferencesService } from "../../../../services/controlPanel/mutations.service";

const AccountDetails = ({ setShowLinearProgress }) => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [showSearchValue, setShowSearchValue] = useState();
  const [selectedShow, setSelectedShow] = useState({});

  const [showByShowSubdomainQuery] = useLazyQuery(GET_SHOW_BY_SHOW_SUBDOMAIN);
  const [adminUpdateShowMutation] = useMutation(ADMIN_UPDATE_SHOW);

  const selectAShow = async () => {
    setSelectedShow({});
    await showByShowSubdomainQuery({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      variables: {
        showSubdomain: showSearchValue
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data?.getShowByShowSubdomain != null) {
          setSelectedShow(data?.getShowByShowSubdomain);
        }
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    });
  };

  const editStuff = (newValue) => {
    adminUpdateShowMutation({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      variables: {
        show: newValue?.newData
      },
      onCompleted: () => {
        setSelectedShow(newValue?.newData);
        showAlert(dispatch, { message: `Show Updated` });
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error' });
      }
    }).then();
  };

  return (
    <Grid item xs={12}>
      <MainCard content={false}>
        <Divider />
        <CardActions>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <Stack direction="row" spacing={2} pb={1}>
                <Typography variant="h4">Show Subdomain</Typography>
              </Stack>
              <Typography component="div" variant="caption">
                Enter the Show Subdomain you want to view.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                type="text"
                fullWidth
                label="Show Subdomain"
                value={showSearchValue}
                onChange={(e) => setShowSearchValue(e?.target?.value)}
                onBlur={selectAShow}
              />
            </Grid>
          </Grid>
        </CardActions>
        <CardActions>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={12} lg={12}>
              <JsonEditor
                data={_.cloneDeep(selectedShow)}
                onUpdate={editStuff}
                enableClipboard={false}
                restrictDelete
                minWidth="100%"
              />
            </Grid>
          </Grid>
        </CardActions>
        <Divider />
      </MainCard>
    </Grid>
  );
};

export default AccountDetails;
