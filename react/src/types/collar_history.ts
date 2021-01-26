import { formatCollarProp, ICollarBase } from 'types/collar';
import { BCTW } from 'types/common_types';
import { Type } from 'class-transformer';
import dayjs from 'dayjs';

export interface ICollarHistory extends ICollarBase, BCTW {
  animal_id?: string; // the animal id (serial pk of animal table)
  assignment_id: number;
  collar_make: string;
  radio_frequency: number;
  valid_from: Date;
  valid_to: Date;
}

export class CollarHistory implements ICollarHistory {
  collar_id: string;
  assignment_id: number;
  collar_make: string;
  radio_frequency: number;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'assignment_id':
        return 'Assignment ID';
      default:
        return formatCollarProp(str);
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