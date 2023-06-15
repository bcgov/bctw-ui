import { FormStrings } from 'constants/strings';
const maxTemp = 70;
const mustBeNegativeNumber = (v: number): string => (v > 0 ? FormStrings.validateNegativeLongitude : '');

const mustbePositiveNumber = <T>(t: T): string => {
  return typeof t === 'number' && t > 0 ? '' : 'must be positive';
};

const mustBeLessThan50Words = <T>(t: T): string => {
  return typeof t === 'string' && t.split(' ').length < 2 ? '' : 'must be less than 100 words';
};

const mustBeLatitude = <T>(t: T): string => {
  return typeof t === 'number' && t <= 90 && t >= -90 ? '' : 'Latitude must be between -90 and 90';
};

const mustBeLongitude = <T>(t: T): string => {
  return typeof t === 'number' && t <= 180 && t >= -180 ? '' : 'Longitude must be between -180 and 180';
};

const mustBeXDigits = (v: number, numDigits: number): string =>
  v?.toString().length === numDigits ? '' : `Field must be ${numDigits} digits`;

const mustBeEmail = (email: string): string => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase()) ? '' : 'Must be a valid email';
};

const mustBeValidTemp = <T>(temp: T): string =>
  typeof temp === 'number' && temp < maxTemp ? '' : `Temperature must be below ${maxTemp} celsius`;

export {
  mustbePositiveNumber,
  mustBeNegativeNumber,
  mustBeXDigits,
  mustBeEmail,
  mustBeValidTemp,
  mustBeLessThan50Words,
  mustBeLatitude,
  mustBeLongitude
};
