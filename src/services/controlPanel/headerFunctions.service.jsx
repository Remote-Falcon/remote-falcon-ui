import axios from '../../utils/axios';

export const getNotificationsService = async () => {
  const response = await axios.get('/remote-falcon-control-panel/controlPanel/notifications');
  return response;
};

export const markNotificationAsReadService = async (notificationKey) => {
  const response = await axios.post(`/remote-falcon-control-panel/controlPanel/notifications/markAsRead/${notificationKey}`);
  return response;
};

export const markAllNotificationsAsReadService = async () => {
  const response = await axios.post('/remote-falcon-control-panel/controlPanel/notifications/markAllAsRead');
  return response;
};

export const deleteNotificationService = async (notificationKey) => {
  const response = await axios.delete(`/remote-falcon-control-panel/controlPanel/notifications/${notificationKey}`);
  return response;
};
