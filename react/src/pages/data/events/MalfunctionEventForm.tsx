import { useState } from 'react';
import MalfunctionEvent from 'types/events/malfunction_event';
import { parseFormChangeResult } from 'types/form_types';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { wfFields, WorkflowFormProps } from 'types/events/event';
import LocationEventForm from './LocationEventForm';
import { FormSection } from '../common/EditModalComponents';
import { CreateFormField } from 'components/form/create_form_components';
import { Box } from '@material-ui/core';
import { boxSpreadRowProps } from './EventComponents';
import { LocationEvent } from 'types/events/location_event';
import Radio from 'components/form/Radio';
import { Code } from 'types/code';

/**
 * todo: 
 * 
 */
export default function MalfunctionEventForm({ event, handleFormChange }: WorkflowFormProps<MalfunctionEvent>): JSX.Element {
  const [malfunction, updateEvent] = useState<MalfunctionEvent>(event);
  const [deviceStatus, setDeviceStatus] = useState<Code>(malfunction.device_status);

  useDidMountEffect(() => {
    updateEvent(event);
  }, [event]);

  const onChange = (v: Record<keyof MalfunctionEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<MalfunctionEvent>(v);
    if (key === 'device_status') {
      setDeviceStatus(value as string);
    }
  };

  useDidMountEffect(() => {
    if (deviceStatus === 'Active') {
      console.log('trigger exit early')
    }
  }, [deviceStatus])

  if (!wfFields) {
    return <p>unable to load malfunction workflow</p>;
  }

  return FormSection('m', 'Details', [
    <Box mb={2}>
      {
        <Radio
          propName={wfFields.get('device_status').prop}
          changeHandler={onChange}
          defaultSelectedValue={'Potential Mortality'}
          values={['Potential Mortality', 'Active', 'Malfunction', 'Offline'].map((p) => ({
            label: p,
            value: p,
            disabled: p === 'Potential Mortality'
          }))}
        />
      }
    </Box>,
    <LocationEventForm
      event={malfunction.location_event}
      notifyChange={(v: Record<keyof LocationEvent, unknown>): void => handleFormChange(v)}
    />,
    deviceStatus === 'Offline' ? (
      <>
        <Box {...boxSpreadRowProps} mt={2}>
          {CreateFormField(malfunction, wfFields.get('offline_type'), onChange)}
          {CreateFormField(malfunction, wfFields.get('offline_date'), onChange)}
        </Box>
      </>
    ) : null,

    deviceStatus === 'Malfunction' ? (
      <>
        <Box {...boxSpreadRowProps} mt={2}>
          {CreateFormField(malfunction, wfFields.get('device_malfunction_type'), onChange)}
          {CreateFormField(malfunction, wfFields.get('malfunction_date'), onChange)}
        </Box>
      </>
    ) : null
  ]);
}
