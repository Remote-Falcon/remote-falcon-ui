/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import Reactotron from 'reactotron-react-js';

import { Environments } from './enum';

const axiosServices = axios.create({
  baseURL: window?.ENV?.CONTROL_PANEL_API
});

// interceptor for http
axiosServices.interceptors.response.use(
  (response) => {
    if (window?.ENV?.HOST_ENV === Environments.LOCAL) {
      Reactotron.apisauce(response);
    }
    return response;
  },
  (error) => {
    if (window?.ENV?.HOST_ENV === Environments.LOCAL) {
      Reactotron.apisauce(error);
    }
    return Promise.reject(error);
  }
);

export default axiosServices;
