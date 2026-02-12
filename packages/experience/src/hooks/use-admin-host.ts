import { useMemo } from 'react';

/**
 * Hook to detect if the current host is the admin host
 * Returns true if the host is auth-admin.guamainternal.com
 */
const useAdminHost = () => {
  const isAdminHost = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const hostname = window.location.hostname;
    return hostname === 'auth-admin.guamainternal.com';
  }, []);

  return isAdminHost;
};

export default useAdminHost;

