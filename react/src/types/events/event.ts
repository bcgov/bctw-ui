import { isDayjs } from 'dayjs';
import { ReactNode } from 'react';
import { Animal, getAnimalFormFields, IAnimal } from 'types/animal';
import { Collar, getDeviceFormFields, ICollar } from 'types/collar';
import { AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { BCTWFormat} from 'types/common_types';
import { ChangeDataLifeInput } from 'types/data_life';
import { FormChangeEvent, FormFieldObject } from 'types/form_types';
import { formatTime } from 'utils/time';

export type WorkflowType = 'malfunction' | 'mortality' | 'release' | 'capture' | 'retrieval' | 'unknown';

export type WorkflowFormProps<T extends IBCTWWorkflow> = {
  event: T
  handleFormChange: FormChangeEvent;
  handleExitEarly?: (message: ReactNode) => void;
}

// make all properties optional
// todo: make critter_id etc required
export type OptionalAnimal = { [Property in keyof IAnimal]+?: IAnimal[Property] };
export type OptionalDevice = { [Property in keyof ICollar]+?: ICollar[Property] };

// 
export type WorkflowFormField = FormFieldObject<Partial<Collar> & Partial<Animal>>;
const allFields: WorkflowFormField[] = [...getDeviceFormFields(), ...getAnimalFormFields()];
export const wfFields = new Map(allFields?.map(f => [f.prop, f])); 

/**
 * interface that BCTW workflows implement
 */
export interface IBCTWWorkflow {
  readonly event_type: WorkflowType;
  // headers displayed in the workflow modal title
  getWorkflowTitle(): string;
  // methods the workflow needs to save specific properties
  getAnimal?(): OptionalAnimal;
  getDevice?(): OptionalDevice;
  getAttachment?(): AttachDeviceInput | RemoveDeviceInput;
  getDataLife?(): ChangeDataLifeInput;
  // multiple events implement this 
  shouldUnattachDevice?: boolean;
  // must implement this to determine how the workflow should be saved
  shouldSaveAnimal: boolean;
  shouldSaveDevice: boolean;
}

export type BCTWWorkflow<T> = IBCTWWorkflow & BCTWFormat<T>

/**
 * converts an event to json for posting to API
 * @param keys of the event to be included
 * @param event
 */
export const eventToJSON = <T>(keys: string[], event: T): Record<string, unknown> => {
  const ret = {};
  const entries = Object.entries(event);
  for (const [key, value] of entries) {
    if (keys.includes(key)) {
      // todo: move to parent json formatter?
      if (isDayjs(value)) {
        ret[key] = value.format(formatTime);
      } else {
        ret[key] = value;
      }
    }
  }
  return ret;
};

/** used to create new workflow events and not have properties overwritten 
 * @param editing - the original object, usually an @type {Animal} or @type {Collar}
 * @param workflow - instance of the workflow event 
 * @param toRemove - keys of the @param editing type that shouldn't end up in the workflow instance
*/
export const editObjectToEvent = <WF, E>(editing: E, workflow: WF, toRemove: (keyof E)[]): WF => {
  for (let index = 0; index < toRemove.length; index++) {
    delete editing[toRemove[index]]
  }
  return Object.assign(workflow, editing);
}
