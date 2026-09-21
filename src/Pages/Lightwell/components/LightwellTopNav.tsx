import { Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useLocation } from 'react-router-dom';

import { useLightwellNavigateTo } from 'Hooks/Lightwell/navigation/useLightwellNavigateTo';
import { useLightwellRootPath } from 'Hooks/Lightwell/navigation/useLightwellRootPath';
import { useAppContext } from 'middleware/AppContext';

type NavItem = {
  key: string;
  label: string;
  isActive: (pathname: string, rootPath: string) => boolean;
  onClick: () => void;
  visible: boolean;
};

/**
 * In-app Lightwell top navigation for prototype A (LWLP-1269).
 * Chrome sidebar nav is out of scope for this repo.
 */
const LightwellTopNav = () => {
  const { pathname } = useLocation();
  const rootPath = useLightwellRootPath();
  const { navigateTo, navigateToLens } = useLightwellNavigateTo();
  const { features } = useAppContext();

  const beaconEnabled =
    !!features?.lightwellbeacon?.enabled && !!features?.lightwellbeacon?.accessible;
  const lensEnabled = !!features?.lightwelllens?.enabled && !!features?.lightwelllens?.accessible;

  const items: NavItem[] = [
    {
      key: 'repositories',
      label: 'Repositories',
      visible: true,
      isActive: (path, root) =>
        path === root ||
        path === `${root}/` ||
        (/\/[^/]+$/.test(path.replace(root, '')) &&
          !path.includes('/lens') &&
          !path.includes('/beacon')),
      onClick: () => navigateTo('repositories'),
    },
    {
      key: 'lens',
      label: 'Lens',
      visible: lensEnabled,
      isActive: (path) => path.includes('/lens'),
      onClick: () => navigateToLens(),
    },
    {
      key: 'beacon',
      label: 'Beacon',
      visible: beaconEnabled,
      isActive: (path) => path.includes('/beacon') && !path.includes('/beacon/upload'),
      onClick: () => navigateTo('beacon'),
    },
    {
      key: 'beaconUpload',
      label: 'Upload to Beacon',
      visible: beaconEnabled,
      isActive: (path) => path.includes('/beacon/upload'),
      onClick: () => navigateTo('beaconUpload'),
    },
  ];

  const visibleItems = items.filter((item) => item.visible);

  return (
    <nav
      aria-label='Lightwell'
      className={`${spacing.pxLg} ${spacing.pySm}`}
      data-ouia-component-id='lightwell-top-nav'
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {visibleItems.map((item) => {
          const isActive = item.isActive(pathname, rootPath);
          return (
            <Button
              key={item.key}
              variant={isActive ? 'primary' : 'link'}
              onClick={item.onClick}
              ouiaId={`lightwell-top-nav-${item.key}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default LightwellTopNav;
