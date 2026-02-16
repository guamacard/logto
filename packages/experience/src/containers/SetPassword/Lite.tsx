import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import ErrorMessage from '@/shared/components/ErrorMessage';
import PinPasswordInput from '@/shared/components/InputFields/PinPasswordInput';

import HiddenIdentifierInput from './HiddenIdentifierInput';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly onSubmit: (password: string) => Promise<void>;
  readonly errorMessage?: string;
  readonly clearErrorMessage?: () => void;
};

type FieldState = {
  newPassword: string;
};

const Lite = ({ className, autoFocus, onSubmit, errorMessage, clearErrorMessage }: Props) => {
  const { t } = useTranslation();

  const {
    // register,
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FieldState>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { newPassword: '' },
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage?.();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage?.();

      await handleSubmit(async (data) => {
        await onSubmit(data.newPassword);
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <HiddenIdentifierInput />
      {/* <PasswordInputField
        className={styles.inputField}
        autoComplete="new-password"
        label={t('input.password')}
        autoFocus={autoFocus}
        isDanger={!!errors.newPassword}
        errorMessage={errors.newPassword?.message}
        aria-invalid={!!errors.newPassword}
        {...register('newPassword', {
          required: t('error.password_required'),
        })}
      /> */}

      <Controller
        control={control}
        name="newPassword"
        rules={{ required: t('error.password_required') }}
        render={({ field }) => (
          <PinPasswordInput
            ref={field.ref}
            showDigits
            className={styles.inputField}
            name="newPassword"
            value={field.value}
            errorMessage={errors.newPassword?.message}
            isAutoFocus={autoFocus}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <div
        style={{
          height: '20px',
        }}
      />

      <Button
        name="submit"
        title="action.save_password"
        htmlType="submit"
        isLoading={isSubmitting}
        className={styles.button}
      />

      <input hidden type="submit" />
    </form>
  );
};

export default Lite;
