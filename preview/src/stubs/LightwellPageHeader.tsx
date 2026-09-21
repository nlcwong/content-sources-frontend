import { Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import type { ReactNode } from 'react';

type LightwellPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  ouiaId?: string;
};

const LightwellPageHeader = ({ title, description, actions, ouiaId }: LightwellPageHeaderProps) => (
  <Flex
    justifyContent={{ default: 'justifyContentSpaceBetween' }}
    alignItems={{ default: 'alignItemsFlexStart' }}
    className={`${spacing.pxLg} ${spacing.pyMd}`}
  >
    <FlexItem>
      <Flex className={`${spacing.mXs} ${spacing.pbSm}`} direction={{ default: 'column' }}>
        {typeof title === 'string' ? (
          <Title headingLevel='h1' size='2xl'>
            {title}
          </Title>
        ) : (
          title
        )}
        {description ? (
          <Content component='p' ouiaId={ouiaId}>
            {description}
          </Content>
        ) : null}
      </Flex>
    </FlexItem>
    {actions ? <FlexItem>{actions}</FlexItem> : null}
  </Flex>
);

export default LightwellPageHeader;
