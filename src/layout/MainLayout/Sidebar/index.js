import { memo, useMemo } from 'react';
import * as React from 'react';

import { Box, Drawer, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { VERSION } from 'config';
import useAuth from 'hooks/useAuth';
import { useDispatch, useSelector } from 'store';
import { drawerWidth } from 'store/constant';
import { openDrawer } from 'store/slices/menu';
import Chip from 'ui-component/extended/Chip';

import LogoSection from '../LogoSection';
import MenuList from './MenuList';

const Sidebar = ({ window }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

  const dispatch = useDispatch();
  const { drawerOpen } = useSelector((state) => state.menu);

  const { isDemo } = useAuth();

  const chipLabel = `${isDemo ? 'DEMO - ' : ''} ${VERSION}`;

  const logo = useMemo(
    () => (
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
          <LogoSection />
        </Box>
      </Box>
    ),
    []
  );

  const drawer = useMemo(
    () => (
      <PerfectScrollbar
        component="div"
        style={{
          height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <MenuList />
        <Typography variant="h3" align="center" sx={{ mt: 4 }}>
          Support Remote Falcon
        </Typography>

        <Stack direction="row" justifyContent="center">
          <Typography variant="h4" align="center">
            <a href="https://www.patreon.com/RemoteFalcon" target="_blank" rel="noreferrer">
              <img src="https://remotefalcon.com/patreon-icon-png-29.jpg" alt="become-a-patron" width="270" />
            </a>
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <a
            href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=FFKWA2CFP6JC6&currency_code=USD&source=url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="https://remotefalcon.com/Paypal.png" alt="donate-with-paypal" width="275" />
          </a>
        </Stack>

        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Chip label={chipLabel} chipcolor="primary" />
        </Stack>
      </PerfectScrollbar>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchUpMd]
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : 'auto' }} aria-label="mailbox folders">
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={() => dispatch(openDrawer(!drawerOpen))}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRight: 'none',
            [theme.breakpoints.up('md')]: {
              top: '88px'
            }
          }
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawerOpen && logo}
        {drawerOpen && drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  window: PropTypes.object
};

export default memo(Sidebar);
