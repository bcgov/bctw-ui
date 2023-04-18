import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import OkayModal from 'components/modal/OkayModal';
import { releaseUnattachWarning } from 'constants/formatted_string_components';
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

  return (
    <>
      <FormSection id='release-wf' header='Release Details'>
        {[
          <LocationEventForm key='rl-loc' event={release.location_event} notifyChange={onChangeLocationProp} />,
          <Box key='bx-dev' {...boxSpreadRowProps} mt={2}>
            {CreateFormField(release, { ...fields.shouldUnattachDevice }, onChange)}
            {/* {CreateFormField(release, { ...fields.data_life_start, required: isBeingUnattached }, onChange, { disabled: !isBeingUnattached })} */}
          </Box>
          //TODO critterbase doesnt support translocation yet
          // release.translocation_ind && release.critter_status === 'In Translocation' ? (
          //   <Box key='bx-trsloc' {...boxSpreadRowProps} mt={2}>
          //     <h4>Update translocation details:</h4>
          //     {CreateFormField(release, { ...wfFields.get('region'), required: true }, onChange)}
          //     {CreateFormField(release, { ...wfFields.get('population_unit'), required: true }, onChange)}
          //   </Box>
          // ) : (
          //   <span key='empty'></span>
          // )
        ]}
      </FormSection>
      <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
        {releaseUnattachWarning(event.device_id, event.animal_id, event.wlh_id)}
      </OkayModal>
    </>
  );
}
