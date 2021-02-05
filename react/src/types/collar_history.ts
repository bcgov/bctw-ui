import { ICollarBase } from 'types/collar';
import { BCTW } from 'types/common_types';
import { Type } from 'class-transformer';
import dayjs from 'dayjs';
import { columnToHeader } from 'utils/common';

export interface ICollarHistory extends ICollarBase, BCTW {
  animal_id?: string; // the animal id (uuid key of animal table)
  assignment_id: string; // uuid
  collar_make: string;
  radio_frequency: number;
  valid_from: Date;
  valid_to: Date;
}

export const collarHistoryProps = [
  'device_id',
  'collar_status',
  'max_transmission_date',
  'radio_frequency',
  'valid_from',
  'valid_to'
];

export class CollarHistory implements ICollarHistory {
  collar_id: string;
  assignment_id: string;
  collar_make: string;
  radio_frequency: number;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'assignment_id':
        return 'Assignment ID';
      default:
        return columnToHeader(str);
    }
  }
}

export const hasCollarCurrentlyAssigned = (history: ICollarHistory[]): boolean => {
  const currentlyAssigned = history?.filter((h) => {
    if(!dayjs(h.valid_to).isValid()) {
      return true;
    }
    return dayjs().isBefore(h.valid_to);
  });
  return !!currentlyAssigned.length;
}