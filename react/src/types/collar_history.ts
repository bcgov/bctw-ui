import { Collar } from 'types/collar';
import { BCTWBase, BCTWBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import dayjs from 'dayjs';
import { columnToHeader } from 'utils/common_helpers';
import { IDataLifeStartProps, IDataLifeEndProps } from './data_life';
import { isDev } from 'api/api_helpers';


// passed to the API when attaching a device to an animal
export interface IAttachDeviceProps extends IDataLifeStartProps, IDataLifeEndProps {
  collar_id: string;
  critter_id: string;
}

// passed to the API when removing a device from an animal
export interface IRemoveDeviceProps extends Required<IDataLifeEndProps> {
  assignment_id: string;
}

export interface ICollarHistory extends Pick<Collar, 'collar_id' | 'device_id' | 'device_make' | 'frequency'>,
  Pick<BCTWBaseType, 'valid_from' | 'valid_to'> {
  assignment_id: string;
  critter_id: string;
  attachment_start: Date;
  attachment_end: Date;
}

// used in the class to get a type safe array of valid keys
type CollarProps = keyof ICollarHistory;

/**
 * represents an device attachment to an animal.
 */
export class CollarHistory extends BCTWBase implements ICollarHistory {
  assignment_id: string; // primary key of the collar_animal_assignment table
  collar_id: string;
  critter_id: string;
  device_id: number;
  device_make: string;
  frequency: number;
  @Type(() => Date) valid_from: Date; // data_life_start
  @Type(() => Date) valid_to: Date; // data_life_end
  @Type(() => Date) attachment_start: Date;
  @Type(() => Date) attachment_end: Date;
  @Expose() get identifier(): string { return 'assignment_id' }

  toJSON(): CollarHistory {
    return this;
  }

  // note: endpoint for retrieving collar history displays additional collar/animal properties
  // fixme: split these classes?
  // type safe properties to display in tables
  static get propsToDisplay(): CollarProps[] {
    const props: CollarProps[] = ['device_id', 'device_make', 'attachment_start', 'valid_from', 'valid_to', 'attachment_end'];
    if (isDev()) {
      props.unshift('assignment_id');
    }
    return props;
  }

  formatPropAsHeader(str: keyof this): string {
    switch (str) {
      case this.identifier:
        return 'Assignment ID';
      case 'valid_from':
        return 'Data Life Start';
      case 'valid_to':
        return 'Data Life End';
      default:
        return columnToHeader(str as string);
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