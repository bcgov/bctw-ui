import { ICollarBase } from 'types/collar';
import { columnToHeader } from 'utils/common';
import { BCTW } from 'types/common_types';
import { Type } from 'class-transformer';
import dayjs from 'dayjs';

export interface ICollarHistory extends ICollarBase, BCTW {
  animal_id?: number; // the animal id (serial pk of animal table)
  assignment_id: number;
  make: string;
  radio_frequency: number;
  start_time: Date;
  end_time: Date;
}

export class CollarHistory implements ICollarHistory {
  device_id: number;
  assignment_id: number;
  make: string;
  radio_frequency: number;
  @Type(() => Date) start_time: Date;
  @Type(() => Date) end_time: Date;

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'device_id':
        return 'Device ID';
      case 'make':
        return 'Collar Make';
      case 'assignment_id':
        return 'Assignment ID';
      default:
        return columnToHeader(str);
    }
  }
}

export const hasCollarCurrentlyAssigned = (history: ICollarHistory[]): boolean => {
  const currentlyAssigned = history?.filter((h) => {
    if(!dayjs(h.end_time).isValid()) {
      return true;
    }
    return dayjs().isBefore(h.end_time);
  });
  return !!currentlyAssigned.length;
}