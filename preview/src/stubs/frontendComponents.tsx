import { Title } from '@patternfly/react-core';
import type { ReactNode } from 'react';

/** Minimal stub for Chrome PageHeaderTitle used by LightwellPageHeader. */
export const PageHeaderTitle = ({ title }: { title: ReactNode }) => (
  <Title headingLevel='h1' size='2xl'>
    {title}
  </Title>
);

export default { PageHeaderTitle };
