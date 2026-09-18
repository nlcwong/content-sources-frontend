import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ReactQueryTestWrapper } from 'testingHelpers';

import LightwellApp from './LightwellApp';
import { useLightwellContentAck } from 'Pages/Lightwell/hooks/useLightwellContentAck';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    hideGlobalFilter: jest.fn(),
  }),
}));

jest.mock('Hooks/usePageSafe', () => () => true);

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    features: {},
    isFetchingPermissions: false,
  }),
}));

jest.mock('Pages/Lightwell/hooks/useLightwellContentAck', () => ({
  LightwellContentAckProvider: ({ children }: { children: React.ReactNode }) => children,
  useLightwellContentAck: jest.fn(),
}));

jest.mock('Pages/Lightwell/Repositories/RepositoriesTable', () => () => (
  <div>Repositories table</div>
));

beforeEach(() => {
  (useLightwellContentAck as jest.Mock).mockReset();
});

const renderApp = () =>
  render(
    <ReactQueryTestWrapper>
      <MemoryRouter initialEntries={['/']}>
        <LightwellApp />
      </MemoryRouter>
    </ReactQueryTestWrapper>,
  );

it('shows the acknowledgement page when the user has not acknowledged', () => {
  (useLightwellContentAck as jest.Mock).mockReturnValue({
    hasAcknowledged: false,
    isLoading: false,
    isError: false,
    isAcknowledging: false,
    acknowledge: jest.fn(),
    textVersion: 'v1',
  });

  renderApp();

  expect(
    screen.getByRole('heading', { name: 'Lightwell Content Acknowledgment' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('Repositories table')).not.toBeInTheDocument();
});

it('shows Lightwell routes when the user has acknowledged', () => {
  (useLightwellContentAck as jest.Mock).mockReturnValue({
    hasAcknowledged: true,
    isLoading: false,
    isError: false,
    isAcknowledging: false,
    acknowledge: jest.fn(),
    textVersion: 'v1',
  });

  renderApp();

  expect(screen.getByText('Repositories table')).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Lightwell Content Acknowledgment' }),
  ).not.toBeInTheDocument();
});
