import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { resetPassword } from '@/apis/experience';
import SetPassword from '@/containers/SetPassword';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useGuamaChannel from '@/hooks/use-guama-channel';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import usePasswordPolicyChecker from '@/hooks/use-password-policy-checker';
import usePasswordRejectionErrorHandler from '@/hooks/use-password-rejection-handler';
import { usePasswordPolicy } from '@/hooks/use-sie';
import useToast from '@/hooks/use-toast';

import styles from './index.module.scss';

const ResetPasswordConfirm = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);
  const { t } = useTranslation();
  const { setToast } = useToast();
  const navigate = useNavigateWithPreservedSearchParams();
  const redirectTo = useGlobalRedirectTo();
  const { show } = usePromiseConfirmModal();
  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);
  const location = useLocation();

  // Get the password from the previous step
  const firstPassword = location.state?.password as string | undefined;

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });
  const asyncResetPassword = useApi(resetPassword);
  const handleError = useErrorHandler();
  const { isAppChannel, clearLoginHint, loginHint } = useGuamaChannel();

  // Create a local copy of loginHint to display in UI
  // This prevents the dummy input from showing "--- ---" when clearLoginHint() is called
  const [displayEmail, setDisplayEmail] = useState(loginHint);

  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.verification_session_not_found': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-2);
      },
      'user.same_password': (error) => {
        setErrorMessage(
          error.message + ' Serás redirigido en 3 segundos para intentarlo de nuevo.'
        );
        setTimeout(() => {
          clearErrorMessage();
          navigate(-1);
        }, 3500);
      },
      ...passwordRejectionErrorHandler,
    }),
    [navigate, passwordRejectionErrorHandler, show]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
      // Validate that passwords match
      if (!firstPassword) {
        navigate(-1);
        return;
      }

      if (password !== firstPassword) {
        setErrorMessage(
          'Las contraseñas no coinciden. Serás redirigido en 3 segundos para intentarlo de nuevo.'
        );
        setTimeout(() => {
          clearErrorMessage();
          navigate(-1);
        }, 3500);
        return;
      }

      const success = await checkPassword(password);

      if (!success) {
        return;
      }

      const [error] = await asyncResetPassword(password);

      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      // Clear the forgot password identifier input value
      setForgotPasswordIdentifierInputValue(undefined);
      setToast(t('description.password_changed'));

      if (isAppChannel) {
        clearLoginHint();
        await redirectTo(new URL('com.guama.app://callback?event=sign-out'));
      } else {
        navigate('/sign-in', { replace: true });
      }
    },
    [
      firstPassword,
      asyncResetPassword,
      checkPassword,
      errorHandlers,
      handleError,
      navigate,
      setForgotPasswordIdentifierInputValue,
      setToast,
      t,
      isAppChannel,
      clearLoginHint,
      redirectTo,
    ]
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
          Confirma tu <br /> contraseña
        </>
      }
      description=""
    >
      <div className={styles.dummyCustomInputField}>
        <p>{displayEmail ?? '--- ---'}</p>
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

      <div
        style={{
          height: '15px',
        }}
      />

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

export default ResetPasswordConfirm;
