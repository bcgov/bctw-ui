import { useState } from 'react';
import MalfunctionEvent from 'types/events/malfunction_event';
import { parseFormChangeResult } from 'types/form_types';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { wfFields, WorkflowFormProps } from 'types/events/event';
import LocationEventForm from './LocationEventForm';
import { FormSection } from '../common/EditModalComponents';
import { CreateFormField } from 'components/form/create_form_components';
import { Box } from '@material-ui/core';
import { LocationEvent } from 'types/events/location_event';
import Radio from 'components/form/Radio';
import { Code } from 'types/code';
import { WorkflowStrings } from 'constants/strings';
import OkayModal from 'components/modal/OkayModal';

/**
 *
 */
export default function MalfunctionEventForm({
  event,
  handleFormChange,
  handleExitEarly
}: WorkflowFormProps<MalfunctionEvent>): JSX.Element {
  const [malfunction, updateEvent] = useState<MalfunctionEvent>(event);
  const [deviceStatus, setDeviceStatus] = useState<Code>(malfunction.device_status);
  const [deviceIsActive, setDeviceActive] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useDidMountEffect(() => {
    updateEvent(event);
  }, [event]);

  const onChange = (v: Record<keyof MalfunctionEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<MalfunctionEvent>(v);
    if (key === 'device_status') {
      setDeviceStatus(value as string);
      setDeviceActive(value === 'Active');
    } else if (key === 'retrieved') {
      if (value) {
        setShowNotif(true);
      }
    }
  };

  useDidMountEffect(() => {
    event.onlySaveDeviceStatus = deviceIsActive;
    if (deviceIsActive) {
      event.shouldUnattachDevice = false;
      handleExitEarly(<p>{WorkflowStrings.malfunction.isActive}</p>);
    }
  }, [deviceIsActive]);

  if (!wfFields) {
    return <p>unable to load malfunction workflow</p>;
  }

  return FormSection('m', 'Details', [
    <Box mb={2}>
      {
        <Radio
          propName={wfFields.get('device_status').prop}
          changeHandler={onChange}
          defaultSelectedValue={'Potential Malfunction'}
          values={['Potential Malfunction', 'Active', 'Malfunction', 'Offline'].map((p) => ({
            label: p,
            value: p,
            disabled: p === 'Potential Malfunction'
          }))}
        />
      }
    </Box>,
    <LocationEventForm
      disabled={deviceIsActive}
      childNextToDate={
        deviceStatus === 'Offline'
          ? CreateFormField(
            malfunction,
            { ...wfFields.get('offline_type'), required: deviceStatus === 'Offline' },
            onChange,
            { disabled: deviceIsActive }
          )
          : deviceStatus === 'Malfunction'
            ? CreateFormField(
              malfunction,
              { ...wfFields.get('device_malfunction_type'), required: deviceStatus === 'Malfunction' },
              onChange,
              { disabled: deviceIsActive }
            )
            : null
      }
      event={malfunction.location_event}
      notifyChange={(v: Record<keyof LocationEvent, unknown>): void => handleFormChange(v)}
    />,
    <Box mt={2}>{CreateFormField(malfunction, wfFields.get('retrieved'), onChange, { disabled: deviceIsActive })}</Box>,
    <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
      {WorkflowStrings.malfunction.wasRetrieved}
    </OkayModal>
  ]);
}
