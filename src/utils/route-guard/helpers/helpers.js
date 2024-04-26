import { Environments } from '../../enum';

export const getSubdomain = () => {
  const hostname = window.location.hostname;
  const hostnameSplit = hostname.split('.');
  let subdomain = hostnameSplit.length > 2 ? hostnameSplit[0] : '';
  if (window?.ENV?.HOST_ENV === Environments.LOCAL) {
    subdomain = hostnameSplit.length > 1 ? hostnameSplit[0] : '';
  }
  return subdomain;
};

export const isExternalViewer = () => {
  const subdomain = getSubdomain();
  return !!subdomain;
};
