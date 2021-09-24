import { Dayjs, isDayjs} from 'dayjs';
import { formatTime } from 'utils/time';
import { CollarHistory, AttachDeviceInput, RemoveDeviceInput } from './collar_history';

/**
 * the attachment attachment start and data life start date time props
 * the inner bounding data_life_start should be after the attachment_start
 */
export interface IDataLifeStartProps {
  attachment_start: Dayjs | string; 
  data_life_start:  Dayjs | string;
}
/**
 * the attachment end and data life end date time props
 * the inner bounding data_life_end should be before the attachment_end
 */
export interface IDataLifeEndProps {
  attachment_end?: Dayjs | string;
  data_life_end?: Dayjs | string;
}

// DL type with all props required
export type DataLife = IDataLifeStartProps & Required<IDataLifeEndProps> & {
}

// passed to the API when changing the data life of an existing or past device attachment
export interface ChangeDataLifeInput extends 
  Pick<CollarHistory, 'assignment_id'>, 
  Pick<IDataLifeStartProps, 'data_life_start'>,
  Pick<IDataLifeEndProps, 'data_life_end'>{ }

/**
 * used in the Data Life input component
 * fixme: taking @type {CollarHistory} in the constructor is a convulated 
 * way of handling this type. Maybe extend the collarhistory class and 
 * figure out a way to deal with how the fields are valid_from vs. data_life_start etc.
 */
export class DataLifeInput implements IDataLifeStartProps, IDataLifeEndProps {

  constructor(public attachment_start: Dayjs, public data_life_start: Dayjs, public data_life_end: Dayjs, public attachment_end: Dayjs) {}

  // data life properties can only be changed if user is an admin or they haven't been modified before
  get canChangeDLStart(): boolean {
    if (isDayjs(this.data_life_start) && isDayjs(this.attachment_start)) {
      return this.data_life_start.isSame(this.attachment_start);
    }
    return true;
  }

  get canChangeDLEnd(): boolean {
    if (isDayjs(this.data_life_end) && isDayjs(this.attachment_end)) {
      return this.data_life_end.isSame(this.attachment_end);
    }
    return true;
  }

  // must get assignment_id elsewhere
  toRemoveDeviceJSON(): Omit<RemoveDeviceInput, 'assignment_id'> {
    return {
      attachment_end: this.attachment_end.format(formatTime),
      data_life_end: this.data_life_end.format(formatTime),
    }
  }

  // must provide critter/collar ids separarately
  toPartialAttachDeviceJSON(): Omit<AttachDeviceInput, 'collar_id' | 'critter_id'> {
    return {
      attachment_start: this.attachment_start.format(formatTime),
      data_life_start: this.data_life_start.format(formatTime),
    }
  }

  // must get assignment id elsewhere
  toPartialEditDatalifeJSON(): Omit<ChangeDataLifeInput, 'assignment_id'> {
    return {
      data_life_start: this.data_life_start.format(formatTime),
      data_life_end: this.data_life_end.format(formatTime)
    }
  }
}