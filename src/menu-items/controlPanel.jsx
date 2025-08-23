import * as React from 'react';

import {
  IconDashboard,
  IconAdjustmentsHorizontal,
  IconBlockquote,
  IconPlaylist,
  IconPalette,
  IconManualGearbox,
  IconMap,
  IconFileUpload, IconAi
} from '@tabler/icons-react';
import { FormattedMessage } from 'react-intl';

import Chip from '../ui-component/extended/Chip';

const controlPanel = {
  id: 'control-panel-menu-items',
  type: 'group',
  children: [
    {
      id: 'ask-wattson',
      title: (
        <>
          <span style={{ paddingRight: '1em' }}>Ask Wattson</span>
        </>
      ),
      type: 'item',
      url: '/control-panel/ask-wattson',
      icon: IconAi,
      breadcrumbs: false
    },
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      url: '/control-panel/dashboard',
      icon: IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'remote-falcon-settings',
      title: <FormattedMessage id="remote-falcon-settings" />,
      type: 'item',
      url: '/control-panel/remote-falcon-settings',
      icon: IconAdjustmentsHorizontal,
      breadcrumbs: false
    },
    {
      id: 'image-hosting',
      title: (
        <>
          <span style={{ paddingRight: '1em' }}>Image Hosting</span>
        </>
      ),
      type: 'item',
      url: '/control-panel/image-hosting',
      icon: IconFileUpload,
      breadcrumbs: false
    },
    {
      id: 'viewer-page',
      title: <FormattedMessage id="viewer-page" />,
      type: 'item',
      url: '/control-panel/viewer-page',
      icon: IconBlockquote,
      breadcrumbs: false
    },
    {
      id: 'sequences',
      title: <FormattedMessage id="sequences" />,
      type: 'item',
      url: '/control-panel/sequences',
      icon: IconPlaylist,
      breadcrumbs: false
    },
    {
      id: 'viewer-page-templates',
      title: <FormattedMessage id="viewer-page-templates" />,
      type: 'item',
      url: '/control-panel/viewer-page-templates',
      icon: IconPalette,
      breadcrumbs: false
    },
    {
      id: 'shows-map',
      title: 'Remote Falcon Shows Map',
      type: 'item',
      url: '/control-panel/shows-map',
      icon: IconMap,
      breadcrumbs: false
    },
    {
      id: 'admin',
      title: 'Admin',
      type: 'item',
      url: '/control-panel/admin',
      icon: IconManualGearbox,
      breadcrumbs: false
    }
  ]
};

export default controlPanel;
