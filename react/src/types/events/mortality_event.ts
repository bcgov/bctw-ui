import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Critter, eCritterStatus } from 'types/animal';
import { Collar } from 'types/collar';
import { eInputType, FormCommentStyle, FormFieldObject } from 'types/form_types';
import { LocationEvent } from 'types/events/location_event';
import dayjs, { Dayjs } from 'dayjs';
import { formatT, formatTime, getEndOfPreviousDay } from 'utils/time';
import {
  BCTWWorkflow,
  eventToJSON,
  WorkflowType,
  OptionalAnimal,
  OptionalDevice,
  IBCTWWorkflow,
  CbPayload
} from 'types/events/event';
import { IMortalityAlert } from 'types/alert';
import { uuid } from 'types/common_types';
import { Code } from 'types/code';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { DataLife } from 'types/data_life';
import { WorkflowStrings } from 'constants/strings';
import CaptureEvent from './capture_event';
import { useTelemetryApi } from 'hooks/useTelemetryApi';

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

type MortalityAnimalEventProps = Pick<
  Critter,
  | 'critter_id'
  // | 'proximate_cause_of_death'
  // | 'ultimate_cause_of_death'
  // | 'predator_taxon_pcod'
  // | 'predator_taxon_ucod'
  // | 'pcod_confidence'
  // | 'ucod_confidence'
  | 'animal_id'
  | 'wlh_id'
  | 'collection_unit'
  | 'taxon'
  // | 'predator_known_ind'
  // | 'captivity_status_ind'
  // | 'mortality_investigation'
  // | 'mortality_report_ind'
  // | 'mortality_captivity_status_ind'
>;

type MortalitySpecificProps = Pick<IBCTWWorkflow, 'shouldUnattachDevice'> &
  Pick<DataLife, 'data_life_end'> & {
    wasInvestigated: boolean;
    isUCODtaxonKnown: boolean;
    onlySaveAnimalStatus: boolean;
  };

interface IMortalityEvent
  extends MortalityDeviceEventProps,
    MortalityAnimalEventProps,
    Omit<IMortalityAlert, 'data_life_start' | 'attachment_end' | 'critter_status'>,
    Readonly<Pick<CollarHistory, 'assignment_id'>>,
    MortalitySpecificProps {}

// codes defaulted in this workflow
type MortalityDeviceStatus = 'Mortality';
type DeploymentStatusNotDeployed = 'Not Deployed';

/**
 * todo: when a device removal is performed...what happens in the ui?
 */
export default class MortalityEvent implements BCTWWorkflow<MortalityEvent>, IMortalityEvent {
  // event specific props - not saved. used to enable/disable fields
  readonly event_type: WorkflowType;
  readonly critter_id: uuid;
  readonly wlh_id: string;
  readonly taxon: string;
  readonly animal_id: string;
  readonly collection_unit: string; // This will probably need to be changed to collection_units: ICollectionUnit[]
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

  //Critterbase Props
  mortality_id: uuid;
  mortality_timestamp: Dayjs;
  location_id: uuid;
  location: LocationEvent;
  proximate_cause_of_death_id: uuid;
  proximate_cause_of_death_confidence: string;
  proximate_predated_by_taxon_id: uuid;
  ultimate_cause_of_death_id: uuid;
  ultimate_cause_of_death_confidence: string;
  ultimate_predated_by_taxon_id: uuid;
  mortality_comment: string;

  proximate_cause_of_death: { cod_category: string; cod_reason: string };
  ultimate_cause_of_death: { cod_category: string; cod_reason: string };

  // critter props
  /*readonly critter_id: uuid;
  readonly animal_id: string;
  readonly wlh_id: string;
  taxon: string;
  critter_status: eCritterStatus;
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
  location_event: LocationEvent;*/

  private critterPropsToSave: (keyof Critter)[] = [
    'critter_id',
    'critter_status'
    // 'predator_known_ind',
    // 'predator_taxon_pcod',
    // 'predator_taxon_ucod',
    // 'proximate_cause_of_death',
    // 'ultimate_cause_of_death',
    // 'pcod_confidence',
    // 'ucod_confidence',
    // 'captivity_status_ind',
    // 'mortality_investigation',
    // 'mortality_report_ind',
    // 'mortality_captivity_status_ind'
  ];

  get critterbasePayload(): CbPayload<MortalityEvent> {
    return omitNull({
      mortality_id: this.mortality_id,
      critter_id: this.critter_id,
      mortality_timestamp: this.mortality_timestamp,
      mortality_comment: this.mortality_comment,
      location_id: this.location_id,
      location: this.location.critterbasePayload,
      proximate_cause_of_death_id: this.proximate_cause_of_death_id,
      proximate_cause_of_death_confidence: this.proximate_cause_of_death_confidence,
      proximate_predated_by_taxon_id: this.proximate_predated_by_taxon_id,
      ultimate_cause_of_death_id: this.ultimate_cause_of_death_id,
      ultimate_cause_of_death_confidence: this.ultimate_cause_of_death_confidence,
      ultimate_predated_by_taxon_id: this.ultimate_predated_by_taxon_id
    });
  }

