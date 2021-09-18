import { AttachedAnimal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWFormat } from 'types/common_types';

export type WorkflowType = 'mortality' | 'release' | 'capture' | 'retrieval' | 'unknown';
// make all properties optional
// todo: make critter_id etc required
export type OptionalAnimal = { [Property in keyof AttachedAnimal]+?: AttachedAnimal[Property] };
export type OptionalDevice = { [Property in keyof Collar]+?: Collar[Property] };

/**
 * interface that BCTW workflows implement
 */
interface IBCTWWorkflow {
  readonly event_type: WorkflowType;
  // headers displayed in the workflow modal title
  getHeaderTitle(): string;
  // get displayProps(): (keyof T)[];
  // methods the workflow needs to save specific properties
  getAnimal?(): OptionalAnimal;
  getDevice?(): OptionalDevice;
  getAttachment?(): void;
  getDataLife?(): void;
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
