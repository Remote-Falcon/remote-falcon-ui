import { useState, useEffect, useRef, useCallback } from 'react';

import Editor from '@monaco-editor/react';
import { Box, Grid, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import _ from 'lodash';
import { HtmlValidate } from 'html-validate';

import { useDispatch, useSelector } from '../../../../store';
import { gridSpacing } from '../../../../store/constant';
import MainCard from '../../../../ui-component/cards/MainCard';

import HtmlValidationSkeleton from '../../../../ui-component/cards/Skeleton/HtmlValidationSkeleton';
import { showAlertOld } from '../../globalPageHelpers';
import ViewerPageActions from './ViewerPageActions';

const validationExceptions = [
  'Start tag seen without seeing a doctype first',
  'Element “head” is missing',
  '{after-hours-message}',
  '{jukebox-dynamic-container}',
  '{playlist-voting-dynamic-container}',
  '{location-code-dynamic-container}',
  'instructional-text'
];

const htmlValidator = new HtmlValidate({
  extends: ['html-validate:recommended']
});

const ViewerPage = () => {
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const [isHtmlValidating, setIsHtmlValidating] = useState(false);
  const [activeViewerPageHtml, setActiveViewerPageHtml] = useState();
  const [activeViewerPageHtmlBase64, setActiveViewerPageHtmlBase64] = useState();
  const [activeViewerPageName, setActiveViewerPageName] = useState();
  const [htmlValidation, setHtmlValidation] = useState([]);
  const [editorLineNumber, setEditorLineNumber] = useState(0);
  const [openSidePreview, setOpenSidePreview] = useState(false);

  const validateHtml = async (html) => {
    setIsHtmlValidating(true);
    try {
      const report = await htmlValidator.validateString(html || '');
      const results = report?.results ?? [];
      const formattedMessages = _.orderBy(
        _.flatMap(results, (result) =>
          _.map(result.messages ?? [], (message) => {
            const lineNumber = message.line ?? message.location?.line ?? message.offset?.line ?? null;
            return {
              type: message.severity === 2 ? 'error' : 'warning',
              message: message.message,
              lastLine: lineNumber
            };
          })
        ),
        ['lastLine'],
        ['asc']
      );
      setHtmlValidation(formattedMessages);
    } catch (err) {
      showAlertOld({ dispatch, message: 'Unable to validate HTML', alert: 'warning' });
    } finally {
      setIsHtmlValidating(false);
    }
  };

  const throttledValidation = useRef(_.throttle((html) => validateHtml(html), 2500));

  const editorChanged = (value) => {
    setActiveViewerPageHtml(value);
    const viewerPageHtmlBase64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(value)))}`;
    setActiveViewerPageHtmlBase64(viewerPageHtmlBase64);
    throttledValidation.current(value);
  };

  const isValidationException = (message) => {
    let isException = false;
    _.forEach(validationExceptions, (exception) => {
      if (message.includes(exception)) {
        isException = true;
      }
    });
    return isException;
  };

  const htmlValidationRowClicked = (lineNumber, setEditorLineNumber) => {
    window.scrollTo(0, 0);
    setEditorLineNumber(lineNumber);
  };

  const editViewerPage = (viewerPage) => {
    _.forEach(show?.pages, (page) => {
      if (page?.name === viewerPage?.name) {
        setActiveViewerPageHtml(viewerPage?.html);
        setActiveViewerPageName(viewerPage?.name);
        const viewerPageHtmlBase64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(viewerPage?.html)))}`;
        setActiveViewerPageHtmlBase64(viewerPageHtmlBase64);
        validateHtml(viewerPage?.html);
      }
    });
  };

  const editNewViewerPage = (viewerPage) => {
    setActiveViewerPageHtml(viewerPage?.html);
    setActiveViewerPageName(viewerPage?.name);
    const viewerPageHtmlBase64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(viewerPage?.html)))}`;
    setActiveViewerPageHtmlBase64(viewerPageHtmlBase64);
    validateHtml(viewerPage?.html);
  };

  const getActiveViewerPage = useCallback(() => {
    _.forEach(show?.pages, (page) => {
      if (page?.active) {
        setActiveViewerPageHtml(page?.html);
        setActiveViewerPageName(page?.name);
        const viewerPageHtmlBase64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(page?.html)))}`;
        setActiveViewerPageHtmlBase64(viewerPageHtmlBase64);
        validateHtml(page?.html);
      }
    });
  }, [show]);

  useEffect(() => {
    getActiveViewerPage();
  }, [getActiveViewerPage]);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title="Viewer Page" content={false}>
            <Box sx={{ m: 2 }}>
              <ViewerPageActions
                activeViewerPageHtml={activeViewerPageHtml}
                activeViewerPageName={activeViewerPageName}
                activeViewerPageHtmlBase64={activeViewerPageHtmlBase64}
                setOpenSidePreview={setOpenSidePreview}
                openSidePreview={openSidePreview}
                editViewerPage={editViewerPage}
                editNewViewerPage={editNewViewerPage}
              />
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="h3" align="center" sx={{ marginLeft: openSidePreview ? '-50%' : '0' }}>
                    {activeViewerPageName}
                  </Typography>
                </Box>
                {openSidePreview ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Editor
                        height="60vh"
                        defaultLanguage="html"
                        value={activeViewerPageHtml}
                        onChange={(value) => editorChanged(value)}
                        theme="vs-dark"
                        line={editorLineNumber}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3" align="center" color="error" mt={-7} pb={4}>
                        NOTE! This preview displays all page elements and is not based on current viewer control settings!
                      </Typography>
                      <iframe title="viewerPagePreview" src={activeViewerPageHtmlBase64} style={{ height: '100%', width: '100%' }} />
                    </Grid>
                  </Grid>
                ) : (
                  <Editor
                    height="60vh"
                    defaultLanguage="html"
                    value={activeViewerPageHtml}
                    onChange={(value) => editorChanged(value)}
                    theme="vs-dark"
                    line={editorLineNumber}
                  />
                )}
              </Box>
              <Typography variant="h3" sx={{ paddingTop: 3 }}>
                HTML Validation
              </Typography>
              {htmlValidation.length > 0 && (
                <>
                  {isHtmlValidating ? (
                    <HtmlValidationSkeleton />
                  ) : (
                    <TableContainer>
                      <Table sx={{ minWidth: 350 }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell align="left">Type</TableCell>
                            <TableCell align="left">Message</TableCell>
                            <TableCell align="left">Line Number</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody className="validation">
                          {_.map(
                            htmlValidation,
                            (validation) =>
                              validation.type === 'error' &&
                              !isValidationException(validation.message) && (
                                <TableRow hover>
                                  <TableCell align="left">{validation.type}</TableCell>
                                  <TableCell align="left">{validation.message}</TableCell>
                                  <TableCell align="left">
                                    <Link
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => htmlValidationRowClicked(validation.lastLine, setEditorLineNumber)}
                                    >
                                      {validation.lastLine}
                                    </Link>
                                  </TableCell>
                                </TableRow>
                              )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewerPage;
