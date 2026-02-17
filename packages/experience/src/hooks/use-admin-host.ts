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

    if (window.location.search.includes('legacy_inputs=true')) {
      return true;
    }
    if (window.location.search.includes('legacy_inputs=false')) {
      return false;
    }

    const { hostname } = window.location;
    return hostname === 'auth-admin.guamainternal.com';
  }, []);

  const [isAdminHost, setIsAdminHost] = useState(_isAdminHost);

  return { isAdminHost, setIsAdminHost };
};

export default useAdminHost;
