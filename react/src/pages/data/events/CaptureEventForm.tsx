import { WorkflowStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import CaptureEvent from 'types/events/capture_event';
import { LocationEvent } from 'types/events/location_event';
import { parseFormChangeResult } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';
import { wfFields, WorkflowFormProps } from 'types/events/event';
import { CreateFormField } from 'components/form/create_form_components';
import { Box } from '@mui/material';
import { boxSpreadRowProps } from './EventComponents';
import LocationEventForm from './LocationEventForm';
import CaptivityStatusForm from './CaptivityStatusForm';
import { Tooltip } from 'components/common';
import OkayModal from 'components/modal/OkayModal';
import { Button } from 'components/common';

/**
 * todo: deal with data life
 * devices not assigned here?
 */
export default function CaptureEventForm({
  canSave,
  event,
  handlePostponeSave,
  handleFormChange
}: WorkflowFormProps<CaptureEvent>): JSX.Element {
  const [capture, setCaptureEvent] = useState(event);
  const [isTransloc, setIsTransloc] = useState(false);
  // controls the status of the notification when the translocation_ind field is unchecked
  const [showNotif, setShowNotif] = useState(false);
  /**
   * controls the state of the population/region selectors, if the translocation_ind
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
    if (key === 'translocation_ind') {
      setIsTransloc(!!value);
    }
    if (key === 'isTranslocationComplete') {
      setShowNotif(!value);
      setIsTranslocComplete(!!value);
    } else if (key === 'associated_animal_id') {
      setHasAssociation(!!(value as string).length);
    } else if (key === 'juvenile_at_heel') {
      setHasBabies(String(value).toLowerCase() === 'y');
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

  // strings used
  const {
    areUpdates,
    associated,
    associatedID,
    beenReleased,
    btnContinueTo,
    diedDuring,
    isTransloc: strIsTransloc,
    isRecapture,
    isTranslocCompleted,
    shouldReviewNotif,
    translocNotif
  } = WorkflowStrings.capture;

  return (
    <>
      <FormSection id='a' header='Capture Details'>
        {[
          <LocationEventForm key='ce-loc' event={capture.location_event} notifyChange={onChangeLocationProp} />,
          // recapture_ind field
          <Box key='bx-rec' {...boxSpreadRowProps} mt={1}>
            {/* {<span>{isRecapture}</span>} */}
            {/* {CreateFormField(capture, wfFields.get('recapture_ind'), onChange)} */}
          </Box>,
          // captivity status section
          <CaptivityStatusForm
            key='ce-capt'
            event={capture}
            handleFormChange={handleFormChange}
            hideMortStatus={true}
          />,
          // associated animal section
          <Box key='bx-acc' {...boxSpreadRowProps} mt={1}>
            {<span style={{ marginRight: '0.5rem' }}>{associated}</span>}
            {/* {CreateFormField(capture, wfFields.get('associated_animal_id'), onChange)} */}
          </Box>,
          <Box key='bx-rel' {...boxSpreadRowProps} mt={1}>
            {<span>{associatedID}</span>}
            {/* {CreateFormField(capture, wfFields.get('associated_animal_relationship'), onChange, {
              required: hasAssociation,
              disabled: !hasAssociation
            })} */}
          </Box>,
          // animal characteristics section, with subheader tooltip indicating user should review other metadata
          <Tooltip key='tt-rev' title={shouldReviewNotif}>
            <Box mt={2}>
              <span>{areUpdates}</span>
            </Box>
          </Tooltip>,
          <Box key='bx-et-l' {...boxSpreadRowProps} mt={1}>
            {/* {CreateFormField(capture, wfFields.get('ear_tag_left_id'), onChange)}
            {CreateFormField(capture, wfFields.get('ear_tag_left_colour'), onChange)} */}
          </Box>,
          <Box key='bx-et-r' {...boxSpreadRowProps} mt={1}>
            {/* {CreateFormField(capture, wfFields.get('ear_tag_right_id'), onChange)}
            {CreateFormField(capture, wfFields.get('ear_tag_right_colour'), onChange)} */}
          </Box>,
          <Box key='bx-juv' {...boxSpreadRowProps} mt={1}>
            {/* {CreateFormField(capture, wfFields.get('juvenile_at_heel'), onChange)}
            {CreateFormField(capture, wfFields.get('juvenile_at_heel_count'), onChange, {
              required: hasBabies,
              disabled: !hasBabies
            })} */}
          </Box>,
          <Box key='bx-life' {...boxSpreadRowProps} mt={1}>
            {/* {CreateFormField(capture, wfFields.get('animal_colouration'), onChange)}
            {CreateFormField(capture, wfFields.get('life_stage'), onChange)} */}
          </Box>
        ]}
      </FormSection>
      <FormSection id='c' header='Translocation Details'>
        {[
          <Box key='bx-transloc' {...boxSpreadRowProps}>
            {<span>{strIsTransloc}</span>}
            {/* translocation checkbox, controls disabled status of other fields in section */}
            {/* {CreateFormField(capture, wfFields.get('translocation_ind'), onChange)} */}
          </Box>,
          <Box key='bx-rel' {...boxSpreadRowProps} mt={1}>
            {<span>{isTranslocCompleted}</span>}
            <Button
              onClick={(): void => handlePostponeSave('release')}
              disabled={!isTransloc || !canSave}
              style={{ paddingInline: '15px' }}>
              {WorkflowStrings.capture.btnContinueTo('Release')}
            </Button>
          </Box>,
          <Box key='bx-mort' {...boxSpreadRowProps}>
            {<span>{diedDuring('translocation_ind')}</span>}
            <Button onClick={(): void => handlePostponeSave('mortality')} disabled={!isTransloc || !canSave}>
              {WorkflowStrings.capture.btnContinueTo('Mortality')}
            </Button>
          </Box>,
          <Box key='bx-f' {...boxSpreadRowProps} mt={1}>
            {/* {CreateFormField(capture, wfFields.get('region'), onChange, {
              required: mustPopulate,
              disabled: !isTransloc || !isTranslocComplete
            })} */}
            {CreateFormField(capture, wfFields.get('collection_unit'), onChange, {
              required: mustPopulate,
              disabled: !isTransloc || !isTranslocComplete
            })}
          </Box>
        ]}
      </FormSection>
      <FormSection id='b' header='Release Details'>
        {[
          <Box key='bx-goto-rel' {...boxSpreadRowProps}>
            {<span>{beenReleased}</span>}
            <Button disabled={!canSave} onClick={(): void => handlePostponeSave('release')}>
              {btnContinueTo('Release')}
            </Button>
          </Box>,
          <Box key='bx-goto-capt' {...boxSpreadRowProps} mt={1}>
            {<span>{diedDuring('capture')}</span>}
            <Button disabled={!canSave} onClick={(): void => handlePostponeSave('mortality')}>
              {btnContinueTo('Mortality')}
            </Button>
          </Box>
        ]}
      </FormSection>
      <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
        {translocNotif}
      </OkayModal>
    </>
  );
}
