import { useContext, useState } from 'react';
import { useDebouncedLoader } from 'use-debounced-loader';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import RotatingRingIcon from '@/shared/components/Button/RotatingRingIcon';
import { UserFlow, type VerificationCodeIdentifier } from '@/types';

import styles from './CustomForgotPasswordLink.module.scss';

// import { SignInIdentifier } from '@logto/schemas';

type Props = {
  readonly identifier?: VerificationCodeIdentifier;
  readonly value?: string;
  readonly className?: string;
};

const CustomForgotPasswordLink = ({ className, ...identifierData }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingActive = useDebouncedLoader(isLoading, 300);
  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);
  const { onSubmit } = useSendVerificationCode(UserFlow.ForgotPassword);

  const handleClick = async () => {
    // Only proceed if we have a valid verification code identifier (email or phone)
    // BYPASS THIS BLOCK FOR TESTING
    if (!identifierData.identifier || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // ========== TESTING MODE: Simulated async operations ==========
      // console.log('🔄 Starting forgot password flow...');
      // console.log('📝 Identifier:', identifier, 'Value:', value);

      // // Simulate async operation
      // await new Promise((resolve) => {
      //   setTimeout(resolve, 2000);
      // });

      // console.log('✅ Forgot password flow completed!');

      // ========== REAL IMPLEMENTATION (uncomment when ready) ==========
      setForgotPasswordIdentifierInputValue({
        type: identifierData.identifier,
        value: identifierData.value ?? '',
      });

      // BYPASS SETTING SignInIdentifier.Email IN identifier FOR TESTING
      await onSubmit({
        identifier: identifierData.identifier,
        value: identifierData.value ?? '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button type="button" className={className} disabled={isLoading} onClick={handleClick}>
      {isLoadingActive && (
        <span className={styles.loadingIcon}>
          <RotatingRingIcon />
        </span>
      )}
      <span className={styles.text}>¿Olvidaste tu contraseña?</span>
    </button>
  );
};

export default CustomForgotPasswordLink;
