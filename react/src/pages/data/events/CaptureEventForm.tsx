import { WorkflowStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { CSSProperties, useState } from 'react';
import CaptureEvent, { CaptureEvent2 } from 'types/events/capture_event';
import { LocationEvent } from 'types/events/location_event';
import { eInputType, parseFormChangeResult } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';
import { wfFields, WorkflowFormProps, WorkflowType } from 'types/events/event';
import { CreateEditCheckboxField, CreateFormField } from 'components/form/create_form_components';
import { Box, Checkbox, FormControlLabel, Switch } from '@mui/material';
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
}: WorkflowFormProps<CaptureEvent2>): JSX.Element {
  const [capture, setCaptureEvent] = useState(event);
  const [showRelease, setShowRelease] = useState(false);
  const [showMortalityCheck, setMortalityCheck] = useState<'capture' | 'release' | 'unknown'>('unknown');
  const { diedDuring, differentReleaseDetails } = WorkflowStrings.capture;

  const onChange = (v: Record<keyof CaptureEvent2 | keyof LocationEvent, unknown>): void => {
    const [key, value] = parseFormChangeResult<CaptureEvent2>(v);
    switch (key) {
      case 'capture_mortality':
        setMortalityCheck(value ? 'capture' : 'unknown');
        handleFormChange({ release_mortality: false });
        break;
      case 'release_mortality':
        setMortalityCheck(value ? 'release' : 'unknown');
        handleFormChange({ capture_mortality: false });
        break;
    }
    handleFormChange(v);
  };

  const handleShowRelease = (): void => {
    setShowRelease((r) => !r);
  };

  const { fields } = capture;
  if (!fields) {
    return <p>unable to load capture workflow</p>;
  }

  //TODO the form doesnt currently null entries in the release section if showRelease is set to false
  return (
    <Box>
      {/* Capture Date -> Capture Environment */}
      <LocationEventForm key='ce-loc' event={capture.capture_location} notifyChange={onChange}>
        <Box key='bx-rec' {...boxSpreadRowProps}>
          {CreateFormField(capture, capture.fields.capture_timestamp, onChange)}
          {CreateFormField(capture, capture.fields.capture_comment, onChange)}
        </Box>
      </LocationEventForm>

      {/* Capture Information*/}
      {showMortalityCheck == 'unknown' || showMortalityCheck == 'capture' ? (
        <FormSection id='died-during-checkbox' header='Capture Information'>
          {CreateFormField(capture, capture.fields.capture_mortality, onChange, { label: diedDuring('capture') })}
        </FormSection>
      ) : null}

      {/* Release Date */}
      <FormSection id='release-date' header='Release Date'>
        <Box key='bx-rec' {...boxSpreadRowProps}>
          {CreateFormField(capture, capture.fields.release_timestamp, onChange)}
          {CreateFormField(capture, capture.fields.release_comment, onChange)}
        </Box>
      </FormSection>

      {/* Release Location -> Release Environment*/}
      {showRelease ? (
        <LocationEventForm key='ce-loc-b' event={capture.release_location} notifyChange={onChange} />
      ) : null}

      {/* Release Information */}
      {showMortalityCheck == 'unknown' || showMortalityCheck == 'release' ? (
        <FormSection id='died-during-checkbox-2' header='Release Information'>
          {CreateFormField(capture, capture.fields.release_mortality, onChange, { label: diedDuring('release') })}
          {CreateFormField(capture, capture.fields.show_release, handleShowRelease, { label: differentReleaseDetails })}
        </FormSection>
      ) : null}
    </Box>
    // <>
    // TODO old critterbase integration
    //   <FormSection id='a' header='Capture Details'>
    //     {[
    //       <LocationEventForm key='ce-loc' event={capture.location_event} notifyChange={onChangeLocationProp} />,
    //       // recapture_ind field
    //       <Box key='bx-rec' {...boxSpreadRowProps} mt={1}>
    //         {/* {<span>{isRecapture}</span>} */}
    //         {/* {CreateFormField(capture, wfFields.get('recapture_ind'), onChange)} */}
    //       </Box>,
    //       // captivity status section
    //       <CaptivityStatusForm
    //         key='ce-capt'
    //         event={capture}
    //         handleFormChange={handleFormChange}
    //         hideMortStatus={true}
    //       />,
    //       // associated animal section
    //       <Box key='bx-acc' {...boxSpreadRowProps} mt={1}>
    //         {<span style={{ marginRight: '0.5rem' }}>{associated}</span>}
    //         {/* {CreateFormField(capture, wfFields.get('associated_animal_id'), onChange)} */}
    //       </Box>,
    //       <Box key='bx-rel' {...boxSpreadRowProps} mt={1}>
    //         {<span>{associatedID}</span>}
    //         {/* {CreateFormField(capture, wfFields.get('associated_animal_relationship'), onChange, {
    //           required: hasAssociation,
    //           disabled: !hasAssociation
    //         })} */}
    //       </Box>,
    //       // animal characteristics section, with subheader tooltip indicating user should review other metadata
    //       <Tooltip key='tt-rev' title={shouldReviewNotif}>
    //         <Box mt={2}>
    //           <span>{areUpdates}</span>
    //         </Box>
    //       </Tooltip>,
    //       <Box key='bx-et-l' {...boxSpreadRowProps} mt={1}>
    //         {/* {CreateFormField(capture, wfFields.get('ear_tag_left_id'), onChange)}
    //         {CreateFormField(capture, wfFields.get('ear_tag_left_colour'), onChange)} */}
    //       </Box>,
    //       <Box key='bx-et-r' {...boxSpreadRowProps} mt={1}>
    //         {/* {CreateFormField(capture, wfFields.get('ear_tag_right_id'), onChange)}
    //         {CreateFormField(capture, wfFields.get('ear_tag_right_colour'), onChange)} */}
    //       </Box>,
    //       <Box key='bx-juv' {...boxSpreadRowProps} mt={1}>
    //         {/* {CreateFormField(capture, wfFields.get('juvenile_at_heel'), onChange)}
    //         {CreateFormField(capture, wfFields.get('juvenile_at_heel_count'), onChange, {
    //           required: hasBabies,
    //           disabled: !hasBabies
    //         })} */}
    //       </Box>,
    //       <Box key='bx-life' {...boxSpreadRowProps} mt={1}>
    //         {/* {CreateFormField(capture, wfFields.get('animal_colouration'), onChange)}
    //         {CreateFormField(capture, wfFields.get('life_stage'), onChange)} */}
    //       </Box>
    //     ]}
    //   </FormSection>
    //   <FormSection id='c' header='Translocation Details'>
    //     {[
    //       <Box key='bx-transloc' {...boxSpreadRowProps}>
    //         {<span>{strIsTransloc}</span>}
    //         {/* translocation checkbox, controls disabled status of other fields in section */}
    //         {/* {CreateFormField(capture, wfFields.get('translocation_ind'), onChange)} */}
    //       </Box>,
    //       <Box key='bx-rel' {...boxSpreadRowProps} mt={1}>
    //         {<span>{isTranslocCompleted}</span>}
    //         <Button
    //           onClick={(): void => handlePostponeSave('release')}
    //           disabled={!isTransloc || !canSave}
    //           style={{ paddingInline: '15px' }}>
    //           {WorkflowStrings.capture.btnContinueTo('Release')}
    //         </Button>
    //       </Box>,
    //       <Box key='bx-mort' {...boxSpreadRowProps}>
    //         {<span>{diedDuring('translocation_ind')}</span>}
    //         <Button onClick={(): void => handlePostponeSave('mortality')} disabled={!isTransloc || !canSave}>
    //           {WorkflowStrings.capture.btnContinueTo('Mortality')}
    //         </Button>
    //       </Box>,
    //       <Box key='bx-f' {...boxSpreadRowProps} mt={1}>
    //         {/* {CreateFormField(capture, wfFields.get('region'), onChange, {
    //           required: mustPopulate,
    //           disabled: !isTransloc || !isTranslocComplete
    //         })} */}
    //         {CreateFormField(capture, wfFields.get('collection_unit'), onChange, {
    //           required: mustPopulate,
    //           disabled: !isTransloc || !isTranslocComplete
    //         })}
    //       </Box>
    //     ]}
    //   </FormSection>
    //   <FormSection id='b' header='Release Details'>
    //     {[
    //       <Box key='bx-goto-rel' {...boxSpreadRowProps}>
    //         {<span>{beenReleased}</span>}
    //         <Button disabled={!canSave} onClick={(): void => handlePostponeSave('release')}>
    //           {btnContinueTo('Release')}
    //         </Button>
    //       </Box>,
    //       <Box key='bx-goto-capt' {...boxSpreadRowProps} mt={1}>
    //         {<span>{diedDuring('capture')}</span>}
    //         <Button disabled={!canSave} onClick={(): void => handlePostponeSave('mortality')}>
    //           {btnContinueTo('Mortality')}
    //         </Button>
    //       </Box>
    //     ]}
    //   </FormSection>
    //   <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
    //     {translocNotif}
    //   </OkayModal>
    // </>
  );
}
