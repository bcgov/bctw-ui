import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormSection } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import { useState } from 'react';
import { WorkflowFormProps } from 'types/events/event';
import { wfFields } from 'types/events/form_fields';
import MortalityEvent from 'types/events/mortality_event';
import { parseFormChangeResult } from 'types/form_types';
import { boxSpreadRowProps } from './EventComponents';

type MortEventProps = WorkflowFormProps<MortalityEvent> & {
  event: MortalityEvent;
  isEditing?: boolean;
};

/**
 * todo: dont hardcode radio values, retrieve from code somehow
 */
export default function MortalityEventForm({
  event,
  handleFormChange,
  handleExitEarly,
  isEditing
}: MortEventProps): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  // business logic workflow state
  const is_pcod_predation = event.proximate_cause_of_death?.cod_category === 'Predation';
  const is_ucod_predation = event.ultimate_cause_of_death?.cod_category === 'Predation';

  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(!!event.proximate_predated_by_itis_tsn || is_pcod_predation);
  const [isUcodPredatorKnown, setIsUcodPredatorKnown] = useState(
    !!event.ultimate_predated_by_itis_tsn || is_ucod_predation
  );
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);

  useDidMountEffect(() => {
    setIsPredatorKnown(is_pcod_predation);
    setIsUcodPredatorKnown(is_ucod_predation);
    setMortalityEvent(event);
  }, [event]);
  // if critter is marked as alive, workflow wrapper will show exit workflow prompt

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    v['eventKey'] = 'mortality';
    handleFormChange(v);
    const [key, value, label] = parseFormChangeResult<MortalityEvent>(v);
    // retrieved_ind checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved_ind') {
      setIsRetrieved(!!value);
    } else if (key === 'proximate_cause_of_death_id') {
      setIsPredatorKnown(label === 'Predation');
    } else if (key === 'ultimate_cause_of_death_id') {
      setIsUcodPredatorKnown(label === 'Predation');
    } else if (key === 'shouldUnattachDevice') {
      // make attachment end state required if user is removing device
      setIsBeingUnattached(!!value);
    }
  };

  const fields = mortality.fields;

  if (!fields || !wfFields) {
    return null;
  }
  return (
    <>
      <Box>
        <LocationEventForm key='mort-loc' event={mortality.location} notifyChange={onChange}>
          {CreateFormField(mortality, mortality.fields.mortality_timestamp, onChange)}
          {CreateFormField(mortality, mortality.fields.mortality_comment, onChange)}
        </LocationEventForm>
        <FormSection id={'mort-cod'} header={'Cause of Death'}>
          <Box>
            {CreateFormField(mortality, mortality.fields.proximate_cause_of_death_id, onChange)}
            {CreateFormField(mortality, mortality.fields.proximate_cause_of_death_confidence, onChange)}
            {CreateFormField(
              mortality,
              mortality.fields.proximate_predated_by_itis_tsn,
              onChange,
              isPredatorKnown ? {} : { disabled: !isPredatorKnown, value: '' }
            )}
          </Box>
          <Box>
            {CreateFormField(mortality, mortality.fields.ultimate_cause_of_death_id, onChange)}
            {CreateFormField(mortality, mortality.fields.ultimate_cause_of_death_confidence, onChange)}
            {CreateFormField(
              mortality,
              mortality.fields.ultimate_predated_by_itis_tsn,
              onChange,
              isUcodPredatorKnown ? {} : { disabled: !isUcodPredatorKnown, value: '' }
            )}
          </Box>
        </FormSection>
        {!isEditing && (
          <FormSection id={'mort-dev'} header={'Device Information'}>
            <Box mb={1} {...boxSpreadRowProps}>
              {CreateFormField(mortality, mortality.fields.retrieval_date, onChange, {
                disabled: !isRetrieved
              })}
              {CreateFormField(mortality, { ...mortality.fields.retrieved_ind, required: isRetrieved }, onChange)}
            </Box>
            <Box mb={1} {...boxSpreadRowProps}>
              {CreateFormField(mortality, { ...fields.data_life_end, required: isBeingUnattached }, onChange, {
                disabled: !isBeingUnattached
              })}
              {CreateFormField(mortality, { ...fields.shouldUnattachDevice }, onChange)}
            </Box>
          </FormSection>
        )}
      </Box>
    </>
  );
}
