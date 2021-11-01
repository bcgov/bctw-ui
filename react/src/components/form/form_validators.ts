import { FormStrings } from 'constants/strings';

const mustBeNegativeNumber = (v: number): string => (v > 0 ? FormStrings.validateNegativeLongitude : '');
const mustbePositiveNumber = <T>(t: T): string => typeof t === 'number' ? t >= 0 ? '' : 'must be positive' : '';

const mustBeXDigits = (v: number, numDigits: number): string =>
  v?.toString().length === numDigits ? '' : `Field must be ${numDigits} digits`;

const mustBeEmail = (email: string): string => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase()) ? '' : 'Must be a valid email';
}

export { mustbePositiveNumber, mustBeNegativeNumber, mustBeXDigits, mustBeEmail };
