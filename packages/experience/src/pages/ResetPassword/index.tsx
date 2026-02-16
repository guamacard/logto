import { useCallback, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SetPassword from '@/containers/SetPassword';
import useGuamaChannel from '@/hooks/use-guama-channel';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import { usePasswordPolicy } from '@/hooks/use-sie';

import styles from './index.module.scss';

const ResetPassword = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);
  const navigate = useNavigateWithPreservedSearchParams();
  const { loginHint } = useGuamaChannel();

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });

  const onSubmitHandler = useCallback(
    async (password: string) => {
      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      // Navigate to confirmation page with the password in state
      navigate('/forgot-password/confirm', { state: { password } });
    },
    [checkPassword, navigate]
  );

  const {
    policy: {
      length: { max },
    },
  } = usePasswordPolicy();

  return (
    <SecondaryPageLayout
      title={
        <>
          Crea tu contraseña <br /> de 6 dígitos
        </>
      }
      description=""
    >
      <div className={styles.dummyCustomInputField}>
        <p>{loginHint ?? '--- ---'}</p>
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="14" cy="14" r="14" fill="white" />
          <circle cx="14" cy="14" r="10.5" fill="#FF8473" />
          <path
            d="M10 13.8L12.8 16.6L18.4 11"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <SetPassword
        autoFocus
        errorMessage={errorMessage}
        maxLength={max}
        clearErrorMessage={clearErrorMessage}
        onSubmit={onSubmitHandler}
      />
    </SecondaryPageLayout>
  );
};

export default ResetPassword;
