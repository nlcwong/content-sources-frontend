import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@patternfly/react-core';
import { MemoryRouter } from 'react-router-dom';

import { ReactQueryTestWrapper } from 'testingHelpers';

import ConnectRepositoryModal from './ConnectRepositoryModal';
import { requireLightwellAck } from '../../helpers/requireLightwellAck';
import { useLightwellContentAck } from '../../hooks/useLightwellContentAck';

jest.mock('../../hooks/useLightwellContentAck', () => ({
  useLightwellContentAck: jest.fn(),
}));

jest.mock('../../helpers/requireLightwellAck', () => ({
  requireLightwellAck: jest.fn(),
}));

jest.mock('./ConnectRepositoryContent', () => () => <div>Connect content</div>);

const repository = {
  uuid: 'repo-1',
  name: 'lightwell/java/validated',
  published_distribution_url: 'https://example.com/repo/',
  content_type: 'maven',
};

const renderModal = () =>
  render(
    <ReactQueryTestWrapper>
      <MemoryRouter initialEntries={['/java-validated']}>
        <ConnectRepositoryModal repository={repository}>
          <Button>Connect to this repository</Button>
        </ConnectRepositoryModal>
      </MemoryRouter>
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  (requireLightwellAck as jest.Mock).mockReset();
  (useLightwellContentAck as jest.Mock).mockReset();
});

it('opens the modal when the user has acknowledged', async () => {
  const user = userEvent.setup();
  (useLightwellContentAck as jest.Mock).mockReturnValue({
    hasAcknowledged: true,
    isLoading: false,
  });

  renderModal();
  await user.click(screen.getByRole('button', { name: 'Connect to this repository' }));

  expect(await screen.findByText('Connect content')).toBeInTheDocument();
  expect(requireLightwellAck).not.toHaveBeenCalled();
});

it('redirects to the acknowledgement gate when the user has not acknowledged', async () => {
  const user = userEvent.setup();
  (useLightwellContentAck as jest.Mock).mockReturnValue({
    hasAcknowledged: false,
    isLoading: false,
  });

  renderModal();
  await user.click(screen.getByRole('button', { name: 'Connect to this repository' }));

  expect(screen.queryByText('Connect content')).not.toBeInTheDocument();
  expect(requireLightwellAck).toHaveBeenCalled();
});
