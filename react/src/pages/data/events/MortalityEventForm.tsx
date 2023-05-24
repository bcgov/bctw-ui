import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { parseFormChangeResult } from 'types/form_types';
import { FormSection } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import { useEffect, useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';
import CaptivityStatusForm from './CaptivityStatusForm';
import { boxSpreadRowProps } from './EventComponents';
import Radio from 'components/form/Radio';
import { WorkflowStrings } from 'constants/strings';
import { WorkflowFormProps } from 'types/events/event';
import { wfFields } from 'types/events/form_fields';

type MortEventProps = WorkflowFormProps<MortalityEvent> & {
  event: MortalityEvent;
};

/**
 * todo: dont hardcode radio values, retrieve from code somehow
 */
export default function MortalityEventForm({ event, handleFormChange, handleExitEarly }: MortEventProps): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  // business logic workflow state
  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredation, setIsPredation] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(!!event.proximate_predated_by_taxon_id ?? false);
  const [isUcodPredatorKnown, setIsUcodPredatorKnown] = useState(!!event.ultimate_predated_by_taxon_id ?? false);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [ucodDisabled, setUcodDisabled] = useState(true);
  const [isUCODKnown, setIsUCODKnown] = useState(false);
  // setting critter_status to alive disables the form.
  const [critterIsAlive, setCritterIsAlive] = useState(false);

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);
  // if critter is marked as alive, workflow wrapper will show exit workflow prompt
  useDidMountEffect(() => {
    event.onlySaveAnimalStatus = critterIsAlive;
    if (critterIsAlive) {
      // update these props to indicate that device/attachment should not be saved
      event.shouldSaveDevice = false;
      event.shouldUnattachDevice = false;
      // call the exite early handler from WorkflowWrapper, passing the confirmation message
      handleExitEarly(<p>{WorkflowStrings.mortality.exitEarly}</p>);
    } else {
      event.shouldSaveDevice = true;
    }
  }, [critterIsAlive]);

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<MortalityEvent>(v);
    // retrieved_ind checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved_ind') {
      setIsRetrieved(!!value);
      // } else if (key === 'proximate_cause_of_death') {
      //   setUcodDisabled(false); // enable ucod when a proximate cause is chosen
      //   // value could be undefined ex. when a code is not selected
      //   if ((value as string)?.toLowerCase()?.includes('pred')) {
      //     setIsPredation(true);
      //   }
    } else if (key === 'proximate_cause_of_death_id') {
      setIsPredatorKnown(value['label'] === 'Predation');
    } else if (key === 'ultimate_cause_of_death_id') {
      setIsUcodPredatorKnown(value['label'] === 'Predation');
    } else if (key === 'shouldUnattachDevice') {
      // make attachment end state required if user is removing device
      setIsBeingUnattached(!!value);
    } else if (key === 'isUCODtaxonKnown') {
      setIsUCODKnown(!!value);
    } //else if (key === 'critter_status') {
    //   if (value === 'Mortality' || value === 'Alive') {
    //     setCritterIsAlive(value === 'Alive');
    //   }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  const fields = mortality.fields;

  if (!fields || !wfFields) {
    return null;
  }

  const isDisabled = { disabled: critterIsAlive };
  return (
    //<></>
    //TODO add this back CRITTERBASE INTEGRATION
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
              mortality.fields.proximate_predated_by_taxon_id,
              onChange,
              isPredatorKnown ? {} : { disabled: !isPredatorKnown, value: '' }
            )}
          </Box>
          <Box>
            {CreateFormField(mortality, mortality.fields.ultimate_cause_of_death_id, onChange)}
            {CreateFormField(mortality, mortality.fields.ultimate_cause_of_death_confidence, onChange)}
            {CreateFormField(
              mortality,
              mortality.fields.ultimate_predated_by_taxon_id,
              onChange,
              isUcodPredatorKnown ? {} : { disabled: !isUcodPredatorKnown, value: '' }
            )}
          </Box>
        </FormSection>
        <FormSection id={'mort-dev'} header={'Device Information'}>
          <Box mb={1} {...boxSpreadRowProps}>
            {CreateFormField(mortality, mortality.fields.retrieval_date, onChange, {
              disabled: !isRetrieved || critterIsAlive
            })}
            {CreateFormField(mortality, { ...mortality.fields.retrieved_ind, required: isRetrieved }, onChange)}
          </Box>
          <Box mb={1} {...boxSpreadRowProps}>
            {CreateFormField(mortality, { ...fields.data_life_end, required: isBeingUnattached }, onChange, {
              disabled: !isBeingUnattached || critterIsAlive
            })}
            {CreateFormField(mortality, { ...fields.shouldUnattachDevice }, onChange, isDisabled)}
          </Box>
        </FormSection>
      </Box>
      {/*<FormSection id='mort-a-st' header={'Critter Status'} disabled={critterIsAlive}>
        {[
          <Radio
            key='mort-rad-status'
            propName={wfFields.get('critter_status').prop}
            changeHandler={onChange}
            defaultSelectedValue={'Mortality'}
            values={['Mortality', 'Alive'].map((p) => ({ label: p, value: p }))}
          />
        ]}
      </FormSection>
      <FormSection id='mort-device' header='Event Details' disabled={critterIsAlive}>
        {[
          <LocationEventForm
            key='mort-loc'
            disabled={critterIsAlive}
            event={mortality.location_id}
            notifyChange={onChangeLocationProp}
            childNextToDate={CreateFormField(mortality, wfFields.get('device_status'), onChange, isDisabled)}
            children={
              <>

                <Box mb={1} {...boxSpreadRowProps}>
                  {CreateFormField(mortality, wfFields.get('retrieved_ind'), onChange, isDisabled)}
                  {CreateFormField(mortality, { ...wfFields.get('retrieval_date'), required: isRetrieved }, onChange, {
                    disabled: !isRetrieved || critterIsAlive
                  })}
                </Box>

                <Box mb={1} {...boxSpreadRowProps}>
                  {CreateFormField(mortality, { ...fields.shouldUnattachDevice }, onChange, isDisabled)}
                  {CreateFormField(mortality, { ...fields.data_life_end, required: isBeingUnattached }, onChange, {
                    disabled: !isBeingUnattached || critterIsAlive
                  })}
                </Box>
              </>
            }
          />,
          <Box key='bx-devcond' mt={2} display='flex' columnGap={1}>
            {CreateFormField(mortality, wfFields.get('device_condition'), onChange, isDisabled)}
            {CreateFormField(mortality, wfFields.get('device_deployment_status'), onChange, isDisabled)}
          </Box>,
          <Box key='bx-act-status'>
            {CreateFormField(mortality, wfFields.get('activation_status_ind'), onChange, isDisabled, true)}
          </Box>
        ]}
      </FormSection>*/}
      {/* critter status fields */}
      {/*<FormSection id='mort-critter' header='Critter Details' disabled={critterIsAlive}>
        {[
          <Box key='bx-invest' {...boxSpreadRowProps}>
            {<span>{WorkflowStrings.mortality.mort_investigation}</span>}
            {CreateFormField(mortality, { required: true, ...wfFields.get('mortality_investigation') }, onChange, {
              disabled: critterIsAlive,
              style: { width: '250px' }
            })}
          </Box>,
          <Box key='bx-mort-rep'>
            {CreateFormField(mortality, wfFields.get('mortality_report_ind'), onChange, isDisabled, true)}
          </Box>,
          <Box key='bx-cod' mt={1} display='flex' columnGap={1}>
            {CreateFormField(mortality, wfFields.get('proximate_cause_of_death'), onChange, isDisabled)}
            {CreateFormField(mortality, wfFields.get('ultimate_cause_of_death'), onChange, {
              disabled: ucodDisabled || critterIsAlive
            })}
          </Box>,
          <Box key='bx-pred' mt={1} {...boxSpreadRowProps}>
            {CreateFormField(mortality, wfFields.get('predator_known_ind'), onChange, {
              disabled: !isPredation || critterIsAlive
            })}
            {CreateFormField(mortality, wfFields.get('predator_taxon_pcod'), onChange, {
              disabled: !isPredatorKnown || critterIsAlive
            })}
            {CreateFormField(mortality, wfFields.get('pcod_confidence'), onChange, {
              disabled: !isPredatorKnown || critterIsAlive
            })}
          </Box>,
          <Box key='bx=ucod' mt={1} {...boxSpreadRowProps}>
            {CreateFormField(mortality, { ...fields.isUCODtaxonKnown }, onChange, {
              disabled: !isPredatorKnown || critterIsAlive
            })}
            {CreateFormField(mortality, wfFields.get('predator_taxon_ucod'), onChange, {
              disabled: !(isPredatorKnown && isUCODKnown) || critterIsAlive
            })}
            {CreateFormField(mortality, wfFields.get('ucod_confidence'), onChange, {
              disabled: !(isPredatorKnown && isUCODKnown) || critterIsAlive
            })}
          </Box>,
          <CaptivityStatusForm
            key='mort-capt-form'
            event={mortality}
            handleFormChange={handleFormChange}
            disabled={critterIsAlive}
          />
        ]}
      </FormSection> */}
    </>
  );
}
