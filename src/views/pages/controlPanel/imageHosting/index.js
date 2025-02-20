import { useState, useMemo, useEffect, useCallback } from 'react';
import * as React from 'react';

import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import {
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import _ from 'lodash';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { useDropzone } from 'react-dropzone';

import { useDispatch } from 'store';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

import { showAlert } from '../../globalPageHelpers';
import { uploadImageService, getImagesService, deleteImageService } from './index.service';

const ImageHosting = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const imageHostingEnabled = useFeatureFlagEnabled('image-hosting');

  const [showLinearProgress, setShowLinearProgress] = useState(false);
  const [images, setImages] = useState([]);

  const baseStyle = {
    flex: 1,
    display: 'flex',
    justifySelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    color: theme.palette.text.primary,
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };

  const focusedStyle = {
    borderColor: '#2196f3'
  };

  const acceptStyle = {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.green.dark : theme.palette.green.light
  };

  const rejectStyle = {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.error.dark : theme.palette.error.light
  };

  const getImages = useCallback(async () => {
    setShowLinearProgress(true);
    await getImagesService()
      .then((response) => {
        if (response.status === 200) {
          setImages(response.data);
        } else {
          showAlert(dispatch, { alert: 'error', message: 'Failed to get images' });
        }
      })
      .finally(() => setShowLinearProgress(false))
      .catch(() => setShowLinearProgress(false));
  }, [dispatch]);

  const deleteImage = async (imageName) => {
    setShowLinearProgress(true);
    await deleteImageService(imageName)
      .then((response) => {
        if (response.status === 200) {
          showAlert(dispatch, { message: `${imageName} deleted successfully.` });
        } else {
          showAlert(dispatch, { alert: 'error', message: 'Failed to delete image' });
        }
      })
      .finally(() => {
        getImages();
        setShowLinearProgress(false);
      })
      .catch(() => setShowLinearProgress(false));
  };

  function uploadFile(acceptedFiles) {
    setShowLinearProgress(true);
    if (images.length >= 25) {
      showAlert(dispatch, { alert: 'warning', message: 'There is a 25 file limit. Please delete an image before uploading another one.' });
      setShowLinearProgress(false);
      return;
    }
    const formData = new FormData();
    const imageName = acceptedFiles[0].name;
    acceptedFiles.forEach((file) => {
      formData.append('file', file);
    });
    uploadImageService(formData)
      .then((response) => {
        if (response.status === 200) {
          showAlert(dispatch, { message: `${imageName} uploaded successfully.` });
        } else {
          showAlert(dispatch, { alert: 'error', message: 'Failed to upload image' });
        }
      })
      .finally(() => {
        getImages();
        setShowLinearProgress(false);
      })
      .catch(() => setShowLinearProgress(false));
  }

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 1000000,
    onDropAccepted: (acceptedFiles) => uploadFile(acceptedFiles)
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const copyImageUrl = async (imagePath) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(imagePath);
    } else {
      document.execCommand('copy', true, imagePath);
    }
    showAlert(dispatch, { message: 'Image URL Copied' });
  };

  useEffect(() => {
    const init = async () => {
      await getImages();
    };
    init();
  }, [getImages]);

  return (
    <Box sx={{ mt: 2 }}>
      {imageHostingEnabled ? (
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <MainCard title="Image Hosting" content={false}>
              <Grid item xs={12}>
                {showLinearProgress && <LinearProgress />}
              </Grid>
              <>
                <Stack direction="row" spacing={2} justifyContent="center" padding={2} width="50%" margin="0 auto">
                  <div {...getRootProps({ style })}>
                    <input {...getInputProps()} />
                    <p>Drag image here or click to select (1MB limit)</p>
                  </div>
                </Stack>
                <TableContainer>
                  <Table size="small" aria-label="collapsible table">
                    <TableHead sx={{ '& th,& td': { whiteSpace: 'nowrap' } }}>
                      <TableRow>
                        <TableCell sx={{ pl: 3 }}>Preview</TableCell>
                        <TableCell sx={{ pl: 3 }}>Image URL</TableCell>
                        <TableCell sx={{ pl: 3 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <>
                        {_.map(images, (image, index) => (
                          <>
                            <TableRow>
                              <TableCell>
                                <img alt={index.toString()} src={image.path} height="100" width="100" />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <a href={image.path} target="_blank" rel="noreferrer">
                                    <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
                                      {image.path}
                                    </Typography>
                                  </a>
                                  <Tooltip placement="top" title="Copy Image URL">
                                    <IconButton
                                      aria-label="Copy Image URL"
                                      onClick={() => copyImageUrl(image.path)}
                                      edge="end"
                                      size="small"
                                      sx={{ ml: 0.5 }}
                                    >
                                      <ContentCopyTwoToneIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ pl: 3 }}>
                                <Tooltip placement="top" title="Delete Image">
                                  <IconButton
                                    color="primary"
                                    sx={{
                                      color: theme.palette.orange.dark,
                                      borderColor: theme.palette.orange.main,
                                      justifyContent: 'center'
                                    }}
                                    size="large"
                                    onClick={() => deleteImage(image.name)}
                                  >
                                    <DeleteTwoToneIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          </>
                        ))}
                      </>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            </MainCard>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default ImageHosting;
