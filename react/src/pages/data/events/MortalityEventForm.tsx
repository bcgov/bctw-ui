import { IUpsertPayload } from 'api/api_interfaces';
import { FormFromFormfield } from 'components/form/create_form_components';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';

import { FormPart } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import EditDataLifeModal from 'components/form/EditDataLifeModal';
import { eCritterPermission } from 'types/permission';
import Button from 'components/form/Button';
import { Box } from '@material-ui/core';
import { formatTime } from 'utils/time';

type MortEventProps = {
  event: MortalityEvent;
  handleSave: (event: MortalityEvent) => void;
};

/**
 * todo: unassign device?
 * missing pcod fields?
 * not savable when on display
 * errors
 */
export default function MortalityEventForm({ event, handleSave }: MortEventProps): JSX.Element {
  const [errors, setErrors] = useState({});
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  const [showDLForm, setShowDLForm] = useState(false);
  const [locationEvent, setLocationEvent] = useState<LocationEvent>(
    new LocationEvent('mortality', dayjs()) // fixme: alert.valid_from
  );

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  const [isRetrieved, setIsRetrieved] = useState<boolean>(false);

  /**
   * break the MortalityEvent into collar/critter specific properties
   * before passing to the parent save handler
   * @param payload the save payload passed from the {EditModal}
   */
  const onSave = async (payload: IUpsertPayload<MortalityEvent>): Promise<void> => {
    const { body } = payload;
    body.location_event = locationEvent;
    await handleSave(body);
  };
  useDidMountEffect(() => {
    // trigger re-render of retrieved_date field
    // todo: delete this field on-save if disabled?
  }, [isRetrieved]);

  const onChange = (v) => {
    // console.log(v);
  };

  const { fields } = mortality;
  if (!fields) {
    return null;
  }

  return (
    <>
      {FormPart('Assignment Details', [
        <Box display='flex' justifyContent='space-between'>
          <span>Data Life Start: {dayjs(mortality.data_life_start).format(formatTime)}</span>
          <Button onClick={(): void => setShowDLForm((o) => !o)}>Edit Data Life</Button>
        </Box>,
        FormFromFormfield(mortality, fields.shouldUnattachDevice, onChange),
        // label rly long
        <Box display='flex' justifyContent='space-between' pt={2}>
          <span>{fields.mortality_investigation.long_label}</span>
          {FormFromFormfield(mortality, fields.mortality_investigation, onChange)}
        </Box>,
        <div></div>, //todo: divify form component function
        FormFromFormfield(mortality, fields.mortality_record, onChange)
      ])}
      {FormPart('Update Device Details', [
        FormFromFormfield(mortality, fields.retrieved, onChange),
        FormFromFormfield(mortality, fields.retrieval_date, onChange, !isRetrieved),
        FormFromFormfield(mortality, fields.activation_status, onChange)
      ])}
      {FormPart('Update Animal Details', [
        FormFromFormfield(mortality, fields.animal_status, onChange),
        FormFromFormfield(mortality, fields.proximate_cause_of_death, onChange)
      ])}
      {FormPart('Mortality Event Details', [<LocationEventForm event={locationEvent} handleChange={onChange} />])}
      {/* fixme: ...existing propsa don't support disabling fields*/}
      <EditDataLifeModal
        attachment={mortality.getCollarHistory()}
        handleClose={(): void => setShowDLForm(false)}
        open={showDLForm}
        // fixme:
        permission_type={eCritterPermission.editor}
      />
    </>
  );
}
