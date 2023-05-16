import { InboundObj } from 'types/form_types';
import { cbInputValue } from './constants';

export const isCbVal = (val: unknown, label: cbInputValue): boolean => {
  return val?.['label'].toLowerCase() === label.toLowerCase();
};
