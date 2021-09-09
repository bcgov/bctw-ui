import { IUpsertPayload } from 'api/api_interfaces';
import { ModalBaseProps } from 'components/component_interfaces';
import {
  CreateEditCheckboxField,
  CreateEditDateField,
  FormFromFormfield
} from 'components/form/create_form_components';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';

import { FormPart } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';

type MortEventProps = {
  event: MortalityEvent;
  handleSave: (event: MortalityEvent) => void;
};

/**
 * todo: unassign device?
 * missing pcod fields?
 * not savable when on display
 * errors
 */
export default function MortalityEventForm({ event, handleSave }: MortEventProps): JSX.Element {
  const [errors, setErrors] = useState({});
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  const [locationEvent, setLocationEvent] = useState<LocationEvent>(
    new LocationEvent('mortality', dayjs()) // fixme: alert.valid_from
  );

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  const [isRetrieved, setIsRetrieved] = useState<boolean>(false);

  /**
   * break the MortalityEvent into collar/critter specific properties
   * before passing to the parent save handler
   * @param payload the save payload passed from the {EditModal}
   */
  const onSave = async (payload: IUpsertPayload<MortalityEvent>): Promise<void> => {
    const { body } = payload;
    body.location_event = locationEvent;
    await handleSave(body);
  };
  useDidMountEffect(() => {
    // trigger re-render of retrieved_date field
    // todo: delete this field on-save if disabled?
  }, [isRetrieved]);

  const onChange = (v) => {
    console.log(v);
  };

  // const headerProps ={title: UserAlertStrings.mortalityFormTitle, props: mortality.headerProps, obj: mortality }
  const { fields } = mortality;
  if (!fields) {
    return null;
  }
  return (
    <>
      {FormPart('Update Assignment Details', [
        CreateEditCheckboxField({
          prop: fields.shouldUnattachDevice.prop,
          type: fields.shouldUnattachDevice.type,
          value: mortality.shouldUnattachDevice,
          label: mortality.formatPropAsHeader('shouldUnattachDevice'),
          handleChange: onChange
        })
      ])}
      {FormPart('Update Device Details', [
        CreateEditCheckboxField({
          prop: fields.retrieved.prop,
          type: fields.retrieved.type,
          value: mortality.retrieved,
          label: mortality.formatPropAsHeader('retrieved'),
          handleChange: onChange
        }),
        CreateEditDateField({
          prop: fields.retrieval_date.prop,
          type: fields.retrieval_date.type,
          value: mortality.retrieval_date,
          label: mortality.formatPropAsHeader('retrieval_date'),
          handleChange: onChange,
          disabled: !isRetrieved
        }),
        CreateEditCheckboxField({
          prop: fields.activation_status.prop,
          type: fields.activation_status.type,
          value: mortality.activation_status,
          label: mortality.formatPropAsHeader('activation_status'),
          handleChange: onChange
        })
      ])}
      {FormPart('Update Animal Details', [
        FormFromFormfield(mortality, fields.animal_status, onChange),
        FormFromFormfield(mortality, fields.proximate_cause_of_death, onChange)
      ])}
      {FormPart('Mortality Event Details', [<LocationEventForm event={locationEvent} handleChange={onChange} />])}
    </>
  );
}
