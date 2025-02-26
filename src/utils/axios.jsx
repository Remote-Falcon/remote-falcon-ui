/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';

import { Environments } from './enum';

const axiosServices = axios.create();

// interceptor for http
axiosServices.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosServices;
