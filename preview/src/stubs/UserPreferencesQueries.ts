import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
  type LightwellContentAckValue,
  type UserPreference,
  type UserPreferencesResponse,
} from 'services/Lightwell/UserPreferencesApi';

export const USER_PREFERENCES_KEY = 'USER_PREFERENCES_KEY';

export const useUserPreferencesQuery = (shouldFetch = true) =>
  useQuery({
    queryKey: [USER_PREFERENCES_KEY],
    queryFn: async (): Promise<UserPreferencesResponse> => [],
    enabled: shouldFetch,
  });

export const useSetLightwellContentAckMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: LightwellContentAckValue) => value,
    onMutate: async (value) => {
      await queryClient.cancelQueries({ queryKey: [USER_PREFERENCES_KEY] });
      const previousData = queryClient.getQueryData<UserPreferencesResponse>([
        USER_PREFERENCES_KEY,
      ]);
      queryClient.setQueryData<UserPreferencesResponse>([USER_PREFERENCES_KEY], (current) => {
        const next = [...(current ?? [])];
        const preference = {
          label: LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
          value: JSON.stringify(value),
        };
        const index = next.findIndex(({ label }) => label === LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL);
        if (index >= 0) {
          next[index] = preference;
        } else {
          next.push(preference);
        }
        return next;
      });
      return { previousData };
    },
  });
};

export type { UserPreference, UserPreferencesResponse };
