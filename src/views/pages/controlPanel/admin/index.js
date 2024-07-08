import * as React from 'react';
import { useState } from 'react';

import { useLazyQuery, useMutation } from '@apollo/client';
import { Autocomplete, Box, CardActions, Grid, Stack, TextField, Typography } from '@mui/material';
import { JsonEditor } from 'json-edit-react';
import _ from 'lodash';

import { useDispatch, useSelector } from 'store';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

import { ADMIN_UPDATE_SHOW } from '../../../../utils/graphql/controlPanel/mutations';
import { GET_SHOW_BY_SHOW_NAME, SHOWS_AUTO_SUGGEST } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';

const Admin = () => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [showSearchValue, setShowSearchValue] = useState();
  const [selectedShow, setSelectedShow] = useState({});

  const [showByShowNameQuery] = useLazyQuery(GET_SHOW_BY_SHOW_NAME);
  const [adminUpdateShowMutation] = useMutation(ADMIN_UPDATE_SHOW);

  const selectAShow = async () => {
    await showByShowNameQuery({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      variables: {
        showName: showSearchValue
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data?.getShowByShowName != null) {
          setSelectedShow(data?.getShowByShowName);
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

  return show.showRole === 'ADMIN' ? (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title="Remote Falcon Admin" content={false}>
            <CardActions>
              <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <Stack direction="row" spacing={2} pb={1}>
                    <Typography variant="h4">Show Name</Typography>
                  </Stack>
                  <Typography component="div" variant="caption">
                    Enter the Show Name you want to view (shows will filter as you type).
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    type="text"
                    fullWidth
                    label="Show Name"
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
                  <JsonEditor data={_.cloneDeep(selectedShow)} onUpdate={editStuff} enableClipboard={false} minWidth="100%" />
                </Grid>
              </Grid>
            </CardActions>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  ) : (
    <></>
  );
};

export default Admin;
