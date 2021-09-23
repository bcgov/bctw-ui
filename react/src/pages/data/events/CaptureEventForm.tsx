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

type CaptureEventProps = WorkflowFormProps & {
  event: CaptureEvent;
};

/**
 * todo: deal with data life
 * devices not assigned here?
 */
export default function CaptureEventForm({ event, handleFormChange }: CaptureEventProps): JSX.Element {
  const [capture, setCaptureEvent] = useState<CaptureEvent>(event);

  const [isTransloc, setIsTransloc] = useState(false);
  const [hasAssociation, setHasAssociation] = useState(false);

  useDidMountEffect(() => {
    setCaptureEvent(event);
  }, [event]);

  const onChange = (v: Record<keyof CaptureEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<CaptureEvent>(v);
    if (key === 'translocation') {
      setIsTransloc(!!value);
    } else if (key === 'associated_animal_id') {
      setHasAssociation(!!(value as string).length);
    }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  return (
    <>
      {FormSection('a', 'Capture Details', [
        <LocationEventForm
          childNextToDate={CreateFormField(capture, {...wfFields.get('species'), tooltip:<p>{WorkflowStrings.capture.whatSpecies}</p>}, onChange)}
          event={capture.location_event}
          notifyChange={onChangeLocationProp}
        />,
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.isRecapture}</span>}
          {CreateFormField(capture, wfFields.get('recapture'), onChange)}
        </Box>,
        <Tooltip title={WorkflowStrings.capture.translocNotif}>
          <Box {...boxSpreadRowProps} mt={1}>
            {<span>{WorkflowStrings.capture.isTransloc}</span>}
            {CreateFormField(capture, wfFields.get('translocation'), onChange)}
          </Box>
        </Tooltip>,
        <Box {...boxSpreadRowProps} mt={1}>
          {CreateFormField(capture, wfFields.get('region'), onChange, {disabled: !isTransloc})}
          {CreateFormField(capture, wfFields.get('population_unit'), onChange, {disabled: !isTransloc})}
        </Box>,
        <CaptivityStatusForm event={capture} handleFormChange={handleFormChange} />,
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.associated}</span>}
          {CreateFormField(capture, wfFields.get('associated_animal_id'), onChange)}
        </Box>,
        <Box {...boxSpreadRowProps} mt={1}>
          {<span>{WorkflowStrings.capture.associatedID}</span>}
          {CreateFormField(capture, {...wfFields.get('associated_animal_relationship'), required: hasAssociation}, onChange, {disabled: !hasAssociation})}
        </Box>,
      ])}
    </>
  );
}
