import { memo, useMemo } from 'react';
import * as React from 'react';

import { Box, Drawer, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { VERSION } from '../../../config';
import useAuth from '../../../hooks/useAuth';
import { useDispatch, useSelector } from '../../../store';
import { drawerWidth } from '../../../store/constant';
import { openDrawer } from '../../../store/slices/menu';
import Chip from '../../../ui-component/extended/Chip';

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
        <Typography color="secondary" variant="h3" align="center" sx={{ mt: 4, mb: 3 }}>
          Support Remote Falcon
        </Typography>

        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Typography variant="h5" align="center">
            100% of Patreon support goes directly to keeping Remote Falcon running
            <a href="https://www.patreon.com/RemoteFalcon" target="_blank" rel="noreferrer">
              <img
                src="https://images.squarespace-cdn.com/content/v1/5cca6990fd6793515a091e5f/1574705049575-1BVQRVG2UTGE9EBEKI6X/become-a-patron-button.png"
                alt="become-a-patron"
                width="270"
              />
            </a>
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Typography variant="h5" align="center">
            &quot;Buying a coffee&quot; is a nice way to say thanks and goes directly to the developer
            <a href="https://www.buymeacoffee.com/remotefalcon" target="_blank" rel="noreferrer">
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                width="240"
                style={{ marginTop: '1em' }}
              />
            </a>
          </Typography>
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
