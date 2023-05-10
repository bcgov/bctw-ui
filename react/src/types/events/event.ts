import { Dayjs } from 'dayjs';
import { LocationEvent } from 'leaflet';
import { ReactNode } from 'react';
import { Critter, CritterDetailsForm, getAnimalFormFields } from 'types/animal';
import { Collar, getDeviceFormFields, ICollar } from 'types/collar';
import { AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { BCTWFormat, uuid } from 'types/common_types';
import { ChangeDataLifeInput } from 'types/data_life';
import { FormChangeEvent, FormFieldObject } from 'types/form_types';
import { CaptureFormField2 } from './capture_event';
import { MortalityFormField } from './mortality_event';
import { ReleaseFormField } from './release_event';
import { RetrievalFormField } from './retrieval_event';

export type WorkflowType = 'malfunction' | 'mortality' | 'release' | 'capture' | 'retrieval' | 'unknown';

export type WorkflowFormProps<T extends IBCTWWorkflow> = {
  event: T;
  handleFormChange: FormChangeEvent;
  // workflows can exit early by calling the following functions
  handleExitEarly?: (message: ReactNode) => void;
  handlePostponeSave?: (wft: WorkflowType) => void;
  // this state is managed in WorkflowWrapper, but some forms may want to know about it
  canSave?: boolean;
};

// make all properties optional
// todo: make critter_id etc required
export type OptionalAnimal = { [Property in keyof Critter]+?: Critter[Property] };
export type OptionalDevice = { [Property in keyof ICollar]+?: ICollar[Property] };

//
export type WorkflowFormField = FormFieldObject<Partial<Collar> & Partial<CritterDetailsForm>>;
const allFields: WorkflowFormField[] = [...getDeviceFormFields(), ...getAnimalFormFields()];
export const wfFields = new Map(allFields?.map((f) => [f.prop, f]));

/**
 * interface that BCTW workflows implement
 */
export interface IBCTWWorkflow {
  readonly event_type: WorkflowType;
  fields?: CaptureFormField2 | MortalityFormField | ReleaseFormField | RetrievalFormField;
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
  shouldSaveAnimal?: boolean;
  shouldSaveDevice?: boolean;
}

export type CbPayload<T> = Partial<Record<keyof T, unknown>> | undefined;

export type BCTWWorkflow<T> = IBCTWWorkflow & { critterbasePayload?: CbPayload<T> } & BCTWFormat<T>;

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
 * @param editing - the original object, usually an @type {Critter} or @type {Collar}
 * @param workflow - instance of the workflow event
 * @param toRemove - keys of the @param editing type that shouldn't end up in the workflow instance
 */
export const editObjectToEvent = <WF, E>(editing: E, workflow: WF, toRemove: (keyof E)[]): WF => {
  const cp = Object.assign({}, editing);
  // always remove these fields
  delete cp['fields'];
  delete cp['event_type'];
  delete cp['shouldUnattachDevice'];
  delete cp['shouldSaveAnimal'];
  delete cp['shouldSaveDevice'];
  // remove all fields included in toRemove
  for (let index = 0; index < toRemove.length; index++) {
    delete cp[toRemove[index]];
  }
  return Object.assign(workflow, cp);
};
