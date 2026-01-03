import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import fileDownload from 'js-file-download';

import { useLazyQuery, useMutation } from '@apollo/client';
import { Box, Grid, TableRow, TableCell, TableContainer, Table, TableHead, TableBody, LinearProgress, Stack } from '@mui/material';
import _ from 'lodash';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import { useDispatch, useSelector } from '../../../../store';
import { gridSpacing } from '../../../../store/constant';
import MainCard from '../../../../ui-component/cards/MainCard';
import RFLoadingButton from '../../../../ui-component/RFLoadingButton';

import { saveSequencesService } from '../../../../services/controlPanel/mutations.service';
import { setShow } from '../../../../store/slices/show';
import RFSplitButton from '../../../../ui-component/RFSplitButton';
import { UPDATE_SEQUENCES } from '../../../../utils/graphql/controlPanel/mutations';
import { GET_SHOW } from '../../../../utils/graphql/controlPanel/queries';
import { showAlert } from '../../globalPageHelpers';
import SequenceRow from './SequenceRow';
import { downloadSequencesToExcelService, importSequencesFromExcelService } from './index.service';

const Sequences = () => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [showLinearProgress, setShowLinearProgress] = useState(false);
  const [panelTitle, setPanelTitle] = useState('Sequences');
  const fileInputRef = useRef(null);
  const [getShowQuery] = useLazyQuery(GET_SHOW, { fetchPolicy: 'network-only' });

  const [updateSequencesMutation] = useMutation(UPDATE_SEQUENCES);

  const deleteSequencesOptions = ['Delete Inactive Sequences', 'Delete All Sequences'];
  const importExportOptions = ['Import Sequences', 'Export Sequences'];

  const sortSequencesAlphabetically = () => {
    setShowLinearProgress(true);
    let updatedSequences = _.cloneDeep(show?.sequences);
    updatedSequences = _.orderBy(updatedSequences, ['active', 'displayName'], ['desc', 'asc']);
    _.map(updatedSequences, (sequence, index) => {
      sequence.order = index;
    });
    dispatch(
      setShow({
        ...show,
        sequences: [...updatedSequences]
      })
    );
    saveSequencesService(updatedSequences, updateSequencesMutation, (response) => {
      if (response?.success) {
        showAlert(dispatch, { message: 'Sequences Sorted Alphabetically' });
      } else {
        showAlert(dispatch, response?.toast);
      }
      setShowLinearProgress(false);
    });
  };

  const reorderSequences = (result) => {
    if (!result.destination) return;

    const updatedSequences = _.cloneDeep(show?.sequences);
    const [reorderedItem] = updatedSequences.splice(result.source.index, 1);
    updatedSequences.splice(result.destination.index, 0, reorderedItem);
    _.map(updatedSequences, (sequence, index) => {
      sequence.order = index;
    });
    dispatch(
      setShow({
        ...show,
        sequences: [...updatedSequences]
      })
    );
    saveSequencesService(updatedSequences, updateSequencesMutation, (response) => {
      if (response?.success) {
        showAlert(dispatch, { message: 'Sequences Order Updated' });
      } else {
        showAlert(dispatch, response?.toast);
      }
      setShowLinearProgress(false);
    });
  };

  const deleteSequences = async (options, selectedIndex) => {
    if (selectedIndex === 0) {
      setShowLinearProgress(true);
      const updatedSequences = _.cloneDeep([...show?.sequences]);
      _.remove(updatedSequences, (updatedSequence) => !updatedSequence?.active);
      saveSequencesService(updatedSequences, updateSequencesMutation, (response) => {
        if (response?.success) {
          dispatch(
            setShow({
              ...show,
              sequences: [...updatedSequences]
            })
          );
          showAlert(dispatch, { message: 'Inactive Sequences Deleted' });
        } else {
          showAlert(dispatch, response?.toast);
        }
        setShowLinearProgress(false);
      });
    } else if (selectedIndex === 1) {
      setShowLinearProgress(true);
      const updatedSequences = _.cloneDeep([]);
      saveSequencesService(updatedSequences, updateSequencesMutation, (response) => {
        if (response?.success) {
          dispatch(
            setShow({
              ...show,
              sequences: [...updatedSequences]
            })
          );
          showAlert(dispatch, { message: 'All Sequences Deleted' });
        } else {
          showAlert(dispatch, response?.toast);
        }
        setShowLinearProgress(false);
      });
    }
  };

  const handleImportExport = async (options, selectedIndex) => {
    if (selectedIndex === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    } else if (selectedIndex === 1) {
      setShowLinearProgress(true);
      try {
        const response = await downloadSequencesToExcelService();
        if (response?.status === 200) {
          fileDownload(response.data, 'Remote Falcon Sequences.csv');
          showAlert(dispatch, { message: 'Sequences Exported Successfully' });
        } else {
          showAlert(dispatch, { alert: 'error', message: 'Unable to export sequences' });
        }
      } catch (err) {
        showAlert(dispatch, { alert: 'error', message: err?.response?.data || 'Unable to export sequences' });
      } finally {
        setShowLinearProgress(false);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setShowLinearProgress(true);
    try {
      const response = await importSequencesFromExcelService(formData);
      if (response?.status === 200) {
        showAlert(dispatch, { message: 'Sequences imported successfully.' });
        const { data } = await getShowQuery();
        if (data?.getShow) {
          dispatch(setShow(data.getShow));
        }
      } else {
        showAlert(dispatch, { alert: 'error', message: response?.data || 'Unable to import sequences' });
      }
    } catch (err) {
      showAlert(dispatch, { alert: 'error', message: err?.response?.data || 'Unable to import sequences' });
    } finally {
      setShowLinearProgress(false);
    }
  };

  useEffect(() => {
    setPanelTitle(`Sequences (${show?.sequences?.length || 0} of 200)`);
  }, [show]);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title={panelTitle} content={false}>
            <Grid item xs={12}>
              {showLinearProgress && <LinearProgress />}
            </Grid>
            <>
              <Stack direction="row" spacing={2} justifyContent="right" pt={2} pb={2} pr={2}>
                <RFLoadingButton loading={showLinearProgress} onClick={sortSequencesAlphabetically} color="primary">
                  Sort Alphabetically
                </RFLoadingButton>

                <RFSplitButton
                  options={importExportOptions}
                  onClick={(options, selectedIndex) => handleImportExport(options, selectedIndex)}
                  triggerOnSelect
                />
                <RFSplitButton
                  options={deleteSequencesOptions}
                  color="error"
                  onClick={(options, selectedIndex) => deleteSequences(options, selectedIndex)}
                />
              </Stack>
            <TableContainer>
              <input
                type="file"
                accept=".csv,text/csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
                <Table size="small" aria-label="collapsible table">
                  <TableHead sx={{ '& th,& td': { whiteSpace: 'nowrap' } }}>
                    <TableRow>
                      <TableCell sx={{ pl: 3 }} />
                      <TableCell sx={{ pl: 3 }}>Status</TableCell>
                      <TableCell sx={{ pl: 3 }}>Type</TableCell>
                      <TableCell sx={{ pl: 3 }} align="center">
                        Sequence Index
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Display Name</TableCell>
                      <TableCell>Artist</TableCell>
                      <TableCell>Group</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Image</TableCell>
                      <TableCell sx={{ pl: 3 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <DragDropContext onDragEnd={(result) => reorderSequences(result)}>
                    <Droppable droppableId="sequences">
                      {(provided) => (
                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                          <>
                            {_.map(show?.sequences, (sequence, index) => (
                              <Draggable
                                index={parseInt(index, 10)}
                                draggableId={sequence.name}
                                key={sequence.name}
                                isDragDisabled={!sequence.active}
                              >
                                {(provided) => (
                                  <SequenceRow provided={provided} sequence={sequence} setShowLinearProgress={setShowLinearProgress} />
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </>
                        </TableBody>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Table>
              </TableContainer>
            </>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Sequences;