  constructor(mort_date = dayjs(), capture?: CaptureEvent) {
    this.event_type = 'mortality';
    this.mortality_timestamp = dayjs();
    this.shouldSaveAnimal = true;
    this.shouldSaveDevice = true;
    this.shouldUnattachDevice = false;
    this.onlySaveAnimalStatus = false;
    this.data_life_end = dayjs();
    // retrieval date is defaulted to end of previous day (business requirement)
    this.retrieval_date = getEndOfPreviousDay();
    this.retrieved_ind = false;
    this.activation_status_ind = true;
    // workflow defaulted fields
    this.shouldUnattachDevice = false;
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    //this.critter_status = eCritterStatus.mortality;
    this.wasInvestigated = false;
    //this.predator_known_ind = false;
    //this.location_event = new LocationEvent('mortality');
    this.location = new LocationEvent('mortality');
    if (capture) {
      this.mortCritterPropsToSave = [...this.critterPropsToSave, ...capture.captureCritterPropsToSave];
    }
  }

  set mortCritterPropsToSave(props: (keyof Critter)[]) {
    this.critterPropsToSave = props;
  }

  get mortCritterPropsToSave(): (keyof Critter)[] {
    return this.onlySaveAnimalStatus ? ['critter_id', 'critter_status'] : this.critterPropsToSave;
  }

  get displayProps(): (keyof MortalityEvent)[] {
    return ['taxon', 'wlh_id', 'critter_id'];
  }

  getWorkflowTitle(): string {
    return WorkflowStrings.mortality.workflowTitle;
  }

  formatPropAsHeader(s: keyof MortalityEvent): string {
    switch (s) {
      case 'attachment_start':
        return 'Capture Date';
      // case 'mortality_report_ind':
      //   return WorkflowStrings.mortality.mort_wildlife;
      case 'retrieved_ind':
        return WorkflowStrings.device.was_retrieved;
      case 'activation_status_ind':
        return WorkflowStrings.device.vendor_activation;
      // case 'predator_known_ind':
      //   return WorkflowStrings.mortality.mort_predator_pcod;
      case 'isUCODtaxonKnown':
        return WorkflowStrings.mortality.mort_predator_ucod;
      case 'shouldUnattachDevice':
        return WorkflowStrings.device.should_unattach;
      case 'proximate_cause_of_death_id':
        return 'Proximate COD';
      case 'ultimate_cause_of_death_id':
        return 'Ultimate COD';
      case 'proximate_cause_of_death_confidence':
        return 'PCOD Confidence';
      case 'ultimate_cause_of_death_confidence':
        return 'UCOD Confidence';
      case 'proximate_predated_by_taxon_id':
        return 'PCOD Predator Taxon';
      case 'ultimate_predated_by_taxon_id':
        return 'UCOD Predator Taxon';
      default:
        return columnToHeader(s ?? 'undefined key');
    }
  }

  // mortality event specific fields
  /*fields: { [Property in keyof MortalitySpecificProps]+?: FormFieldObject<MortalitySpecificProps> } = {
    data_life_end: { prop: 'data_life_end', type: eInputType.datetime },
    isUCODtaxonKnown: { prop: 'isUCODtaxonKnown', type: eInputType.check },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check }
  };*/
  fields: MortalityFormField = {
    retrieval_date: { prop: 'retrieval_date', type: eInputType.datetime, required: false },
    retrieved_ind: { prop: 'retrieved_ind', type: eInputType.check, required: false },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    data_life_end: { prop: 'data_life_end', type: eInputType.datetime },
    mortality_timestamp: { prop: 'mortality_timestamp', type: eInputType.datetime, required: true },
    mortality_comment: { prop: 'mortality_comment', type: eInputType.multiline, style: FormCommentStyle },
    proximate_cause_of_death_id: {
      prop: 'proximate_cause_of_death_id',
      type: eInputType.cb_select,
      cbRouteKey: 'cod',
      required: true
    },
    proximate_cause_of_death_confidence: {
      prop: 'proximate_cause_of_death_confidence',
      type: eInputType.cb_select,
      cbRouteKey: 'cause_of_death_confidence'
    },
    proximate_predated_by_taxon_id: {
      prop: 'proximate_predated_by_taxon_id',
      type: eInputType.cb_select,
      cbRouteKey: 'taxons'
    },
    ultimate_cause_of_death_id: {
      prop: 'ultimate_cause_of_death_id',
      type: eInputType.cb_select,
      cbRouteKey: 'cod',
      required: false
    },
    ultimate_cause_of_death_confidence: {
      prop: 'ultimate_cause_of_death_confidence',
      type: eInputType.cb_select,
      cbRouteKey: 'cause_of_death_confidence'
    },
    ultimate_predated_by_taxon_id: {
      prop: 'ultimate_predated_by_taxon_id',
      type: eInputType.cb_select,
      cbRouteKey: 'taxons'
    }
  };

  // retrieve the animal metadata fields from the mortality event
  getAnimal(): OptionalAnimal {
    const props = [...this.mortCritterPropsToSave];
    const ret = eventToJSON(props, this);
    if (this.onlySaveAnimalStatus) {
      return ret;
    }
    /*if (!this.predator_known_ind) {
      delete ret.predator_taxon_pcod;
      delete ret.pcod_confidence;
    }*/
    if (!this.isUCODtaxonKnown) {
      delete ret.predator_taxon_ucod;
      delete ret.ucod_confidence;
    }
    //const locationFields = this.location_event.toJSON();
    //TODO critterbase integration
    //return omitNull({ ...ret, ...locationFields });
    return omitNull({ ...ret });
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
      data_life_end: formatT(dayjs(data_life_end)),
      attachment_end: formatT(dayjs(data_life_end))
    };
    return ret;
  }
}

export type MortalityFormField = {
  [Property in keyof MortalityEvent]+?: FormFieldObject<MortalityEvent>;
};
