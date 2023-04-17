import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { eInputType, FormFieldObject } from 'types/form_types';
import { LocationEvent } from 'types/events/location_event';
import dayjs, { Dayjs } from 'dayjs';
import { formatT, formatTime, getEndOfPreviousDay } from 'utils/time';
import {
  BCTWWorkflow,
  eventToJSON,
  WorkflowType,
  OptionalAnimal,
  OptionalDevice,
  IBCTWWorkflow
} from 'types/events/event';
import { IMortalityAlert } from 'types/alert';
import { uuid } from 'types/common_types';
import { Code } from 'types/code';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { DataLife } from 'types/data_life';
import { WorkflowStrings } from 'constants/strings';
import CaptureEvent from './capture_event';

export type MortalityDeviceEventProps = Pick<
  Collar,
  | 'collar_id'
  | 'device_id'
  | 'device_make'
  | 'retrieved_ind'
  | 'retrieval_date'
  | 'activation_status_ind'
  | 'device_condition'
  | 'device_status'
  | 'device_deployment_status'
>;

export type MortalityAnimalEventProps = Pick<
  Animal,
  | 'critter_id'
  | 'proximate_cause_of_death'
  | 'ultimate_cause_of_death'
  | 'predator_taxon_pcod'
  | 'predator_taxon_ucod'
  | 'pcod_confidence'
  | 'ucod_confidence'
  | 'animal_id'
  | 'wlh_id'
  | 'predator_known_ind'
  | 'captivity_status_ind'
  | 'mortality_investigation'
  | 'mortality_report_ind'
  | 'mortality_captivity_status_ind'
>;

type MortalitySpecificProps = Pick<IBCTWWorkflow, 'shouldUnattachDevice'> &
  Pick<DataLife, 'data_life_end'> & {
    wasInvestigated: boolean;
    isUCODtaxonKnown: boolean;
    onlySaveAnimalStatus: boolean;
  };

export interface IMortalityEvent
  extends MortalityDeviceEventProps,
    MortalityAnimalEventProps,
    Omit<IMortalityAlert, 'data_life_start' | 'attachment_end'>,
    Readonly<Pick<CollarHistory, 'assignment_id'>>,
    MortalitySpecificProps {}

// codes defaulted in this workflow
type MortalityDeviceStatus = 'Mortality';
export type DeploymentStatusNotDeployed = 'Not Deployed';
export type MortalityAnimalStatus = 'Mortality' | 'Alive';

/**
 * todo: when a device removal is performed...what happens in the ui?
 */
export default class MortalityEvent implements BCTWWorkflow<MortalityEvent>, IMortalityEvent {
  // event specific props - not saved. used to enable/disable fields
  readonly event_type: WorkflowType;
  shouldUnattachDevice: boolean;
  shouldSaveAnimal: boolean;
  shouldSaveDevice: boolean;
  wasInvestigated: boolean;
  isUCODtaxonKnown: boolean;
  onlySaveAnimalStatus: boolean;
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  readonly device_make: Code;
  retrieved_ind: boolean;
  retrieval_date: Dayjs;
  activation_status_ind: boolean;
  device_condition: Code;
  device_deployment_status: DeploymentStatusNotDeployed;
  device_status: MortalityDeviceStatus;
  // attachment props
  readonly assignment_id: uuid;
  data_life_end: Dayjs;
  attachment_start: Dayjs;
  // critter props
  readonly critter_id: uuid;
  readonly animal_id: string;
  readonly wlh_id: string;
  taxon: string;
  animal_status: MortalityAnimalStatus;
  predator_taxon_pcod: Code;
  predator_taxon_ucod: Code;
  proximate_cause_of_death: Code;
  ultimate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  mortality_investigation: Code;
  mortality_report_ind: boolean;
  readonly captivity_status_ind: boolean; // cannot be changed
  mortality_captivity_status_ind: boolean;
  predator_known_ind: boolean;
  readonly capture_date: Dayjs;
  location_event: LocationEvent;

  private critterPropsToSave: (keyof Animal)[] = [
    'critter_id',
    'animal_status',
    'predator_known_ind',
    'predator_taxon_pcod',
    'predator_taxon_ucod',
    'proximate_cause_of_death',
    'ultimate_cause_of_death',
    'pcod_confidence',
    'ucod_confidence',
    'captivity_status_ind',
    'mortality_investigation',
    'mortality_report_ind',
    'mortality_captivity_status_ind'
  ];

