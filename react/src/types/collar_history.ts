import { ICollarBase } from 'types/collar';
import { BCTWBase } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import dayjs from 'dayjs';
import { columnToHeader } from 'utils/common_helpers';
// todo: extend dates from base class

// used to construct objects for removing or attaching a collar device to a critter
export interface ICollarLinkPayload {
  isLink: boolean;
  data: {
    critter_id: string;
    collar_id: string;
    valid_from?: Date | string;
    valid_to?: Date | string;
  };
}

// animal/device attachment history
export interface ICollarHistory extends ICollarBase {
  critter_id?: string;
  assignment_id: string; // unique identifier of the animal/device relationship
  device_make: string;
  valid_from: Date;
  valid_to: Date;
}

export class CollarHistory extends BCTWBase implements ICollarHistory {
  collar_id: string;
  assignment_id: string;
  device_make: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get identifier(): string { return 'assignment_id' }

  toJSON(): CollarHistory {
    return this;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case this.identifier:
        return 'Assignment ID';
      default:
        return columnToHeader(str);
    }
  }
}

/**
 * @returns a boolean indicating if the @param history contains a
 * valid animal/device attachment - if there is a record with a valid_to 
 * that is null or in the future
 */
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