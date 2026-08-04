import {
  Alert,
  Button,
  ClipboardCopy,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { useState } from 'react';

import { createToken } from './mockTokenData';
import { expirationOptions, type ExpirationOption, type LightwellToken } from './types';

type CreateTokenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (token: LightwellToken) => void;
};

const CreateTokenModal = ({ isOpen, onClose, onCreated }: CreateTokenModalProps) => {
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<ExpirationOption>('90d');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    const { token, secret } = createToken(name.trim(), expiration);
    setCreatedSecret(secret);
    onCreated(token);
  };

  const handleClose = () => {
    setName('');
    setExpiration('90d');
    setCreatedSecret(null);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby='create-token-modal-title'
      ouiaId='create-token-modal'
    >
      <ModalHeader
        title={createdSecret ? 'Token created' : 'Create access token'}
        labelId='create-token-modal-title'
      />
      <ModalBody>
        {createdSecret ? (
          <>
            <Alert
              variant='warning'
              isInline
              isPlain
              title='Copy your token now. You will not be able to see it again.'
              style={{ marginBottom: 16 }}
            />
            <ClipboardCopy
              isReadOnly
              hoverTip='Copy'
              clickTip='Copied'
            >
              {createdSecret}
            </ClipboardCopy>
          </>
        ) : (
          <Form>
            <FormGroup fieldId='token-name' label='Token name' isRequired>
              <TextInput
                id='token-name'
                value={name}
                onChange={(_event, val) => setName(val)}
                placeholder='e.g. CI/CD Pipeline'
                isRequired
              />
            </FormGroup>
            <FormGroup fieldId='token-expiration' label='Expiration'>
              <FormSelect
                id='token-expiration'
                value={expiration}
                onChange={(_event, val) => setExpiration(val as ExpirationOption)}
              >
                {expirationOptions.map((opt) => (
                  <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
                ))}
              </FormSelect>
            </FormGroup>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        {createdSecret ? (
          <Button variant='primary' onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button
              variant='primary'
              onClick={handleCreate}
              isDisabled={!name.trim()}
              ouiaId='create-token-button'
            >
              Create token
            </Button>
            <Button variant='link' onClick={handleClose}>
              Cancel
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CreateTokenModal;
