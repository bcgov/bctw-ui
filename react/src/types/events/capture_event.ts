import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { Animal } from 'types/animal';
import { IDataLifeStartProps } from 'types/data_life';
import { EventFormStrings } from 'constants/strings';

type CaptureAnimalEventProps = Pick<Animal, 
| 'animal_id'
| 'wlh_id'
| 'species'
| 'recapture'
| 'translocation'
| 'associated_animal_id'
| 'associated_animal_relationship'
>;

/**
 * todo:
 * capture location
 * if translocation, enable release fields
 * add captivity component
 * isassociated ? enable association fields
 */

export default class CaptureEvent implements CaptureAnimalEventProps, IDataLifeStartProps, BCTWWorkflow<CaptureEvent> {
  // workflow props
  readonly event_type: WorkflowType;
  shouldSaveDevice: boolean;
  readonly shouldSaveAnimal = true;
  isAssociated: boolean;
  location_event: LocationEvent;
  // data life props
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  // critter props
  readonly wlh_id: string;
  readonly animal_id: string;
  species: Code;
  recapture: boolean;
  translocation: boolean;
  associated_animal_id: string;
  associated_animal_relationship: Code;

  constructor() {
    this.event_type = 'capture';
    this.recapture = false;
    this.translocation = false;
  }

  formatPropAsHeader(s: string): string {
    switch (s) {
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof CaptureEvent)[] {
    return ['wlh_id', 'animal_id'];
  }
  getHeaderTitle(): string {
    return EventFormStrings.titles.mortalityTitle;
  }

  getAnimal(): OptionalAnimal {
    return {};
  }
}
