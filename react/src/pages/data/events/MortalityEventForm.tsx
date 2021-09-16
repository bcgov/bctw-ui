import { Box } from '@material-ui/core';
import { FormFromFormfield } from 'components/form/create_form_components';
import DataLifeInputForm from 'components/form/DataLifeInputForm';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormChangeEvent } from 'types/form_types';
import { FormPart } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import { useState } from 'react';
import { DataLifeInput } from 'types/data_life';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';
import CaptivityStatusForm from './CaptivityStatusForm';
import { boxProps, checkBoxWithLabel } from './EventComponents';

type MortEventProps = {
  event: MortalityEvent;
  handleFormChange: FormChangeEvent;
};

/**
 */
export default function MortalityEventForm({ event, handleFormChange }: MortEventProps): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  // business logic workflow state
  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredation, setIsPredation] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(false);
  const [requiredDLProps, setReqiredDLProps] = useState<(keyof DataLifeInput)[]>([]);

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    handleFormChange(v);
    const key = Object.keys(v)[0] as keyof MortalityEvent;
    const value = Object.values(v)[0];
    // retrieved checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved') {
      setIsRetrieved(value as boolean);
    }
    if (key === 'proximate_cause_of_death') {
      // value could be undefined ex. when a code is not selected
      if ((value as string)?.toLowerCase()?.includes('pred')) {
        setIsPredation(true);
      }
    }
    if (key === 'predator_known') {
      setIsPredatorKnown(value as boolean);
    }
    // make attachment end state required if user is removing device
    if (key === 'shouldUnattachDevice') {
      setReqiredDLProps(value ? ['attachment_end'] : []);
    }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  const { fields } = mortality;
  if (!fields) {
    return null;
  }

  return (
    <>
      {/* assignment & data life fields */}
      {FormPart('mort-ad', 'Device Details', [
        FormFromFormfield(mortality, fields.shouldUnattachDevice, onChange, false, true),
        <DataLifeInputForm
          dli={mortality.getDatalife()}
          // only allow data life end dates changes if the device is being removed
          enableEditEnd={requiredDLProps.length !== 0}
          enableEditStart={false}
          onChange={handleFormChange}
          propsRequired={requiredDLProps}
          message={<div style={{color: 'darkorange', marginBottom: '5px'}}>{fields.shouldUnattachDevice.long_label}</div>} // todo:
          displayInRows={true}
        />,
        <Box {...boxProps}>
          {FormFromFormfield(mortality, fields.retrieved, onChange)}
          {FormFromFormfield(mortality, fields.retrieval_date, onChange, !isRetrieved)}
        </Box>,
        FormFromFormfield(mortality, fields.device_status, onChange),
        FormFromFormfield(mortality, fields.device_condition, onChange),
        FormFromFormfield(mortality, fields.device_deployment_status, onChange)
      ])}
      {/* critter status fields */}
      {FormPart('mort-critter', 'Animal Details', [
        <Box {...checkBoxWithLabel}>
          {FormFromFormfield(mortality, fields.mortality_investigation, onChange)}
          <span>{fields.mortality_investigation.long_label}</span>
        </Box>,
        FormFromFormfield(mortality, fields.mortality_record, onChange, false, true),
        FormFromFormfield(mortality, fields.activation_status, onChange, false, true),
        <Box {...boxProps} mt={2}>
          {FormFromFormfield(mortality, fields.animal_status, onChange)}
          {FormFromFormfield(mortality, fields.proximate_cause_of_death, onChange)}
        </Box>,
        <Box {...boxProps} mt={2}>
          {FormFromFormfield(mortality, fields.predator_known, onChange, !isPredation)}
          {FormFromFormfield(mortality, fields.predator_species, onChange, !isPredatorKnown)}
        </Box>,
        <Box {...boxProps} mt={2}>
          {<CaptivityStatusForm event={mortality} handleFormChange={handleFormChange} />}
        </Box>
      ])}
      {/* location fields */}
      {FormPart('mort-loc', 'Event Details', [
        <LocationEventForm event={mortality.location_event} notifyChange={onChangeLocationProp} />
      ])}
    </>
  );
}
