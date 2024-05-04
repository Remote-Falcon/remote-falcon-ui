import axios from 'utils/axios';

// eslint-disable-next-line import/prefer-default-export
export const fetchGitHubIssuesService = async () => {
  const response = await axios.get('/controlPanel/gitHubIssues');
  return response;
};
