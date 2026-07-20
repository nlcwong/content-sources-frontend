import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@patternfly/react-core/dist/styles/base.css';

import NotificationConfigModal, {
  type NotificationPreferences,
} from '../src/Pages/Lightwell/Repositories/components/NotificationConfigModal';
import { formatRepositoryName, getRepositoryDescription } from '../src/Pages/Lightwell/helpers';

import {
  Button,
  Card,
  Content,
  Flex,
  FlexItem,
  Icon,
  Label,
  Page,
  PageSection,
  Stack,
  Switch,
} from '@patternfly/react-core';
import { BellIcon, CodeIcon, JavaIcon, PythonIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { capitalize } from 'lodash';

const mockRepositories = [
  {
    uuid: '11111111-1111-4111-8111-111111111111',
    name: 'lightwell/java/validated',
    published_distribution_url: 'https://packages.redhat.com/lightwell/java/validated/',
    security_level: 'validated',
    content_type: 'maven',
    package_count: 697,
    version_count: 3480,
  },
  {
    uuid: '22222222-2222-4222-8222-222222222222',
    name: 'lightwell/java/remediated',
    published_distribution_url: 'https://packages.redhat.com/lightwell/java/remediated/',
    security_level: 'remediated',
    content_type: 'maven',
    package_count: 130,
    version_count: 133,
  },
  {
    uuid: '33333333-3333-4333-8333-333333333333',
    name: 'lightwell/python/validated',
    published_distribution_url: 'https://packages.redhat.com/lightwell/python/validated/',
    security_level: 'validated',
    content_type: 'python',
    package_count: 1721,
    version_count: 3794,
  },
  {
    uuid: '44444444-4444-4444-8444-444444444444',
    name: 'lightwell/python/remediated',
    published_distribution_url: 'https://packages.redhat.com/lightwell/python/remediated/',
    security_level: 'remediated',
    content_type: 'python',
    package_count: 85,
    version_count: 142,
  },
];

const ecosystemDisplay = (contentType: string) => {
  if (contentType === 'maven') return 'Java (Maven)';
  if (contentType === 'python') return 'Python (PyPI)';
  return contentType;
};

const App = () => {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    enabled: false,
    severityThreshold: 'important',
  });
  const [notifiedRepoUUIDs, setNotifiedRepoUUIDs] = useState<Set<string>>(new Set());

  const toggleRepoNotification = (uuid: string) => {
    setNotifiedRepoUUIDs((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  return (
    <Page>
      <PageSection>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
        >
          <Flex direction={{ default: 'column' }} grow={{ default: 'grow' }}>
            <Content component='h1'>Repositories</Content>
            <Content component='p'>
              Browse Lightwell repositories by ecosystem and security level.
            </Content>
          </Flex>
          <NotificationConfigModal
            preferences={notificationPrefs}
            onSave={setNotificationPrefs}
          >
            <Button
              size='sm'
              variant='secondary'
              aria-label='Notification preferences'
              icon={<BellIcon />}
            >
              Notifications
            </Button>
          </NotificationConfigModal>
        </Flex>
      </PageSection>
      <PageSection>
        <Card style={{ padding: '24px' }}>
          <Table aria-label='Lightwell repositories table' isStriped>
            <Thead>
              <Tr>
                <Th>Repository</Th>
                <Th width={15}>Ecosystem</Th>
                <Th width={15}>Security level</Th>
                <Th width={10}>Packages</Th>
                <Th width={10}>Versions</Th>
                {notificationPrefs.enabled && <Th width={10}>Notify</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {mockRepositories.map((repo) => (
                <Tr key={repo.uuid}>
                  <Td>
                    <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
                      <Flex
                        alignItems={{ default: 'alignItemsCenter' }}
                        gap={{ default: 'gapSm' }}
                      >
                        <Icon size='xl'>
                          {repo.content_type === 'maven' ? <JavaIcon /> : <PythonIcon />}
                        </Icon>
                        <Button variant='link' isInline style={{ fontWeight: 'bold' }}>
                          {formatRepositoryName(repo.content_type, repo.security_level, repo.name)}
                        </Button>
                      </Flex>
                      <FlexItem>
                        <Content component='small'>
                          {getRepositoryDescription(repo.content_type, repo.security_level)}
                        </Content>
                      </FlexItem>
                      <FlexItem>
                        <Label isCompact isClickable icon={<CodeIcon />} variant='outline' color='blue'>
                          Connect to this repository
                        </Label>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td>{ecosystemDisplay(repo.content_type)}</Td>
                  <Td>
                    {repo.security_level === 'validated' ? (
                      <Label variant='outline' color='purple'>
                        {capitalize(repo.security_level)}
                      </Label>
                    ) : (
                      <Label color='purple'>{capitalize(repo.security_level)}</Label>
                    )}
                  </Td>
                  <Td>{repo.package_count.toLocaleString()}</Td>
                  <Td>{repo.version_count.toLocaleString()}</Td>
                  {notificationPrefs.enabled && (
                    <Td>
                      {repo.security_level === 'remediated' ? (
                        <Switch
                          id={`notify-${repo.uuid}`}
                          aria-label={`Toggle notifications for ${formatRepositoryName(repo.content_type, repo.security_level, repo.name)}`}
                          isChecked={notifiedRepoUUIDs.has(repo.uuid)}
                          onChange={() => toggleRepoNotification(repo.uuid)}
                        />
                      ) : (
                        'N/A'
                      )}
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </PageSection>
    </Page>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
