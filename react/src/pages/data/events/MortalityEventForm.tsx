import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormChangeEvent, parseFormChangeResult } from 'types/form_types';
import { FormSection } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import { useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';
import CaptivityStatusForm from './CaptivityStatusForm';
import { boxSpreadRowProps } from './EventComponents';

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
  const [wasInvestigated, setWasInvestigated] = useState(false);
  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredation, setIsPredation] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(false);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [isUCODKnown, setIsUCODKnown] = useState(false);

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<MortalityEvent>(v);
    // retrieved checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved') {
      setIsRetrieved(value as boolean);
    } else if (key === 'proximate_cause_of_death') {
      // value could be undefined ex. when a code is not selected
      if ((value as string)?.toLowerCase()?.includes('pred')) {
        setIsPredation(true);
      }
    } else if (key === 'predator_known') {
      setIsPredatorKnown(value as boolean);
    } else if (key === 'shouldUnattachDevice') {
    // make attachment end state required if user is removing device
      setIsBeingUnattached(value as boolean);
    } else if (key === 'wasInvestigated') {
      setWasInvestigated(value as boolean);
    } else if (key === 'isUCODSpeciesKnown') {
      setIsUCODKnown(value as boolean);
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
      {FormSection('mort-device', 'Event Details', [
        <LocationEventForm
          event={mortality.location_event}
          notifyChange={onChangeLocationProp}
          children={
            <>
              <Box mb={1} {...boxSpreadRowProps}>
                {CreateFormField(mortality, fields.retrieved, onChange)}
                {CreateFormField(mortality, {...fields.retrieval_date, required: isRetrieved}, onChange, !isRetrieved)}
              </Box>
              <Box mb={1} {...boxSpreadRowProps}>
                {CreateFormField(mortality, fields.shouldUnattachDevice, onChange)}
                {CreateFormField(mortality, {...fields.data_life_end, required: isBeingUnattached }, onChange, !isBeingUnattached)}
              </Box>
            </>
          }
        />,
        <Box mt={2}>
          {CreateFormField(mortality, fields.device_status, onChange)}
          {CreateFormField(mortality, fields.device_condition, onChange)}
          {CreateFormField(mortality, fields.device_deployment_status, onChange)}
        </Box>
      ])}
      {/* critter status fields */}
      {FormSection('mort-critter', 'Animal Details', [
        <Box {...boxSpreadRowProps}>
          {CreateFormField(mortality, fields.wasInvestigated, onChange)}
          {CreateFormField(mortality, fields.mortality_investigation, onChange, !wasInvestigated)}
        </Box>,
        CreateFormField(mortality, fields.mortality_report, onChange, false, true),
        CreateFormField(mortality, fields.activation_status, onChange, false, true),
        <Box mt={1}>
          {CreateFormField(mortality, fields.animal_status, onChange)}
          {CreateFormField(mortality, fields.proximate_cause_of_death, onChange)}
        </Box>,
        <Box mt={1} {...boxSpreadRowProps}>
          {CreateFormField(mortality, fields.predator_known, onChange, !isPredation)}
          {CreateFormField(mortality, fields.predator_species_pcod, onChange, !isPredatorKnown)}
        </Box>,
        <Box mt={1} {...boxSpreadRowProps}>
          {CreateFormField(mortality, fields.isUCODSpeciesKnown, onChange, !isPredatorKnown)}
          {CreateFormField(mortality, fields.predator_species_ucod, onChange, !isPredatorKnown && !isUCODKnown)}
        </Box>,
        <CaptivityStatusForm event={mortality} handleFormChange={handleFormChange} />
      ])}
    </>
  );
}
