import { classToPlain } from 'class-transformer';
import { mustBeLatitude, mustBeLongitude, mustBeValidTemp } from 'components/form/form_validators';
import { ILocation } from 'types/animal';
import { uuid } from 'types/common_types';
import { BCTWWorkflow, CbPayload, WorkflowType } from 'types/events/event';
import { FormCommentStyle, FormFieldObject, eInputType } from 'types/form_types';
import { columnToHeader, omitNull } from 'utils/common_helpers';

export enum eLocationPositionType {
  utm = 'utm',
  coord = 'coord'
}

export class LocationEvent implements BCTWWorkflow<LocationEvent>, ILocation {
  readonly event_type: WorkflowType;
  location_id: uuid;
  latitude: number;
  longitude: number;
  region_env_id: string;
  region_nr_id: string;
  wmu_id: string;
  coordinate_uncertainty: number;
  coordinate_uncertainty_unit: string;
  temperature: number;
  location_comment: string;

  constructor(event_type: WorkflowType) {
    this.event_type = event_type;
  }

  get critterbasePayload(): CbPayload<LocationEvent> {
    const tmp = classToPlain(this);
    delete tmp.event_type;
    const ret = omitNull(tmp);
    if (!Object.keys(ret).length) {
      return;
    }
    return ret;
  }
  //Temp might remove after looking at malfunction workflow
  toJSON() {
    return this;
  }
  getWorkflowTitle(): string {
    return 'Temp location Title';
  }

  formatPropAsHeader(k: keyof LocationEvent): string {
    switch (k) {
      case 'region_env_id':
        return 'ENV Region';
      case 'region_nr_id':
        return 'NR Region';
      case 'wmu_id':
        return 'Wildlife Management Unit';
    }
    return columnToHeader(k);
  }

  get displayProps(): (keyof LocationEvent)[] {
    return ['latitude', 'longitude'];
  }

  get fields(): Record<string, FormFieldObject<LocationEvent>[]> {
    return {
      latlon: [
        { prop: 'latitude', type: eInputType.number, validate: mustBeLatitude },
        { prop: 'longitude', type: eInputType.number, validate: mustBeLongitude },
        { prop: 'coordinate_uncertainty', type: eInputType.number },
        // {
        //   prop: 'coordinate_uncertainty_unit',
        //   type: eInputType.cb_select,
        //   cbRouteKey: 'coordinate_uncertainty_unit'
        // },
        { prop: 'location_comment', type: eInputType.multiline }
      ],
      regions: [
        { prop: 'region_env_id', type: eInputType.cb_select, cbRouteKey: 'region_env' },
        { prop: 'region_nr_id', type: eInputType.cb_select, cbRouteKey: 'region_nr' },
        { prop: 'wmu_id', type: eInputType.cb_select, cbRouteKey: 'wmu' },
        { prop: 'temperature', type: eInputType.number, validate: mustBeValidTemp }
      ]
    };
  }
}
