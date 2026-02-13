import { ExtraParamsKey } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const GUAMA_LOGIN_HINT_KEY = 'guama_login_hint';

/**
 * Hook to detect if the user is coming from the Guama app (WebView)
 *
 * Strategy: If login_hint parameter exists in the URL, it means the user is coming from the app.
 * The app always sends login_hint, while web users don't.
 *
 * Usage:
 * - Detects if URL has `login_hint` parameter (email)
 * - Saves the login_hint to sessionStorage when detected
 * - Returns isAppChannel (true if login_hint exists) and the loginHint value
 * - Provides a method to clear the stored value
 *
 * @returns {Object} - { isAppChannel: boolean, loginHint: string | null, clearLoginHint: () => void }
 */
const useGuamaChannel = () => {
  const [searchParams] = useSearchParams();
  const [loginHint, setLoginHint] = useState<string | null>(() => {
    // Initialize from sessionStorage
    return sessionStorage.getItem(GUAMA_LOGIN_HINT_KEY);
  });

  useEffect(() => {
    // Check if the URL has the login_hint parameter
    const loginHintParam = searchParams.get(ExtraParamsKey.LoginHint);

    if (loginHintParam) {
      // Save to sessionStorage
      sessionStorage.setItem(GUAMA_LOGIN_HINT_KEY, loginHintParam);
      setLoginHint(loginHintParam);
    }
  }, [searchParams]);

  const clearLoginHint = () => {
    sessionStorage.removeItem(GUAMA_LOGIN_HINT_KEY);
    setLoginHint(null);
  };

  return {
    /** Whether the user is coming from the app (true if login_hint exists) */
    isAppChannel: Boolean(loginHint),
    /** The login hint (email) from URL parameter or null */
    loginHint,
    /** Clear the stored login hint value */
    clearLoginHint,
  };
};

export default useGuamaChannel;
