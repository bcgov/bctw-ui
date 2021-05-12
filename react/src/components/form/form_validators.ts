import { FormStrings } from 'constants/strings';
const mustBeNegativeNumber = (v: number): string => (v > 0 ? FormStrings.validateNegativeLongitude : '');
const mustBeXDigits = (v: number, numDigits: number): string =>
  v?.toString().length === numDigits ? '' : `Field must be ${numDigits} digits in length`;

export { mustBeNegativeNumber, mustBeXDigits };
