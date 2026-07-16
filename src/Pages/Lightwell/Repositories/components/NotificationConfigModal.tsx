import {
  Button,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  Switch,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import {
  SeverityCriticalIcon,
  SeverityImportantIcon,
  SeverityModerateIcon,
  SeverityMinorIcon,
} from '@patternfly/react-icons';
import {
  t_global_color_severity_critical_100,
  t_global_color_severity_important_100,
  t_global_color_severity_moderate_100,
  t_global_color_severity_minor_100,
  t_global_spacer_sm,
} from '@patternfly/react-tokens';
import { cloneElement, type ComponentType, ReactElement, useState } from 'react';
import { createUseStyles } from 'react-jss';

type Severity = 'critical' | 'important' | 'moderate' | 'low';
export interface NotificationPreferences {
  enabled: boolean;
  severityThreshold: Severity;
}

type NotificationConfigModalProps = {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => void;
  children: ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
};

const severityOptions: {
  value: Severity;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    value: 'critical',
    label: 'Critical',
    icon: SeverityCriticalIcon,
    color: t_global_color_severity_critical_100.value,
  },
  {
    value: 'important',
    label: 'Important and above',
    icon: SeverityImportantIcon,
    color: t_global_color_severity_important_100.value,
  },
  {
    value: 'moderate',
    label: 'Moderate and above',
    icon: SeverityModerateIcon,
    color: t_global_color_severity_moderate_100.value,
  },
  {
    value: 'low',
    label: 'All severities',
    icon: SeverityMinorIcon,
    color: t_global_color_severity_minor_100.value,
  },
];

const useSeverityStyles = createUseStyles({
  severityLabel: {
    display: 'inline-flex',
    alignItems: 'center',
  },
});

const NotificationConfigModal = ({
  preferences: savedPreferences,
  onSave,
  children,
}: NotificationConfigModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<NotificationPreferences>(savedPreferences);
  const [activeTab, setActiveTab] = useState<string | number>('email');

  const openModal = () => {
    setDraft(savedPreferences);
    setActiveTab('email');
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const trigger = cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented) {
        openModal();
      }
    },
  });

  const severityClasses = useSeverityStyles();

  const handleSave = () => {
    onSave(draft);
    closeModal();
  };

  return (
    <>
      {trigger}
      <Modal
        variant={ModalVariant.medium}
        position='top'
        isOpen={isOpen}
        onClose={closeModal}
        aria-labelledby='lightwell-notification-config-modal-title'
        ouiaId='lightwell-notification-config-modal'
      >
        <ModalHeader
          title='Notification preferences'
          labelId='lightwell-notification-config-modal-title'
          description='Get notified when vulnerability fixes are available for packages in your repositories.'
        />
        <ModalBody>
          <Tabs
            activeKey={activeTab}
            onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
            aria-label='Notification channel tabs'
          >
            <Tab eventKey='email' title={<TabTitleText>Email</TabTitleText>}>
              <TabContent id='email-tab'>
                <TabContentBody hasPadding>
                  <Form>
                    <FormGroup fieldId='notification-toggle' label='Email notifications'>
                      <Switch
                        id='notification-toggle'
                        label={
                          draft.enabled
                            ? 'Notify me when fixes are available'
                            : 'Notifications are off'
                        }
                        isChecked={draft.enabled}
                        onChange={(_event, checked) =>
                          setDraft((prev) => ({ ...prev, enabled: checked }))
                        }
                        ouiaId='notification-toggle'
                      />
                    </FormGroup>

                    {draft.enabled && (
                      <FormGroup
                        fieldId='severity-threshold'
                        label='Severity threshold'
                        role='radiogroup'
                      >
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem>
                              Get notified when fixes are available for vulnerabilities of the following severity.
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                        {severityOptions.map(({ value, label, icon: SevIcon, color }) => (
                          <Radio
                            key={value}
                            id={`severity-${value}`}
                            name='severity-threshold'
                            label={
                              <span className={severityClasses.severityLabel}>
                                <span style={{ color, marginRight: t_global_spacer_sm.var, display: 'inline-flex' }}>
                                  <SevIcon />
                                </span>
                                {label}
                              </span>
                            }
                            isChecked={draft.severityThreshold === value}
                            onChange={() =>
                              setDraft((prev) => ({ ...prev, severityThreshold: value }))
                            }
                          />
                        ))}
                      </FormGroup>
                    )}
                  </Form>
                </TabContentBody>
              </TabContent>
            </Tab>
            <Tab eventKey='slack' title={<TabTitleText>Slack</TabTitleText>}>
              <TabContent id='slack-tab'>
                <TabContentBody hasPadding>
                  <Content component='p'>
                    Connect a Slack workspace to receive notifications in your team's channels. Coming soon.
                  </Content>
                </TabContentBody>
              </TabContent>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            key='save'
            variant='primary'
            onClick={handleSave}
            ouiaId='notification-save-button'
          >
            Save
          </Button>
          <Button key='cancel' variant='link' onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default NotificationConfigModal;
