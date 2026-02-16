import type { Nullable } from '@silverhand/essentials';
import type { Ref, FormEventHandler, KeyboardEventHandler, ClipboardEventHandler } from 'react';
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';

import ErrorMessage from '@/shared/components/ErrorMessage';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name: string;
  readonly value?: string;
  readonly errorMessage?: string;
  readonly isAutoFocus?: boolean;
  readonly showDigits?: boolean; // If true, show digits instead of password dots
  readonly onChange?: (value: string) => void;
  readonly onBlur?: () => void;
};

const PIN_LENGTH = 6;

const isNumeric = (char: string) => /^\d+$/.test(char);

const normalize = (value: string[], length: number): string[] => {
  if (value.length > length) {
    return value.slice(0, length);
  }

  if (value.length < length) {
    return value.concat(Array.from<string>({ length: length - value.length }).fill(''));
  }

  return value;
};

const PinPasswordInput = (
  {
    className,
    name,
    value = '',
    errorMessage,
    isAutoFocus,
    showDigits = false,
    onChange,
    onBlur,
  }: Props,
  ref: Ref<Nullable<HTMLInputElement>>
) => {
  // Hidden input for form compatibility
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => hiddenInputRef.current);

  // Convert string value to array for PIN inputs
  const [pinValues, setPinValues] = useState<string[]>(() => {
    return value.split('').slice(0, PIN_LENGTH);
  });

  /* eslint-disable @typescript-eslint/ban-types */
  const inputReferences = useRef<Array<HTMLInputElement | null>>(
    Array.from<null>({ length: PIN_LENGTH }).fill(null)
  );
  /* eslint-enable @typescript-eslint/ban-types */

  const codes = useMemo(() => normalize(pinValues, PIN_LENGTH), [pinValues]);

  // Sync external value changes to internal state
  useEffect(() => {
    const newPinValues = value.split('').slice(0, PIN_LENGTH);
    setPinValues(newPinValues);
  }, [value]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (isAutoFocus && pinValues.length === 0) {
      inputReferences.current[0]?.focus();
    }
  }, [isAutoFocus, pinValues.length]);

  const updateValue = useCallback(
    (data: string, targetId: number) => {
      // Filter non-numeric input
      if (!isNumeric(data)) {
        return;
      }

      const chars = data.split('');
      const trimmedChars = chars.slice(0, Math.min(chars.length, codes.length - targetId));

      const newValue = [
        ...codes.slice(0, targetId),
        ...trimmedChars,
        ...codes.slice(targetId + trimmedChars.length, codes.length),
      ];

      setPinValues(newValue);
      onChange?.(newValue.join(''));

      // Move to the next target
      const nextTarget =
        inputReferences.current[Math.min(targetId + trimmedChars.length, codes.length - 1)];
      nextTarget?.focus();
    },
    [codes, onChange]
  );

  const onInputHandler: FormEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { target } = event;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      const { value, dataset } = target;

      if (!dataset.id) {
        return;
      }

      event.preventDefault();
      updateValue(value, Number(dataset.id));
    },
    [updateValue]
  );

  const onPasteHandler: ClipboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }

      const {
        target: { dataset },
        clipboardData,
      } = event;

      const data = clipboardData.getData('text').match(/\d/g)?.join('') ?? '';

      if (!dataset.id) {
        return;
      }

      event.preventDefault();
      updateValue(data, Number(dataset.id));
    },
    [updateValue]
  );

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { key, target } = event;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      const { value, dataset } = target;

      if (!dataset.id) {
        return;
      }

      const targetId = Number(dataset.id);
      const nextTarget = inputReferences.current[targetId + 1];
      const previousTarget = inputReferences.current[targetId - 1];

      switch (key) {
        case 'Backspace': {
          event.preventDefault();

          if (value) {
            const newCodes = Object.assign([], codes, { [targetId]: '' });
            setPinValues(newCodes);
            onChange?.(newCodes.join(''));
            break;
          }

          if (previousTarget) {
            previousTarget.focus();
            const newCodes = Object.assign([], codes, { [targetId - 1]: '' });
            setPinValues(newCodes);
            onChange?.(newCodes.join(''));
          }

          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          previousTarget?.focus();
          break;
        }

        case 'ArrowRight': {
          event.preventDefault();
          nextTarget?.focus();
          break;
        }

        case '+':
        case '-':
        case 'e':
        case '.':
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault();
          break;
        }

        default: {
          break;
        }
      }
    },
    [codes, onChange]
  );

  // Debug: Log error message to console
  useEffect(() => {
    if (errorMessage) {
      console.log('PinPasswordInput errorMessage:', errorMessage);
    }
  }, [errorMessage]);

  return (
    <div className={className}>
      {/* Hidden input for react-hook-form compatibility */}
      <input
        ref={hiddenInputRef}
        onBlur={onBlur}
        onChange={() => {
          // Controlled by PIN inputs
        }}
        type="password"
        name={name}
        value={pinValues.join('')}
        style={{ display: 'none' }}
        autoComplete="current-password"
      />

      {/* Visual PIN input - shows digits or password dots based on showDigits prop */}
      <div className={styles.pinContainer}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <input
            ref={(element) => {
              // eslint-disable-next-line @silverhand/fp/no-mutation
              inputReferences.current[index] = element;
            }}
            // eslint-disable-next-line react/no-array-index-key
            key={`${name}_${index}`}
            name={`${name}_${index}`}
            data-id={index}
            value={codes[index]}
            type={showDigits ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className={styles.pinInput}
            onPaste={onPasteHandler}
            onInput={onInputHandler}
            onKeyDown={onKeyDownHandler}
          />
        ))}
      </div>
      {errorMessage && <ErrorMessage className={styles.errorMessage}>{errorMessage}</ErrorMessage>}
    </div>
  );
};

export default forwardRef(PinPasswordInput);
