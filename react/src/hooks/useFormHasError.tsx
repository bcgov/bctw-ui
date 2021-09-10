import { useEffect, useState } from 'react';

// what a form component passes when it's changed
// ex: {name: 'bill', error: false}
export type InboundObj = {
  [key: string]: unknown;
  error?: boolean;
};

/**
 * hook that can be used in forms to determine if any of the child input components have errors
 * @returns a boolean set to true if there are errors,
 * @returns a function handler that checks for errors that should be called when an input changes
 * ex. see @function EditModal
 */
export default function useFormHasError(): [boolean, (r: Record<string, unknown>) => void] {
  const [errorsExist, setErrorsExist] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const numErrs = Object.keys(errors).length;
    // eslint-disable-next-line no-console
    // console.log(`useFormHasError state updated, ${numErrs} errors ${JSON.stringify(errors)}`);
    setErrorsExist(numErrs > 0);
  }, [errors]);

  function checkErrors(changedObj: InboundObj): void {
    // verify the error key exists
    if (!Object.prototype.hasOwnProperty.call(changedObj, 'error')) {
      return;
    }

    // find the non-error key/value
    const prop = Object.keys(changedObj).filter(k => k !== 'error')[0];

    const hasErr = !!changedObj.error;
    if (hasErr) {
      const newErrs = Object.assign(errors, { [prop]: true });
      setErrors({...newErrs});
    } else if (errors[prop] && errors[prop] === true) {
      // need to remove this error
      const newErrs = Object.assign(errors);
      delete newErrs[prop];
      setErrors({...newErrs});
    }
  }
  return [errorsExist, checkErrors];
}
