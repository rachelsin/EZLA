import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ride, User } from '../../api-client';
import { POLLING_INTERVAL, api, getToken, setToken } from '../../Config';

const UserContext = createContext(
  {} as {
    user: User | null;
    setUser: (user: User | null) => void;
    activeRide: Ride | null | undefined;
  }
);

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [didFinishUserInit, setDidFinishUserInit] = useState(false);

  const { data: activeRide } = useQuery({
    queryKey: ['getActiveRideForUser'],
    queryFn: async () => {
      try {
        return await api.ride.getActiveRideForUser();
      } catch (e) {
        return null;
      }
    },
    refetchInterval: POLLING_INTERVAL
  });
  const values = useMemo(() => ({ user, setUser, activeRide }), [user, activeRide]);
  const getCurrentUser = async () => {
    try {
      const userResponse = await api.user.getCurrentUser();
      setUser(userResponse);
    } catch (error) {
      setToken(null);
    } finally {
      setDidFinishUserInit(true);
    }
  };

  useEffect(() => {
    if (getToken() && !user) {
      getCurrentUser();
    } else {
      setDidFinishUserInit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!didFinishUserInit) return null;

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  return useContext(UserContext);
};
