/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import Reactotron from 'reactotron-react-js';

import { Environments } from './enum';

const axiosServices = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_FALCON_GATEWAY
});

// interceptor for http
axiosServices.interceptors.response.use(
  (response) => {
    if (process.env.REACT_APP_HOST_ENV === Environments.LOCAL) {
      Reactotron.apisauce(response);
    }
    return response;
  },
  (error) => {
    if (process.env.REACT_APP_HOST_ENV === Environments.LOCAL) {
      Reactotron.apisauce(error);
    }
    return Promise.reject(error);
  }
);

export default axiosServices;