  constructor(mort_date = dayjs(), capture?: CaptureEvent) {
    this.event_type = 'mortality';
    this.shouldSaveAnimal = true;
    this.shouldSaveDevice = true;
    this.shouldUnattachDevice = false;
    this.onlySaveAnimalStatus = false;
    // retrieval date is defaulted to end of previous day (business requirement)
    this.retrieval_date = getEndOfPreviousDay();
    this.retrieved_ind = false;
    this.activation_status_ind = true;
    // workflow defaulted fields
    this.shouldUnattachDevice = false;
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    this.animal_status = 'Mortality';
    this.wasInvestigated = false;
    this.predator_known_ind = false;
    this.location_event = new LocationEvent('mortality', mort_date);
    if (capture) {
      this.mortCritterPropsToSave = [...this.critterPropsToSave, ...capture.captureCritterPropsToSave];
    }
  }

  set mortCritterPropsToSave(props: (keyof Animal)[]) {
    this.critterPropsToSave = props;
  }

  get mortCritterPropsToSave(): (keyof Animal)[] {
    return this.onlySaveAnimalStatus ? ['critter_id', 'animal_status'] : this.critterPropsToSave;
  }

  get displayProps(): (keyof MortalityEvent)[] {
    return ['wlh_id', 'animal_id', 'device_id', 'attachment_start'];
  }

  getWorkflowTitle(): string {
    return WorkflowStrings.mortality.workflowTitle;
  }

  formatPropAsHeader(s: keyof MortalityEvent): string {
    switch (s) {
      case 'attachment_start':
        return 'Capture Date';
      case 'mortality_report_ind':
        return WorkflowStrings.mortality.mort_wildlife;
      case 'retrieved_ind':
        return WorkflowStrings.device.was_retrieved;
      case 'activation_status_ind':
        return WorkflowStrings.device.vendor_activation;
      case 'predator_known_ind':
        return WorkflowStrings.mortality.mort_predator_pcod;
      case 'isUCODtaxonKnown':
        return WorkflowStrings.mortality.mort_predator_ucod;
      case 'shouldUnattachDevice':
        return WorkflowStrings.device.should_unattach;
      case 'proximate_cause_of_death':
        return 'PCOD';
      case 'ultimate_cause_of_death':
        return 'UCOD';
      case 'predator_taxon_ucod':
        return 'Predator UCOD';
      case 'predator_taxon_pcod':
        return 'Predator PCOD';
      case 'pcod_confidence':
      case 'ucod_confidence':
        return 'Confidence';
      default:
        return columnToHeader(s);
    }
  }

  // mortality event specific fields
  fields: { [Property in keyof MortalitySpecificProps]+?: FormFieldObject<MortalitySpecificProps> } = {
    data_life_end: { prop: 'data_life_end', type: eInputType.datetime },
    isUCODtaxonKnown: { prop: 'isUCODtaxonKnown', type: eInputType.check },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check }
  };

  // retrieve the animal metadata fields from the mortality event
  getAnimal(): OptionalAnimal {
    const props = [...this.mortCritterPropsToSave];
    const ret = eventToJSON(props, this);
    if (this.onlySaveAnimalStatus) {
      return ret;
    }
    if (!this.predator_known_ind) {
      delete ret.predator_taxon_pcod;
      delete ret.pcod_confidence;
    }
    if (!this.isUCODtaxonKnown) {
      delete ret.predator_taxon_ucod;
      delete ret.ucod_confidence;
    }
    const locationFields = this.location_event.toJSON();
    return omitNull({ ...ret, ...locationFields });
  }

  // retrieve the collar metadata fields from the event
  getDevice(): OptionalDevice {
    const props: (keyof Collar)[] = [
      'collar_id',
      'retrieved_ind',
      'activation_status_ind',
      'device_condition',
      'device_deployment_status',
      'device_id',
      'device_status'
    ];
    const ret = eventToJSON(props, this);
    if (this.retrieved_ind) {
      ret.retrieval_date = this.retrieval_date.format(formatTime);
    } else {
      delete ret.retrieval_date;
    }
    return omitNull(ret) as OptionalDevice;
  }

  // when a device is unattached.
  getAttachment(): RemoveDeviceInput {
    const { assignment_id, data_life_end } = this;
    const ret: RemoveDeviceInput = {
      assignment_id,
      data_life_end: formatT(data_life_end),
      attachment_end: formatT(data_life_end)
    };
    return ret;
  }
}
