import { Navigate } from 'react-router-dom';

import { useLightwellRootPath } from 'Hooks/Lightwell/navigation/useLightwellRootPath';

/**
 * Beacon Intake now lives on the Beacon page (customer audience).
 * Keep this route as a redirect for old links.
 */
const BeaconUpload = () => {
  const rootPath = useLightwellRootPath();
  return <Navigate to={`${rootPath}/beacon`} replace />;
};

export default BeaconUpload;
