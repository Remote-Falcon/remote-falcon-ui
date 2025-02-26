import axios from '../../utils/axios';

// eslint-disable-next-line import/prefer-default-export
export const fetchGitHubIssuesService = async () => {
  const response = await axios.get(`${import.meta.env.VITE_CONTROL_PANEL_API}/controlPanel/gitHubIssues`);
  return response;
};
