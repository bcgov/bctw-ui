import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import OkayModal from 'components/modal/OkayModal';
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
export default function ReleaseEventForm({ event, handleFormChange }: WorkflowFormProps<ReleaseEvent>): JSX.Element {
  const [release, updateEvent] = useState<ReleaseEvent>(event);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useDidMountEffect(() => {
    updateEvent(event);
  }, [event]);

  const onChange = (v: Record<keyof ReleaseEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<ReleaseEvent>(v);
    if (key === 'shouldUnattachDevice') {
      setIsBeingUnattached(!!value);
      if (value) {
        setShowNotif(true);
      }
    }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  const { fields } = release;
  if (!fields || !wfFields) {
    return <p>unable to load release workflow</p>;
  }

  return FormSection('release-wf', 'Release Details', [
    <LocationEventForm event={release.location_event} notifyChange={onChangeLocationProp} />,
    <Box {...boxSpreadRowProps} mt={2}>
      {CreateFormField(release, { ...fields.shouldUnattachDevice, tooltip: <p>todo:</p> }, onChange)}
      {CreateFormField(release, { ...fields.data_life_start, required: isBeingUnattached }, onChange, {
        disabled: !isBeingUnattached
      })}
    </Box>,
    <>
      {release.translocation && release.animal_status === 'In Translocation' ? (
        <Box {...boxSpreadRowProps} mt={2}>
          <h4>Update translocation details:</h4>
          {CreateFormField(release, {...wfFields.get('region'), required: true}, onChange)}
          {CreateFormField(release, {...wfFields.get('population_unit'), required: true}, onChange)}
        </Box>
      ) : null}
    </>,
    <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
      {WorkflowStrings.release.removeDeviceAction(event.device_id, event.animal_id, event.wlh_id)}
    </OkayModal>
  ]);
}
