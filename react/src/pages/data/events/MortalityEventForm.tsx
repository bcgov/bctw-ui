import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormChangeEvent, parseFormChangeResult } from 'types/form_types';
import { FormSection } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import { ReactNode, useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent, { MortalityAnimalStatus } from 'types/events/mortality_event';
import CaptivityStatusForm from './CaptivityStatusForm';
import { boxSpreadRowProps } from './EventComponents';
import Radio from 'components/form/Radio';
import { WorkflowStrings } from 'constants/strings';

type MortEventProps = {
  event: MortalityEvent;
  handleFormChange: FormChangeEvent;
  handleExitEarly: (message: ReactNode) => void;
};

/**
 */
export default function MortalityEventForm({ event, handleFormChange, handleExitEarly}: MortEventProps): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  // business logic workflow state
  const [wasInvestigated, setWasInvestigated] = useState(false);
  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredation, setIsPredation] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(false);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [ucodDisabled, setUcodDisabled] = useState(true);
  const [isUCODKnown, setIsUCODKnown] = useState(false);
  // setting animal_status to alive disables the form.
  const [critterIsAlive, setCritterIsAlive] = useState(false);

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  // if critter is marked as alive, workflow wrapper will show exit workflow prompt
  useDidMountEffect(() => {
    // event.animal_status = critterIsAlive ? 'Alive' : 'Mortality';
    event.onlySaveAnimalStatus = critterIsAlive;
    if (critterIsAlive) {
      event.shouldSaveDevice = false;
      event.shouldUnattachDevice = false;
      handleExitEarly(<p>{WorkflowStrings.mortalityExitEarly}</p>);
    } else {
      event.shouldSaveDevice = true;
    }
  }, [critterIsAlive])

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<MortalityEvent>(v);
    // retrieved checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved') {
      setIsRetrieved(value as boolean);
    } else if (key === 'proximate_cause_of_death') {
      setUcodDisabled(false); // enable ucod when a proximate cause is chosen
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
    } else if (key === 'animal_status') {
      if (value === 'Mortality' || value === 'Alive') {
        setCritterIsAlive(value === 'Alive');
      }
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
      {FormSection('mort-a-st', event.formatPropAsHeader('animal_status'), [
        <Radio
          propName={fields.animal_status.prop}
          changeHandler={onChange}
          defaultSelectedValue={'Mortality'}
          values={(['Mortality', 'Alive'] as MortalityAnimalStatus[]).map((p) => ({ label: p, value: p }))}
        />
      ])}
      {FormSection('mort-device', 'Event Details', [
        // location events, nesting some other components inside
        <LocationEventForm
          disabled={critterIsAlive}
          event={mortality.location_event}
          notifyChange={onChangeLocationProp}
          childNextToDate={CreateFormField(mortality, fields.device_status, onChange, critterIsAlive)}
          children={
            <>
              {/* device retrieval */}
              <Box mb={1} {...boxSpreadRowProps}>
                {CreateFormField(mortality, fields.retrieved, onChange, critterIsAlive)}
                {CreateFormField(mortality, { ...fields.retrieval_date, required: isRetrieved }, onChange, !isRetrieved || critterIsAlive)}
              </Box>
              {/* data life / remove device */}
              <Box mb={1} {...boxSpreadRowProps}>
                {CreateFormField(mortality, fields.shouldUnattachDevice, onChange, critterIsAlive)}
                {CreateFormField(mortality, { ...fields.data_life_end, required: isBeingUnattached }, onChange, !isBeingUnattached || critterIsAlive)}
              </Box>
            </>
          }
        />,
        <Box mt={2}>
          {CreateFormField(mortality, fields.device_condition, onChange, critterIsAlive)}
          {CreateFormField(mortality, fields.device_deployment_status, onChange, critterIsAlive)}
        </Box>,
        CreateFormField(mortality, fields.activation_status, onChange, critterIsAlive, true)
      ], null, critterIsAlive)}
      {/* critter status fields */}
      {FormSection('mort-critter', 'Animal Details', [
        <Box {...boxSpreadRowProps}>
          {CreateFormField(mortality, fields.wasInvestigated, onChange, critterIsAlive)}
          {CreateFormField(mortality, fields.mortality_investigation, onChange, !wasInvestigated || critterIsAlive)}
        </Box>,
        CreateFormField(mortality, fields.mortality_report, onChange, critterIsAlive, true),
        <Box mt={1}>
          {CreateFormField(mortality, fields.proximate_cause_of_death, onChange, critterIsAlive)}
          {CreateFormField(mortality, fields.ultimate_cause_of_death, onChange, ucodDisabled || critterIsAlive)}
        </Box>,
        <Box mt={1} {...boxSpreadRowProps}>
          {CreateFormField(mortality, fields.predator_known, onChange, !isPredation || critterIsAlive)}
          {CreateFormField(mortality, fields.predator_species_pcod, onChange, !isPredatorKnown || critterIsAlive)}
          {CreateFormField(mortality, fields.pcod_confidence, onChange, !isPredatorKnown || critterIsAlive)}
        </Box>,
        <Box mt={1} {...boxSpreadRowProps}>
          {CreateFormField(mortality, fields.isUCODSpeciesKnown, onChange, !isPredatorKnown || critterIsAlive)}
          {CreateFormField(mortality, fields.predator_species_ucod, onChange, !(isPredatorKnown && isUCODKnown) || critterIsAlive)}
          {CreateFormField(mortality, fields.ucod_confidence, onChange, !(isPredatorKnown && isUCODKnown) || critterIsAlive)}
        </Box>,
        <CaptivityStatusForm event={mortality} handleFormChange={handleFormChange} disabled={critterIsAlive} />
      ], null, critterIsAlive)}
    </>
  );
}
