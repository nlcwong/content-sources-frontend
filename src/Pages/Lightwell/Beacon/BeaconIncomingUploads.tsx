import { Navigate } from 'react-router-dom';

import { useLightwellRootPath } from 'Hooks/Lightwell/navigation/useLightwellRootPath';

/**
 * Incoming uploads now live as a panel on Beacon. Keep this route as a redirect.
 */
const BeaconIncomingUploads = () => {
  const rootPath = useLightwellRootPath();
  return <Navigate to={`${rootPath}/beacon`} replace />;
};

export default BeaconIncomingUploads;
