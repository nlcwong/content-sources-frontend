import type { ReactNode } from 'react';
import { Flex, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

type InsightsPanelTitleProps = {
  children: ReactNode;
};

const InsightsPanelTitle = ({ children }: InsightsPanelTitleProps) => (
  <Flex justifyContent={{ default: 'justifyContentCenter' }} className={spacing.mbMd}>
    <Title headingLevel='h3' size='md'>
      {children}
    </Title>
  </Flex>
);

export default InsightsPanelTitle;
