import { useState } from 'react';
import MalfunctionEvent, { MalfunctionDeviceStatus } from 'types/events/malfunction_event';
import { parseFormChangeResult } from 'types/form_types';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { WorkflowFormProps } from 'types/events/event';
import LocationEventForm from './LocationEventForm';
import { FormSection } from '../common/EditModalComponents';
import { CreateFormField } from 'components/form/create_form_components';
import { Box } from '@mui/material';
import { LocationEvent } from 'types/events/location_event';
import Radio from 'components/form/Radio';
import { Code } from 'types/code';
import { WorkflowStrings } from 'constants/strings';
import OkayModal from 'components/modal/OkayModal';
import DateTimeInput from 'components/form/DateTimeInput';
import { boxSpreadRowProps } from './EventComponents';
import { Tooltip } from 'components/common';
import { wfFields } from 'types/events/form_fields';

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
    } else if (key === 'retrieved_ind') {
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

  // used to generate the radio options for device status
  const statuses: MalfunctionDeviceStatus[] = ['Potential Malfunction', 'Active', 'Malfunction', 'Offline'];

  const getTooltip = (status: MalfunctionDeviceStatus): string => {
    switch (status) {
      case 'Offline':
        return WorkflowStrings.malfunction.statusOffline;
      case 'Malfunction':
        return WorkflowStrings.malfunction.statusMalfunction;
      case 'Active':
        return WorkflowStrings.malfunction.statusActive;
      default:
        return null;
    }
  };

  return (
    <>
      <FormSection id='mf-wf' header='Select a device status:'>
        {[
          <Box key='rad-status' mb={2}>
            {
              <Radio
                propName={wfFields.get('device_status').prop}
                changeHandler={onChange}
                defaultSelectedValue={'Potential Malfunction'}
                values={statuses.map((p) => ({
                  label: p,
                  value: p,
                  disabled: p === 'Potential Malfunction',
                  tooltip: getTooltip(p)
                }))}
              />
            }
          </Box>,
          <LocationEventForm
            key='mf-loc'
            disabled={deviceIsActive || event.device_status === statuses[0]}
            event={malfunction.location_event}
            notifyChange={(v: Record<keyof LocationEvent, unknown>): void => handleFormChange(v)}
          />,
          deviceStatus == 'Offline' ? (
            <Box key='mf-off' mt={2} {...boxSpreadRowProps}>
              {CreateFormField(
                malfunction,
                { ...wfFields.get('offline_type'), required: deviceStatus === 'Offline' },
                onChange,
                { disabled: deviceIsActive }
              )}
              {/* <Tooltip title={WorkflowStrings.malfunction.lastTransmission}>
                <DateTimeInput
                  propName={'offline_date'}
                  label={'Offline Date'}
                  defaultValue={event.location_event.date}
                  changeHandler={onChange}
                  disabled={deviceIsActive}
                  required={true}
                />
              </Tooltip> */}
            </Box>
          ) : deviceStatus === 'Malfunction' ? (
            <Box key='mf-mf' mt={2} {...boxSpreadRowProps}>
              {CreateFormField(
                malfunction,
                { ...wfFields.get('device_malfunction_type'), required: deviceStatus === 'Malfunction' },
                onChange,
                { disabled: deviceIsActive }
              )}
              {/* <Tooltip title={WorkflowStrings.malfunction.lastTransmission}>
                <DateTimeInput
                  propName={'malfunction_date'}
                  label={'Malfunction Date'}
                  defaultValue={event.location_event.date}
                  changeHandler={onChange}
                  disabled={deviceIsActive}
                />
              </Tooltip> */}
            </Box>
          ) : (
            <span key='empty'></span>
          ),
          <Box key='mf-act' mt={2}>
            {CreateFormField(malfunction, wfFields.get('retrieved_ind'), onChange, { disabled: deviceIsActive })}
          </Box>
        ]}
      </FormSection>
      <OkayModal open={showNotif} handleClose={(): void => setShowNotif(false)}>
        {WorkflowStrings.malfunction.wasRetrieved}
      </OkayModal>
    </>
  );
}
