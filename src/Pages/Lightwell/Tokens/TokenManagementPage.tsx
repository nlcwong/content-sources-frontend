import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  FlexItem,
  Grid,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
  Title,
} from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createUseStyles } from 'react-jss';
import { createRef, useCallback, useState } from 'react';

import { useLightwellNavigateTo } from 'Hooks/Lightwell/navigation/useLightwellNavigateTo';
import type { LightwellToken } from './types';
import { getAllTokens, getCurrentUser, getMyTokens, revokeToken } from './mockTokenData';
import CreateTokenModal from './CreateTokenModal';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
});

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusColor = (status: LightwellToken['status']) => {
  switch (status) {
    case 'active':
      return 'green';
    case 'expired':
      return 'orange';
    case 'revoked':
      return 'red';
  }
};

type TokenTableProps = {
  tokens: LightwellToken[];
  showOwner: boolean;
  onRevoke: (token: LightwellToken) => void;
};

const TokenTable = ({ tokens, showOwner, onRevoke }: TokenTableProps) => (
  <Table aria-label='Tokens table' variant={TableVariant.compact}>
    <Thead>
      <Tr>
        <Th>Name</Th>
        {showOwner && <Th width={15}>Owner</Th>}
        <Th width={15}>Created</Th>
        <Th width={15}>Expires</Th>
        <Th width={15}>Last used</Th>
        <Th width={10}>Status</Th>
        <Th width={10}>Actions</Th>
      </Tr>
    </Thead>
    <Tbody>
      {tokens.length === 0 && (
        <Tr>
          <Td colSpan={showOwner ? 7 : 6} style={{ textAlign: 'center', padding: 32 }}>
            No tokens found.
          </Td>
        </Tr>
      )}
      {tokens.map((token) => (
        <Tr key={token.id}>
          <Td dataLabel='Name'>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <KeyIcon />
              <span style={{ fontWeight: 500 }}>{token.name}</span>
            </Flex>
          </Td>
          {showOwner && <Td dataLabel='Owner'>{token.owner}</Td>}
          <Td dataLabel='Created'>{formatDate(token.createdAt)}</Td>
          <Td dataLabel='Expires'>{formatDate(token.expiresAt)}</Td>
          <Td dataLabel='Last used'>{formatDate(token.lastUsed)}</Td>
          <Td dataLabel='Status'>
            <Label isCompact color={statusColor(token.status)}>
              {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
            </Label>
          </Td>
          <Td dataLabel='Actions'>
            {token.status === 'active' ? (
              <Button variant='link' isDanger isInline onClick={() => onRevoke(token)}>
                Revoke
              </Button>
            ) : (
              '—'
            )}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const TokenManagementPage = () => {
  const classes = useStyles();
  const { navigateTo } = useLightwellNavigateTo();
  const [activeTab, setActiveTab] = useState<string | number>('my-tokens');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<LightwellToken | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const myTokensTabRef = createRef<HTMLElement>();
  const allTokensTabRef = createRef<HTMLElement>();

  const currentUser = getCurrentUser();
  const myTokens = getMyTokens();
  const allTokens = getAllTokens();

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleRevoke = () => {
    if (revokeTarget) {
      revokeToken(revokeTarget.id);
      setRevokeTarget(null);
      refresh();
    }
  };

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-tokens-breadcrumb'>
              <BreadcrumbItem
                component='button'
                onClick={() => navigateTo('repositories')}
              >
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem isActive>Access tokens</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem className={spacing.ptMd}>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <Title headingLevel='h1' ouiaId='lightwell-tokens-header'>
                Access tokens
              </Title>
              <FlexItem>
                <Button
                  variant='primary'
                  onClick={() => setCreateModalOpen(true)}
                  ouiaId='create-token-open-button'
                >
                  Create token
                </Button>
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </Grid>

      <Grid className={`${spacing.pxLg} ${spacing.pbLg}`}>
        <Tabs
          activeKey={activeTab}
          onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
          aria-label='Token management tabs'
          ouiaId='lightwell-token-tabs'
        >
          <Tab
            eventKey='my-tokens'
            title={<TabTitleText>My tokens</TabTitleText>}
            tabContentRef={myTokensTabRef}
            ouiaId='lightwell-my-tokens-tab'
          />
          <Tab
            eventKey='all-tokens'
            title={<TabTitleText>All tokens (Admin)</TabTitleText>}
            tabContentRef={allTokensTabRef}
            ouiaId='lightwell-all-tokens-tab'
          />
        </Tabs>
        <TabContent
          eventKey='my-tokens'
          id='my-tokens-panel'
          ref={myTokensTabRef}
          aria-label='My tokens'
        >
          <TabContentBody hasPadding>
            <TokenTable
              key={`my-${refreshKey}`}
              tokens={myTokens}
              showOwner={false}
              onRevoke={setRevokeTarget}
            />
          </TabContentBody>
        </TabContent>
        <TabContent
          eventKey='all-tokens'
          id='all-tokens-panel'
          ref={allTokensTabRef}
          aria-label='All tokens'
          hidden
        >
          <TabContentBody hasPadding>
            <TokenTable
              key={`all-${refreshKey}`}
              tokens={allTokens}
              showOwner
              onRevoke={setRevokeTarget}
            />
          </TabContentBody>
        </TabContent>
      </Grid>

      <CreateTokenModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => refresh()}
      />

      <Modal
        variant={ModalVariant.small}
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        aria-labelledby='revoke-token-modal-title'
        ouiaId='revoke-token-modal'
      >
        <ModalHeader
          title='Revoke token'
          labelId='revoke-token-modal-title'
        />
        <ModalBody>
          Are you sure you want to revoke the token <strong>{revokeTarget?.name}</strong>
          {revokeTarget?.owner !== currentUser && (
            <> owned by <strong>{revokeTarget?.owner}</strong></>
          )}
          ? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button variant='danger' onClick={handleRevoke} ouiaId='revoke-token-confirm'>
            Revoke
          </Button>
          <Button variant='link' onClick={() => setRevokeTarget(null)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TokenManagementPage;
