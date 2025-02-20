import axios from 'utils/axios';

export const uploadImageService = async (formData) =>
  axios.post(`${process.env.REACT_APP_CONTROL_PANEL_API}/controlPanel/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

export const getImagesService = async () => axios.get(`${process.env.REACT_APP_CONTROL_PANEL_API}/controlPanel/images`);

export const deleteImageService = async (imageName) =>
  axios.delete(`${process.env.REACT_APP_CONTROL_PANEL_API}/controlPanel/image/${imageName}`);
