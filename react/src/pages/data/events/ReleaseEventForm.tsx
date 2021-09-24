import { Box } from '@material-ui/core';
import Tooltip from 'components/common/Tooltip';
import { CreateFormField } from 'components/form/create_form_components';
import { WorkflowStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import { wfFields, WorkflowFormProps } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import ReleaseEvent from 'types/events/release_event';
import { parseFormChangeResult } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';
import { boxSpreadRowProps } from './EventComponents';
import LocationEventForm from './LocationEventForm';

/**
 * todo: 
*/
export default function ReleaseEventForm({event, handleFormChange }: WorkflowFormProps<ReleaseEvent>): JSX.Element {
  const [release, updateEvent] = useState<ReleaseEvent>(event);

  const [hasBabies, setHasBabies] = useState(false);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  
  useDidMountEffect(() => {
    updateEvent(event);
  }, [event]);

  const onChange = (v: Record<keyof ReleaseEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<ReleaseEvent>(v);
    if (key === 'juvenile_at_heel') {
      setHasBabies(value === 'Y');
    } else if (key === 'shouldUnattachDevice') {
      setIsBeingUnattached(!!value);
    }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  const { fields } = release;
  if (!fields || !wfFields) {
    return <p>unable to load release workflow</p>
  }

  return (
    FormSection('a', 'Release Details', [
      <LocationEventForm
        event={release.location_event}
        notifyChange={onChangeLocationProp}
      />,
      <Tooltip title={WorkflowStrings.release.shouldReviewNotif}>
        <Box mt={2}>
          <span>{WorkflowStrings.release.areUpdates}</span>
        </Box>
      </Tooltip>,
      <Box {...boxSpreadRowProps} mt={1}>
        {CreateFormField(release, wfFields.get('ear_tag_left_id'), onChange)}
        {CreateFormField(release, wfFields.get('ear_tag_left_colour'), onChange)}
      </Box>,
      <Box {...boxSpreadRowProps} mt={1}>
        {CreateFormField(release, wfFields.get('ear_tag_right_id'), onChange)}
        {CreateFormField(release, wfFields.get('ear_tag_right_colour'), onChange)}
      </Box>,
      <Box {...boxSpreadRowProps} mt={1}>
        {CreateFormField(release, wfFields.get('juvenile_at_heel'), onChange)}
        {CreateFormField(release, wfFields.get('juvenile_at_heel_count'), onChange, {disabled: !hasBabies})}
      </Box>,
      <Box {...boxSpreadRowProps} mt={1}>
        {CreateFormField(release, wfFields.get('animal_colouration'), onChange)}
        {CreateFormField(release, wfFields.get('life_stage'), onChange)}
      </Box>,
      <Box {...boxSpreadRowProps} mt={2}>
        {CreateFormField(release, {...fields.shouldUnattachDevice, tooltip: <p>todo:</p> }, onChange)}
        {CreateFormField(release, {...fields.data_life_start, required: isBeingUnattached }, onChange, {disabled: !isBeingUnattached})}
      </Box>,
    ])
  );
}
