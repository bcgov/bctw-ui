import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { WorkflowStrings } from 'constants/strings';
import { useEffect, useState } from 'react';
import { CaptureEvent2 } from 'types/events/capture_event';
import { WorkflowFormProps } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { FormChangeEvent, parseFormChangeResult } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';
import { boxSpreadRowProps } from './EventComponents';
import LocationEventForm from './LocationEventForm';
import dayjs, { Dayjs } from 'dayjs';
/**
 * todo: deal with data life
 * devices not assigned here?
 */
export default function CaptureEventForm({
  canSave,
  event: capture,
  handlePostponeSave,
  handleFormChange,
  isEditing = false
}: WorkflowFormProps<CaptureEvent2> & { isEditing?: boolean }): JSX.Element {
  const latitude = capture.capture_location.latitude;
  const [showRelease, setShowRelease] = useState(false);
  const [showMortalityCheck, setMortalityCheck] = useState<'capture' | 'release' | 'unknown'>('unknown');
  const [minReleaseDate, setMinReleaseDate] = useState(capture?.capture_timestamp);

  const { diedDuring, differentReleaseDetails } = WorkflowStrings.capture;

  const onChange = (v: Record<keyof CaptureEvent2 | keyof LocationEvent, unknown>): void => {
    const [key, value] = parseFormChangeResult<CaptureEvent2>(v);
    switch (key) {
      case 'capture_timestamp':
        setMinReleaseDate(value as Dayjs);
        break;
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
        {CreateFormField(capture, capture.fields.capture_timestamp, onChange, { value: dayjs() })}
        {CreateFormField(capture, capture.fields.capture_comment, onChange)}
      </LocationEventForm>

      {/* Capture Information*/}
      {/* {showMortalityCheck == 'unknown' || showMortalityCheck == 'capture' ? (
        <FormSection id='died-during-checkbox' header='Capture Information'>
          {CreateFormField(capture, capture.fields.capture_mortality, onChange, { label: diedDuring('capture') })}
        </FormSection>
      ) : null} */}

      {/* Release Date */}

      <FormSection id='release-date' header='Release Date'>
        {CreateFormField(capture, capture.fields.release_timestamp, onChange, { minDate: minReleaseDate })}
        {CreateFormField(capture, capture.fields.release_comment, onChange)}
      </FormSection>

      {/* Release Location -> Release Environment*/}
      {isEditing || showRelease ? (
        <LocationEventForm key='ce-loc-b' event={capture.release_location} notifyChange={onChange} />
      ) : null}

      {!isEditing ? (
        <FormSection id='died-during-checkbox-2' header='Release Information'>
          {CreateFormField(capture, capture.fields.show_release, handleShowRelease, { label: differentReleaseDetails })}
        </FormSection>
      ) : null}
      {/* Release Information */}

      {/* {showMortalityCheck == 'unknown' || showMortalityCheck == 'release' ? (
        <FormSection id='died-during-checkbox-3' header=''>
          {CreateFormField(capture, capture.fields.release_mortality, onChange, { label: diedDuring('release') })}
        </FormSection>
      ) : null} */}
    </Box>
  );
}
