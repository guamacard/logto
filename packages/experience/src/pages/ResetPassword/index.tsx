import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const ResetPassword = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);
  const { t } = useTranslation();
  const { setToast } = useToast();
  const navigate = useNavigateWithPreservedSearchParams();
  const redirectTo = useGlobalRedirectTo();
  const { show } = usePromiseConfirmModal();
  const { identifierInputValue, setForgotPasswordIdentifierInputValue } =
    useContext(UserInteractionContext);

  const checkPassword = usePasswordPolicyChecker({ setErrorMessage });
  const asyncResetPassword = useApi(resetPassword);
  const handleError = useErrorHandler();
  const { isAppChannel, clearLoginHint } = useGuamaChannel();

  const passwordRejectionErrorHandler = usePasswordRejectionErrorHandler({ setErrorMessage });

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.verification_session_not_found': async (error) => {
        await show({ type: 'alert', ModalContent: error.message, cancelText: 'action.got_it' });
        navigate(-2);
      },
      'user.same_password': (error) => {
        setErrorMessage(error.message);
      },
      ...passwordRejectionErrorHandler,
    }),
    [navigate, passwordRejectionErrorHandler, show]
  );

  const onSubmitHandler = useCallback(
    async (password: string) => {
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
        // navigate('com.guama.app://callback?event=sign-out', { replace: true });
        await redirectTo(new URL('com.guama.app://callback?event=sign-out'));
      } else {
        navigate('/sign-in', { replace: true });
      }
    },
    [
      asyncResetPassword,
      checkPassword,
      errorHandlers,
      handleError,
      navigate,
      setForgotPasswordIdentifierInputValue,
      setToast,
      t,
    ]
  );

  const {
    policy: {
      length: { min, max },
      characterTypes: { min: count },
    },
    requirementsDescription,
  } = usePasswordPolicy();

  return (
    <SecondaryPageLayout
      // title="description.new_password"
      title={
        <>
          Crea tu contraseña <br /> de 6 dígitos
        </>
      }
      // description={requirementsDescription && <span>{requirementsDescription}</span>}
      description=""
      descriptionProps={{ min, count }}
    >
      <div className={styles.dummyCustomInputField}>
        <p>
          {identifierInputValue && identifierInputValue.value.length > 0
            ? identifierInputValue.value
            : '--- ---'}
        </p>
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
