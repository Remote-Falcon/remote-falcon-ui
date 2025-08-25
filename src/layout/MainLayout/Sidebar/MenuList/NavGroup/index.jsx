import { Divider, List, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

import { useSelector } from '../../../../../store';

import NavCollapse from '../NavCollapse';
import NavItem from '../NavItem';
import { useIsFeatureFlagEnabled } from '../../../../../utils/featureFlags';

const NavGroup = ({ item }) => {
  const theme = useTheme();
  const { show } = useSelector((state) => state.show);

  const isAskWattsonEnabled = useIsFeatureFlagEnabled('ask-wattson', show?.showSubdomain);

  // menu list collapse & items
  const items = item.children?.map((menu) => {
    if (menu.id === 'admin') {
      if (show?.showRole !== 'ADMIN') {
        return <></>;
      }
    }
    if (menu.id === 'ask-wattson' && !isAskWattsonEnabled) {
      return <></>;
    }
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return (
    <>
      <List
        subheader={
          item.title && (
            <Typography variant="caption" sx={{ ...theme.typography.menuCaption }} display="block" gutterBottom>
              {item.title}
              {item.caption && (
                <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                  {item.caption}
                </Typography>
              )}
            </Typography>
          )
        }
      >
        {items}
      </List>

      {/* group divider */}
      <Divider sx={{ mt: 0.25, mb: 1.25 }} />
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object
};

export default NavGroup;
