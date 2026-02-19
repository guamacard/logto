import { AgreeToTermsPolicy, SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import LockIcon from '@/assets/icons/lock.svg?react';
import { SmartInputField, PinPasswordInput, PasswordInputField } from '@/components/InputFields';
import CaptchaBox from '@/containers/CaptchaBox';
// import ForgotPasswordLink from '@/containers/ForgotPasswordLink';
import TermsAndPrivacyCheckbox from '@/containers/TermsAndPrivacyCheckbox';
import useAdminHost from '@/hooks/use-admin-host';
// import useGuamaChannel from '@/hooks/use-guama-channel';
import useLoginHint from '@/hooks/use-login-hint';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import usePrefilledIdentifier from '@/hooks/use-prefilled-identifier';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import useSingleSignOnWatch from '@/hooks/use-single-sign-on-watch';
import useTerms from '@/hooks/use-terms';
import Button from '@/shared/components/Button';
import ErrorMessage from '@/shared/components/ErrorMessage';
import type { IdentifierInputValue } from '@/shared/components/InputFields/SmartInputField';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import CustomForgotPasswordLink from './CustomForgotPasswordLink';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly signInMethods: SignInIdentifier[];
};

export type FormState = {
  identifier: IdentifierInputValue;
  password: string;
};

const PasswordSignInForm = ({ className, autoFocus, signInMethods }: Props) => {
  const { t } = useTranslation();

  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const prefilledIdentifier = usePrefilledIdentifier({ enabledIdentifiers: signInMethods });
  const loginHint = useLoginHint();
  const { isAdminHost, setIsAdminHost } = useAdminHost();
  // useGuamaChannel();

  // Disable the identifier input if there's a login hint from URL
  const isIdentifierDisabled = Boolean(loginHint);

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormState>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: prefilledIdentifier,
      password: '',
    },
  });

  const { showSingleSignOnForm, navigateToSingleSignOn } = useSingleSignOnWatch(
    watch('identifier')
  );

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      await handleSubmit(async ({ identifier: { type, value }, password }) => {
        if (!type) {
          return;
        }

        setIdentifierInputValue({ type, value });

        if (showSingleSignOnForm) {
          await navigateToSingleSignOn();
          return;
        }

        // Check if the user has agreed to the terms and privacy policy before signing in when the policy is set to `Manual`
        if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
          return;
        }

        await onSubmit({
          identifier: { type, value },
          password,
        });
      })(event);
    },
    [
      agreeToTermsPolicy,
      clearErrorMessage,
      handleSubmit,
      navigateToSingleSignOn,
      onSubmit,
      setIdentifierInputValue,
      showSingleSignOnForm,
      termsValidation,
    ]
  );

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <div>
        <Controller
          control={control}
          name="identifier"
          rules={{
            validate: ({ type, value }) => {
              if (!type || !value) {
                return getGeneralIdentifierErrorMessage(signInMethods, 'required');
              }

              const errorMessage = validateIdentifierField(type, value);

              return errorMessage
                ? getGeneralIdentifierErrorMessage(signInMethods, 'invalid')
                : true;
            },
          }}
          render={({ field, formState: { defaultValues } }) => {
            return (
              <div className={styles.identifierFieldWrapper}>
                {/* Always render SmartInputField so react-hook-form can register it */}
                <SmartInputField
                  autoFocus={autoFocus && !isIdentifierDisabled}
                  className={classNames(styles.inputField, !isAdminHost && styles.hiddenInputField)}
                  {...field}
                  isDanger={!!errors.identifier}
                  errorMessage={errors.identifier?.message}
                  enabledTypes={signInMethods}
                  defaultValue={defaultValues?.identifier?.value}
                />

                {/* Show dummy input when not admin host */}
                {!isAdminHost && (
                  <div className={styles.dummyCustomInputField}>
                    <p>
                      {field.value.value && field.value.value.length > 0
                        ? field.value.value
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
                )}
              </div>
            );
          }}
          // render={({ field, formState: { defaultValues } }) => {
          //   return (
          //     <>
          //       <SmartInputField
          //         autoFocus={autoFocus && !isIdentifierDisabled}
          //         className={styles.inputField}
          //         {...field}
          //         isDanger={!!errors.identifier}
          //         errorMessage={errors.identifier?.message}
          //         enabledTypes={signInMethods}
          //         defaultValue={defaultValues?.identifier?.value}
          //         // disabled={isIdentifierDisabled}
          //       />
          //       <div className={styles.dummyCustomInputField}>
          //         <p>
          //           {defaultValues?.identifier?.value && defaultValues.identifier.value.length > 0
          //             ? defaultValues.identifier.value
          //             : '--- ---'}
          //         </p>
          //         <svg
          //           width="28"
          //           height="28"
          //           viewBox="0 0 28 28"
          //           fill="none"
          //           xmlns="http://www.w3.org/2000/svg"
          //         >
          //           <circle cx="14" cy="14" r="14" fill="white" />
          //           <circle cx="14" cy="14" r="10.5" fill="#FF8473" />
          //           <path
          //             d="M10 13.8L12.8 16.6L18.4 11"
          //             stroke="white"
          //             strokeWidth="3"
          //             strokeLinecap="round"
          //             strokeLinejoin="round"
          //           />
          //         </svg>
          //       </div>
          //     </>
          //   );
          // }}
        />

        <div
          style={{
            height: '10px',
          }}
        />

        {showSingleSignOnForm && (
          <div className={styles.message}>{t('description.single_sign_on_enabled')}</div>
        )}

        {/* ORIGINAL SECTION */}
        {/* <PasswordInputField
        className={styles.inputField}
        autoComplete="current-password"
        label={t('input.password')}
        isDanger={!!errors.password}
        errorMessage={errors.password?.message}
        autoFocus={autoFocus && isIdentifierDisabled}
        {...register('password', { required: t('error.password_required') })}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: t('error.password_required') }}
        render={({ field }) => (
          <PinPasswordInput
            ref={field.ref}
            className={styles.inputField}
            name="password"
            value={field.value}
            errorMessage={errors.password?.message}
            isAutoFocus={autoFocus && isIdentifierDisabled}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      /> */}

        {/* CUSTOM SECTION */}
        {!showSingleSignOnForm &&
          (isAdminHost ? (
            <PasswordInputField
              className={styles.inputField}
              autoComplete="current-password"
              label={t('input.password')}
              isDanger={!!errors.password}
              errorMessage={errors.password?.message}
              autoFocus={autoFocus && isIdentifierDisabled}
              {...register('password', { required: t('error.password_required') })}
            />
          ) : (
            <Controller
              control={control}
              name="password"
              rules={{ required: t('error.password_required') }}
              render={({ field }) => (
                <PinPasswordInput
                  ref={field.ref}
                  className={styles.inputField}
                  name="password"
                  value={field.value}
                  errorMessage={errors.password?.message}
                  isAutoFocus={autoFocus && isIdentifierDisabled}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          ))}

        {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

        {isForgotPasswordEnabled && !showSingleSignOnForm && (
          <div className={styles.customForgotPassword}>
            <CustomForgotPasswordLink
              className={styles.link}
              identifier={
                watch('identifier').type === SignInIdentifier.Email
                  ? SignInIdentifier.Email
                  : watch('identifier').type === SignInIdentifier.Phone
                    ? SignInIdentifier.Phone
                    : undefined
              }
              value={watch('identifier').value}
            />
          </div>
        )}

        {/**
         * Have to use css to hide the terms element.
         * Remove element from dom will trigger a form re-render.
         * Form rerender will trigger autofill.
         * If the autofill value is SSO enabled, it will always show SSO form.
         */}
        <TermsAndPrivacyCheckbox
          className={classNames(
            styles.terms,
            // For sign in, only show the terms checkbox if the terms policy is manual
            agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && styles.hidden
          )}
        />

        <CaptchaBox />
      </div>

      <div>
        <div
          style={{
            height: '20px',
          }}
        />

        <Button
          name="submit"
          title={showSingleSignOnForm ? 'action.single_sign_on' : 'action.sign_in'}
          icon={showSingleSignOnForm ? <LockIcon /> : undefined}
          htmlType="submit"
          isLoading={isSubmitting}
        />

        {/* <div
        style={{
          height: '40px',
        }}
      /> */}

        {/* <div>
        <input
          type="checkbox"
          name="remember"
          value="true"
          onChange={() => {
            setIsAdminHost(!isAdminHost);
          }}
        />
      </div> */}

        <input hidden type="submit" />
      </div>
    </form>
  );
};

export default PasswordSignInForm;
