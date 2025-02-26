import axios from '../../../../utils/axios';

export const uploadImageService = async (formData) =>
  axios.post(`${import.meta.env.VITE_CONTROL_PANEL_API}/controlPanel/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

export const getImagesService = async () => axios.get(`${import.meta.env.VITE_CONTROL_PANEL_API}/controlPanel/images`);

export const deleteImageService = async (imageName) =>
  axios.delete(`${import.meta.env.VITE_CONTROL_PANEL_API}/controlPanel/image/${imageName}`);
