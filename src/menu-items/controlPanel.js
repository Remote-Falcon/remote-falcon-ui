import { IconDashboard, IconAdjustmentsHorizontal, IconBlockquote, IconPlaylist, IconPalette, IconMan, IconMap } from '@tabler/icons';
import { FormattedMessage } from 'react-intl';

const controlPanel = {
  id: 'control-panel-menu-items',
  type: 'group',
  children: [
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
      id: 'patron-wall',
      title: 'Patron Wall',
      type: 'item',
      url: '/control-panel/patron-wall',
      icon: IconMan,
      breadcrumbs: false
    }
  ]
};

export default controlPanel;
