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
import { boxProps } from './EventComponents';

type MortEventProps = {
  event: MortalityEvent;
  handleFormChange: (v: Record<string, unknown>) => void;
};

/**
 * todo: saving
   * break the event into collar/critter/attachment? specific properties
 * where to retrieve critter permission? (used for data life)
 */
export default function MortalityEventForm({ event, handleFormChange}: MortEventProps): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  const [showDLForm, setShowDLForm] = useState(false);

  // fixme: should default to alert.valid_from
  // instiantiate when the event is created instead of here?
  const [locationEvent] = useState<LocationEvent>(
    new LocationEvent('mortality', dayjs()) 
  );

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  // business logic workflow state
  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredation, setIsPredation] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(false);

  // workflow logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    handleFormChange(v)
    const key = (Object.keys(v)[0]) as keyof MortalityEvent;
    const value = Object.values(v)[0];
    if (key === 'retrieved') {
      setIsRetrieved(value as boolean);
    }
    if (key === 'proximate_cause_of_death') {
      // value could be undefined ex. when a code is not selected
      if ((value as string)?.toLowerCase()?.includes('pred')) {
        setIsPredation(true);
      }
    }
    if (key === 'predator_known') {
      setIsPredatorKnown(value as boolean);
    }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v)
  }

  const { fields } = mortality;
  if (!fields) {
    return null;
  }

  return (
    <>
      {/*  */}
      {FormPart('Assignment Details', [
        <Box {...boxProps}>
          <span>Data Life Start: {dayjs(mortality.data_life_start).format(formatTime)}</span>
          <Button onClick={(): void => setShowDLForm((o) => !o)}>Edit Data Life</Button>
        </Box>,
        <Box {...boxProps} pt={2}>
          <span>{fields.mortality_investigation.long_label}</span>
          {FormFromFormfield(mortality, fields.mortality_investigation, onChange)}
        </Box>,
        FormFromFormfield(mortality, fields.mortality_record, onChange, false, true)
      ])}
      {/* device status fields */}
      {FormPart('Update Device Details', [
        FormFromFormfield(mortality, fields.shouldUnattachDevice, onChange, false, true),
        FormFromFormfield(mortality, fields.activation_status, onChange, false, true),
        <Box {...boxProps}>
          {FormFromFormfield(mortality, fields.retrieved, onChange)}
          {FormFromFormfield(mortality, fields.retrieval_date, onChange, !isRetrieved)}
        </Box>,
        FormFromFormfield(mortality, fields.device_status, onChange),
        FormFromFormfield(mortality, fields.device_condition, onChange)
      ])}
      {/* critter status fields */}
      {FormPart('Update Animal Details', [
        FormFromFormfield(mortality, fields.animal_status, onChange, false, true),
        <Box {...boxProps} pt={2}>
          {FormFromFormfield(mortality, fields.proximate_cause_of_death, onChange)} 
          {FormFromFormfield(mortality, fields.predator_known, onChange, !isPredation)}
          {FormFromFormfield(mortality, fields.predator_species, onChange, !isPredatorKnown)} 
        </Box>,
      ])}
      {/* location fields */}
      {FormPart('Mortality Event Details', [<LocationEventForm event={locationEvent} notifyChange={onChangeLocationProp} />])}
      {/* fixme: ...existing DL modal don't support disabling fields*/}
      <EditDataLifeModal
        attachment={mortality.getCollarHistory()}
        handleClose={(): void => setShowDLForm(false)}
        open={showDLForm}
        // fixme: where to get permission
        permission_type={eCritterPermission.editor}
      />
    </>
  );
}
