import { AttachedAnimal } from 'types/animal';
import { Collar } from 'types/collar';
import { AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { BCTWBaseType } from 'types/common_types';

export type EventType = 'mortality' | 'release' | 'capture' | 'retrieval' | 'unknown';
// make all properties optional
// todo: make critter_id etc required
export type OptionalAnimal = { [Property in keyof AttachedAnimal]+?: AttachedAnimal[Property] };
export type OptionalDevice = { [Property in keyof Collar]+?: Collar[Property] };

/**
 * interface that BCTW event/workflows implement
 */
export interface BCTWEvent<T> extends Omit<BCTWBaseType<T>, 'identifier'> {
  readonly event_type: EventType;
  // headers displayed in the workflow modal title
  getHeaderTitle(): string;
  get displayProps(): (keyof T)[];
  // methods the workflow needs to save specific properties
  getAnimal?(): OptionalAnimal;
  getDevice?(): OptionalDevice;
  getAttachment?(): AttachDeviceInput | RemoveDeviceInput;
  getDataLife?(): void;
  // multiple events implement this 
  shouldUnattachDevice?: boolean;
}

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

/** used to create new workflow events and not have properties overwritten */
export const editObjectToEvent = <T, E extends T>(editing: E, workflow: T, toRemove: (keyof T)[]): T => {
  for (let index = 0; index < toRemove.length; index++) {
    delete editing[toRemove[index]]
  }
  return Object.assign(workflow, editing);
}
