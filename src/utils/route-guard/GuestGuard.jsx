import {useEffect} from 'react';

import PropTypes from 'prop-types';
import {useNavigate, useLocation} from 'react-router-dom';

import { CONTROL_PANEL_PATH } from '../../config';
import useAuth from '../../hooks/useAuth';

import {isExternalViewer, isSubdomainCP} from './helpers/helpers';

/**
 * Guest guard for routes having no auth required
 * @param {PropTypes.node} children children element/node
 */

const GuestGuard = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("isExternalViewer(): ", isExternalViewer());
    if (isExternalViewer()) {
      navigate('/remote-falcon', { replace: true });
      return;
    }
    const swapCP = import.meta.env.VITE_SWAP_CP === 'true';
    if(swapCP && !isSubdomainCP()) {
      console.log("Should be 404");
      navigate('/404', { replace: true });
      return;
    }
    if (isLoggedIn && location.pathname !== '/privacy-policy' && location.pathname !== '/terms-and-conditions' && location.pathname !== '/owners') {
      navigate(CONTROL_PANEL_PATH, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
