import { ICollarBase } from 'types/collar';
import { BCTW } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import dayjs from 'dayjs';
import { columnToHeader } from 'utils/common';

export interface ICollarHistory extends ICollarBase, BCTW {
  animal_id?: string; // the animal id (uuid key of animal table)
  assignment_id: string; // uuid
  device_make: string;
  valid_from: Date;
  valid_to: Date;
}

export class CollarHistory implements ICollarHistory {
  collar_id: string;
  assignment_id: string;
  device_make: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get identifier(): string { return 'assignment_id' }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case this.identifier:
        return 'Assignment ID';
      default:
        return columnToHeader(str);
    }
  }
}

export const hasCollarCurrentlyAssigned = (history: CollarHistory[]): CollarHistory | undefined => {
  const currentlyAssigned = history?.filter((h) => {
    // a null valid_to is considered valid - as in it has no expiry
    if(!dayjs(h.valid_to).isValid()) {
      return true;
    }
    return dayjs().isBefore(h.valid_to);
  });
  return currentlyAssigned.length ? currentlyAssigned[0] : undefined;
}