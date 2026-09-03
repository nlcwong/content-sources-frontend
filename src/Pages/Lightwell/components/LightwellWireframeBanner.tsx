import { Banner } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

const LightwellWireframeBanner = () => (
  <Banner status='info' isSticky screenReaderText='Wireframe notice'>
    <InfoCircleIcon /> These screens are wireframes for demonstration purposes and are not
    production-ready.
  </Banner>
);

export default LightwellWireframeBanner;
