import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {AppBar, Dialog, IconButton, Slide, Stack, Toolbar, Typography} from '@mui/material';
import PropTypes from 'prop-types';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const ViewerPagePreviewDialog = ({ openFullPreview, closeFullPreview, activeViewerPageName, activeViewerPageHtmlBase64 }) => (
  <Dialog fullScreen open={openFullPreview} onClose={closeFullPreview} TransitionComponent={Transition}>
    {openFullPreview && (
      <>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={closeFullPreview} aria-label="close" size="large">
              <CloseIcon />
            </IconButton>
            <Stack direction="row" spacing={6}>
              <Typography variant="h3" color="inherit" sx={{ ml: 2, flex: 1 }}>
                {activeViewerPageName} Preview
              </Typography>
              <Typography variant="h3" color="error">
                NOTE! This preview displays all page elements and is not based on current viewer control settings!
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>

        <iframe title="viewerPagePreview" src={activeViewerPageHtmlBase64} style={{ height: '100%' }} />
      </>
    )}
  </Dialog>
);

ViewerPagePreviewDialog.propTypes = {
  openFullPreview: PropTypes.bool,
  closeFullPreview: PropTypes.func,
  activeViewerPageName: PropTypes.string,
  activeViewerPageHtmlBase64: PropTypes.string
};

export default ViewerPagePreviewDialog;
