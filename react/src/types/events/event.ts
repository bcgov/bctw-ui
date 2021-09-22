import { AttachedAnimal } from 'types/animal';
import { Collar } from 'types/collar';
import { AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { BCTWFormat} from 'types/common_types';
import { FormFieldObject } from 'types/form_types';

export type WorkflowType = 'mortality' | 'release' | 'capture' | 'retrieval' | 'unknown';
// make all properties optional
// todo: make critter_id etc required
export type OptionalAnimal = { [Property in keyof AttachedAnimal]+?: AttachedAnimal[Property] };
export type OptionalDevice = { [Property in keyof Collar]+?: Collar[Property] };

// 
export type WorkflowFormField = 
  { [Property in keyof OptionalAnimal]: FormFieldObject<OptionalAnimal>; } & 
  { [Property in keyof OptionalDevice]: FormFieldObject<OptionalDevice> };

/**
 * interface that BCTW workflows implement
 */
export interface IBCTWWorkflow {
  readonly event_type: WorkflowType;
  // headers displayed in the workflow modal title
  getWorkflowTitle(): string;
  // get displayProps(): (keyof T)[];
  // methods the workflow needs to save specific properties
  getAnimal?(): OptionalAnimal;
  getDevice?(): OptionalDevice;
  getAttachment?(): AttachDeviceInput | RemoveDeviceInput;
  getDataLife?(): void;
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
      ret[key] = value;
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
