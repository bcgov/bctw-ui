import { WorkflowStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import CaptureEvent from 'types/events/capture_event';
import { LocationEvent } from 'types/events/location_event';
import { parseFormChangeResult } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';
import { wfFields, WorkflowFormProps } from 'types/events/event';
import { CreateFormField } from 'components/form/create_form_components';
import { Box } from '@material-ui/core';
import { boxSpreadRowProps } from './EventComponents';
import LocationEventForm from './LocationEventForm';
import CaptivityStatusForm from './CaptivityStatusForm';
import { Tooltip } from 'components/common';
import OkayModal from 'components/modal/OkayModal';
import Button from 'components/form/Button';

/**
 * todo: deal with data life
 * devices not assigned here?
 */
export default function CaptureEventForm({ event, handleFormChange }: WorkflowFormProps<CaptureEvent>): JSX.Element {
  const [capture, setCaptureEvent] = useState(event);
  const [isTransloc, setIsTransloc] = useState(false);
  // controls the status of the notification when the translocation field is unchecked
  const [showNotif, setShowNotif] = useState(false);
  /**
   * controls the state of the population/region selectors, if the translocation
   * is not complete, these will be filled out at a later time when the animal is released
   */
  const [isTranslocComplete, setIsTranslocComplete] = useState(true);
  const [hasBabies, setHasBabies] = useState(false);
  const [hasAssociation, setHasAssociation] = useState(false);
  const [mustPopulate, setMustPopulate] = useState(false);

  useDidMountEffect(() => {
    setCaptureEvent(event);
  }, [event]);

  const onChange = (v: Record<keyof CaptureEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<CaptureEvent>(v);
    if (key === 'translocation') {
      setIsTransloc(!!value);
    }
    if (key === 'isTranslocationComplete') {
      setShowNotif(!value);
      setIsTranslocComplete(!!value);
    } else if (key === 'associated_animal_id') {
      setHasAssociation(!!(value as string).length);
    } else if (key === 'juvenile_at_heel') {
      setHasBabies(value === 'Y');
    }
  };

  useDidMountEffect(() => {
    setMustPopulate(!!(isTransloc && isTranslocComplete));
  }, [isTranslocComplete, isTransloc]);

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  const { fields } = capture;
  if (!fields || !wfFields) {
    return <p>unable to load capture workflow</p>;
  }

  return (
    <>
      {FormSection('a', 'Capture Details', [
        <LocationEventForm
          childNextToDate={CreateFormField(capture, { ...wfFields.get('species'), tooltip: <p>{WorkflowStrings.capture.whatSpecies}</p> }, onChange)}
          event={capture.location_event}
          notifyChange={onChangeLocationProp}
        />,
        // recapture field
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.isRecapture}</span>}
          {CreateFormField(capture, wfFields.get('recapture'), onChange)}
        </Box>,
        // captivity status section
        <CaptivityStatusForm event={capture} handleFormChange={handleFormChange} hideMortStatus={true} />,
        // associated animal section
        <Box {...boxSpreadRowProps} mt={1}>
          {<span style={{ marginRight: '0.5rem' }}>{WorkflowStrings.capture.associated}</span>}
          {CreateFormField(capture, wfFields.get('associated_animal_id'), onChange)}
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.associatedID}</span>}
          {CreateFormField(capture, { ...wfFields.get('associated_animal_relationship'), required: hasAssociation }, onChange, { disabled: !hasAssociation })}
        </Box>,
        // animal characteristics section, with subheader tooltip indicating user should review other metadata
        <Tooltip title={WorkflowStrings.capture.shouldReviewNotif}>
          <Box mt={2}><span>{WorkflowStrings.capture.areUpdates}</span></Box>
        </Tooltip>,
        <Box {...boxSpreadRowProps} mt={1}>
          {CreateFormField(capture, wfFields.get('ear_tag_left_id'), onChange)}
          {CreateFormField(capture, wfFields.get('ear_tag_left_colour'), onChange)}
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {CreateFormField(capture, wfFields.get('ear_tag_right_id'), onChange)}
          {CreateFormField(capture, wfFields.get('ear_tag_right_colour'), onChange)}
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {CreateFormField(capture, wfFields.get('juvenile_at_heel'), onChange)}
          {CreateFormField(capture, wfFields.get('juvenile_at_heel_count'), onChange, { disabled: !hasBabies })}
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {CreateFormField(capture, wfFields.get('animal_colouration'), onChange)}
          {CreateFormField(capture, wfFields.get('life_stage'), onChange)}
        </Box>
      ])}
      {FormSection('b', 'Release Details', [
        // todo: btn disabled 
        <Box {...boxSpreadRowProps}>
          {<span>{WorkflowStrings.capture.beenReleased}</span>}
          <Button>{WorkflowStrings.capture.btnContinueTo('Release')}</Button>
        </Box >,
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.diedDuring('capture')}</span>}
          <Button >{WorkflowStrings.capture.btnContinueTo('Mortality')}</Button>
        </Box>
      ])}
      {FormSection('c', 'Translocation Details', [
        <Box {...boxSpreadRowProps}>
          {<span>{WorkflowStrings.capture.isTransloc}</span>}
          {/* translocation checkbox, controls disabled status of other fields in section */}
          {CreateFormField(capture, wfFields.get('translocation'), onChange)}
        </Box >,
        <Box {...boxSpreadRowProps}>
          {<span>{WorkflowStrings.capture.diedDuring('translocation')}</span>}
          <Button disabled={!isTransloc}>{WorkflowStrings.capture.btnContinueTo('Mortality')}</Button>
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.isTranslocCompleted}</span>}
          <Button disabled={!isTransloc} style={{paddingInline: '15px'}}>{WorkflowStrings.capture.btnContinueTo('Release')}</Button>
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {CreateFormField(capture, { ...wfFields.get('region'), required: mustPopulate }, onChange, { disabled: !isTransloc || !isTranslocComplete })}
          {CreateFormField(capture, { ...wfFields.get('population_unit'), required: mustPopulate }, onChange, { disabled: !isTransloc || !isTranslocComplete })}
        </Box>
      ])}
      <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
        {WorkflowStrings.capture.translocNotif}
      </OkayModal>
    </>
  );
}
