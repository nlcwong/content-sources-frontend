import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { cloneElement, ReactElement, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ContentItem } from 'services/Content/ContentApi';

import { requireLightwellAck } from '../../helpers/requireLightwellAck';
import { useLightwellContentAck } from '../../hooks/useLightwellContentAck';
import ConnectRepositoryContent from './ConnectRepositoryContent';

type ConnectRepositoryModalProps = {
  repository: Pick<ContentItem, 'name' | 'published_distribution_url' | 'content_type' | 'uuid'>;
  children: ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
};

const ConnectRepositoryModal = ({ repository, children }: ConnectRepositoryModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAcknowledged, isLoading: isAckLoading } = useLightwellContentAck();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const trigger = cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (isAckLoading) {
        event.preventDefault();
        return;
      }

      if (!hasAcknowledged) {
        event.preventDefault();
        requireLightwellAck(navigate, `${location.pathname}${location.search}`);
        return;
      }

      openModal();
    },
  });

  return (
    <>
      {trigger}
      <Modal
        variant={ModalVariant.large}
        position='top'
        isOpen={isOpen && hasAcknowledged}
        onClose={closeModal}
        aria-labelledby='lightwell-connect-repository-modal-title'
        ouiaId='lightwell-connect-repository-modal'
      >
        <ModalHeader
          title='Connect to this repository'
          labelId='lightwell-connect-repository-modal-title'
        />
        <ModalBody>
          <ConnectRepositoryContent repository={repository} />
        </ModalBody>
      </Modal>
    </>
  );
};

export default ConnectRepositoryModal;
