import { isDev } from 'api/api_helpers';
import { useEffect, useState } from 'react';
import { InboundObj } from 'types/form_types';
import { removeProps } from 'utils/common_helpers';

/**
 * hook that can be used in forms to determine if any of the child input components have errors
 * @returns a boolean set to true if there are errors,
 * @returns a function handler that checks for errors that should be called when an input changes
 * @retursn a function that can reset the error state
 */
export default function useFormHasError(): [boolean, (r: InboundObj) => void, () => void] {
  const [errorsExist, setErrorsExist] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const numErrs = Object.keys(errors).length;
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.log(`useFormHasError state updated, ${numErrs} errors ${JSON.stringify(errors)}`);
    }
    setErrorsExist(numErrs > 0);
  }, [errors]);

  const forceReset = (): void => {
    setErrors({});
  };

  // if v contains the toReset string[], only remove those errors
  const reset = (v: InboundObj & { toReset?: string[] }): void => {
    if (Object.prototype.hasOwnProperty.call(v, 'toReset')) {
      const { toReset } = v;
      if (Array.isArray(toReset)) {
        setErrors((errs) => removeProps(errs, toReset));
      }
    } else {
      setErrors({});
    }
  };

  const checkErrors = (v: InboundObj): void => {
    // if v contains a reset key, wipe errors
    if (Object.prototype.hasOwnProperty.call(v, 'reset')) {
      reset(v);
      return;
    }
    // verify the error key exists
    if (!Object.prototype.hasOwnProperty.call(v, 'error')) {
      return;
    }

    //console.log('Inbond object for checkErrors: ' + JSON.stringify(v, null, 2));

    // find the non-error key/value
    const prop = Object.keys(v).filter((k) => k !== 'error')[0];

    const hasErr = !!v.error;
    if (hasErr) {
      const newErrs = Object.assign(errors, { [prop]: true });
      setErrors({ ...newErrs });
    } else if (errors[prop] && errors[prop] === true) {
      // need to remove this error
      const newErrs = Object.assign(errors);
      delete newErrs[prop];
      setErrors({ ...newErrs });
    }
  };
  return [errorsExist, checkErrors, forceReset];
}
