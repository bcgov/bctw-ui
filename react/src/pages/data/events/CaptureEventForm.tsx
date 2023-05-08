import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { WorkflowStrings } from 'constants/strings';
import { useEffect, useState } from 'react';
import { CaptureEvent2 } from 'types/events/capture_event';
import { WorkflowFormProps } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { parseFormChangeResult } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';
import { boxSpreadRowProps } from './EventComponents';
import LocationEventForm from './LocationEventForm';
import { Dayjs } from 'dayjs';
/**
 * todo: deal with data life
 * devices not assigned here?
 */
export default function CaptureEventForm({
  canSave,
  event: capture,
  handlePostponeSave,
  handleFormChange
}: WorkflowFormProps<CaptureEvent2>): JSX.Element {
  const [showRelease, setShowRelease] = useState(false);
  const [showMortalityCheck, setMortalityCheck] = useState<'capture' | 'release' | 'unknown'>('unknown');
  const { diedDuring, differentReleaseDetails } = WorkflowStrings.capture;

  const onChange = (v: Record<keyof CaptureEvent2 | keyof LocationEvent, unknown>): void => {
    const [key, value] = parseFormChangeResult<CaptureEvent2>(v);
    switch (key) {
      case 'capture_mortality':
        setMortalityCheck(value ? 'capture' : 'unknown');
        handleFormChange({ release_mortality: undefined });
        break;
      case 'release_mortality':
        setMortalityCheck(value ? 'release' : 'unknown');
        handleFormChange({ capture_mortality: undefined });
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
      <FormSection id='died-during-checkbox-2' header='Release Information'>
        {CreateFormField(capture, capture.fields.show_release, handleShowRelease, { label: differentReleaseDetails })}
      </FormSection>
      {showMortalityCheck == 'unknown' || showMortalityCheck == 'release' ? (
        <FormSection id='died-during-checkbox-3' header=''>
          {CreateFormField(capture, capture.fields.release_mortality, onChange, { label: diedDuring('release') })}
        </FormSection>
      ) : null}
    </Box>
  );
}
