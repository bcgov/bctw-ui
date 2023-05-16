import { InboundObj } from 'types/form_types';

export const isCbVal = (val: unknown, label: string) => {
  return val?.['label'].toLowerCase() === label.toLowerCase();
};
