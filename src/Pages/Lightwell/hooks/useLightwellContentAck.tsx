import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

import {
  useSetLightwellContentAckMutation,
  useUserPreferencesQuery,
  UserPreference,
} from 'services/Lightwell/UserPreferencesQueries';

import {
  ACKNOWLEDGED_LIGHTWELL_CONTENT,
  LIGHTWELL_ACK_TEXT_VERSION,
  LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
  LIGHTWELL_CONTENT_ACK_STORAGE_KEY,
  LIGHTWELL_USE_MOCK,
  type LightwellContentAckValue,
} from '../constants';
import { useLightwellDemo } from '../LightwellDemoContext';

export const parseLightwellContentAck = (
  preferences: UserPreference[] | undefined,
  expectedTextVersion: string = LIGHTWELL_ACK_TEXT_VERSION,
): boolean => {
  if (preferences == null || preferences.length === 0) return false;

  const rawValue = preferences.find(
    ({ label }) => label === LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
  )?.value;
  if (rawValue == null) return false;

  try {
    const parsed = JSON.parse(rawValue) as LightwellContentAckValue;
    return parsed.acknowledged === true && parsed.textVersion === expectedTextVersion;
  } catch {
    return false;
  }
};

const readLocalAck = (): boolean => {
  try {
    const rawValue = localStorage.getItem(LIGHTWELL_CONTENT_ACK_STORAGE_KEY);
    if (rawValue == null) return false;
    const parsed = JSON.parse(rawValue) as LightwellContentAckValue;
    return (
      parsed.acknowledged === true && parsed.textVersion === LIGHTWELL_ACK_TEXT_VERSION
    );
  } catch {
    return false;
  }
};

const writeLocalAck = (value: LightwellContentAckValue) => {
  localStorage.setItem(LIGHTWELL_CONTENT_ACK_STORAGE_KEY, JSON.stringify(value));
};

type LightwellContentAckContextValue = {
  hasAcknowledged: boolean;
  isLoading: boolean;
  isError: boolean;
  isAcknowledging: boolean;
  acknowledge: () => Promise<void>;
  textVersion: string;
};

const LightwellContentAckContext = createContext<LightwellContentAckContextValue | null>(null);

type LightwellContentAckProviderProps = {
  children: ReactNode;
};

export const LightwellContentAckProvider = ({ children }: LightwellContentAckProviderProps) => {
  const isDemo = useLightwellDemo();
  const { pathname } = useLocation();
  const isDemoPath = /(^|\/)demo(\/|$)/.test(pathname);
  const useLocalPersistence = LIGHTWELL_USE_MOCK || isDemo || isDemoPath;
  const [localAcknowledged, setLocalAcknowledged] = useState(readLocalAck);

  const query = useUserPreferencesQuery(!useLocalPersistence);
  const mutation = useSetLightwellContentAckMutation();

  const hasAcknowledged = useLocalPersistence
    ? localAcknowledged
    : parseLightwellContentAck(query.data);

  const acknowledge = useCallback(async () => {
    if (useLocalPersistence) {
      writeLocalAck(ACKNOWLEDGED_LIGHTWELL_CONTENT);
      setLocalAcknowledged(true);
      return;
    }

    await mutation.mutateAsync(ACKNOWLEDGED_LIGHTWELL_CONTENT);
  }, [mutation, useLocalPersistence]);

  const value = useMemo(
    () => ({
      hasAcknowledged,
      isLoading: !useLocalPersistence && query.isLoading,
      isError: !useLocalPersistence && query.isError,
      isAcknowledging: mutation.isPending,
      acknowledge,
      textVersion: LIGHTWELL_ACK_TEXT_VERSION,
    }),
    [
      acknowledge,
      hasAcknowledged,
      mutation.isPending,
      query.isError,
      query.isLoading,
      useLocalPersistence,
    ],
  );

  return (
    <LightwellContentAckContext.Provider value={value}>
      {children}
    </LightwellContentAckContext.Provider>
  );
};

/**
 * Returns whether the current user has acknowledged the Lightwell content gate.
 * Must be used under LightwellContentAckProvider (except in tests that mock this hook).
 */
export const useLightwellContentAck = (): LightwellContentAckContextValue => {
  const context = useContext(LightwellContentAckContext);
  if (context == null) {
    throw new Error('useLightwellContentAck must be used within LightwellContentAckProvider');
  }
  return context;
};
