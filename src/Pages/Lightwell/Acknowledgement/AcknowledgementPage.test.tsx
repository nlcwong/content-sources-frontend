import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ReactQueryTestWrapper } from 'testingHelpers';

import AcknowledgementPage from './AcknowledgementPage';
import { useLightwellContentAck } from '../hooks/useLightwellContentAck';

jest.mock('../hooks/useLightwellContentAck', () => ({
  useLightwellContentAck: jest.fn(),
}));

const mockAcknowledge = jest.fn();

const renderPage = () =>
  render(
    <ReactQueryTestWrapper>
      <MemoryRouter>
        <AcknowledgementPage />
      </MemoryRouter>
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  mockAcknowledge.mockReset();
  mockAcknowledge.mockResolvedValue(undefined);
  (useLightwellContentAck as jest.Mock).mockReturnValue({
    hasAcknowledged: false,
    isLoading: false,
    isError: false,
    isAcknowledging: false,
    acknowledge: mockAcknowledge,
    textVersion: 'v1',
  });
});

it('renders acknowledgement title and statements', () => {
  renderPage();

  expect(
    screen.getByRole('heading', { name: 'Lightwell Content Acknowledgment' }),
  ).toBeInTheDocument();
  expect(screen.getByText(/By accessing Red Hat Lightwell/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
});

it('calls acknowledge when Acknowledge is clicked', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(screen.getByRole('button', { name: 'Acknowledge' }));

  expect(mockAcknowledge).toHaveBeenCalledTimes(1);
});

it('shows a blocked state when Decline is clicked and does not acknowledge', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(screen.getByRole('button', { name: 'Decline' }));

  expect(mockAcknowledge).not.toHaveBeenCalled();
  expect(
    screen.getByRole('heading', { name: 'Acknowledgement required' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Review acknowledgement' })).toBeInTheDocument();
});
