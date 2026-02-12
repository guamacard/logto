import { useMemo, useState } from 'react';

/**
 * Hook to detect if the current host is the admin host
 * Returns true if the host is auth-admin.guamainternal.com
 */
const useAdminHost = () => {
  const _isAdminHost = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const hostname = window.location.hostname;
    return hostname === 'auth-admin.guamainternal.com';
  }, []);

  const [isAdminHost, setIsAdminHost] = useState(true);

  return { isAdminHost, setIsAdminHost };
};

export default useAdminHost;

