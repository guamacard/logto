import { useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import TextLink from '@/components/TextLink';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import { UserFlow, type VerificationCodeIdentifier } from '@/types';

type Props = {
  readonly identifier?: VerificationCodeIdentifier;
  readonly value?: string;
  readonly className?: string;
};

const ForgotPasswordLink = ({ className, ...identifierData }: Props) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);
  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.ForgotPassword
  );

  return (
    <TextLink
      className={className}
      text="action.forgot_password"
      onClick={async () => {
        // Only proceed if we have a valid verification code identifier (email or phone)
        if (!identifierData.identifier) {
          return;
        }

        setForgotPasswordIdentifierInputValue({
          type: identifierData.identifier,
          value: identifierData.value ?? '',
        });

        await onSubmit({
          identifier: identifierData.identifier,
          value: identifierData.value ?? '',
        });

        // navigate(`/${UserFlow.ForgotPassword}`);
      }}
    />
  );
};

export default ForgotPasswordLink;
