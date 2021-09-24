import { useEffect, useState } from 'react';
import RetrievalEvent from 'types/events/retrieval_event';
import { parseFormChangeResult } from 'types/form_types';
import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import { FormSection } from '../common/EditModalComponents';
import { boxSpreadRowProps } from './EventComponents';
import { Dayjs } from 'dayjs';
import { WorkflowStrings } from 'constants/strings';
import { wfFields, WorkflowFormProps } from 'types/events/event';

/**
 *
*/
export default function RetrievalEventForm({event, handleFormChange}: WorkflowFormProps<RetrievalEvent>): JSX.Element {
  const [retrieval, setRetrieval] = useState<RetrievalEvent>(event);

  useEffect(() => {
    setRetrieval(retrieval);
    setMinRetrievalDate(retrieval.determineMinRetrievalDate());
  }, [retrieval]);

  const [isRetrieved, setIsRetrieved] = useState(true);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [minRetrievalDate, setMinRetrievalDate] = useState<Dayjs>(retrieval.retrieval_date);


  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof RetrievalEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<RetrievalEvent>(v);
    // retrieved checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved') {
      setIsRetrieved(value as boolean);
    } else if (key === 'shouldUnattachDevice') {
      // make attachment end state required if user is removing device
      setIsBeingUnattached(value as boolean);
    }
  };

  const { fields } = retrieval;
  if (!fields || !wfFields) {
    return <p>unable to load retrieval workflow</p>;
  }

  return (
    <>
      {FormSection('retrieval-device', 'Device Details', [
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, wfFields.get('retrieved'), onChange)}
          {CreateFormField(retrieval, wfFields.get('retrieval_date'), onChange, {disabled: !isRetrieved, minDate: minRetrievalDate}, false)}
        </Box>,
        <Box {...boxSpreadRowProps} mb={2}>
          {CreateFormField(retrieval, fields.shouldUnattachDevice, onChange, {}, true)}
          {CreateFormField(retrieval, {...fields.data_life_end, required: isBeingUnattached }, onChange, {disabled: !isBeingUnattached})}
        </Box>,
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, wfFields.get('device_condition'), onChange)}
          {CreateFormField(retrieval, wfFields.get('device_deployment_status'), onChange)}
        </Box>,
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, {...wfFields.get('activation_status'), tooltip: <p><span style={{color: 'orangered'}}>Reminder: </span>{`${WorkflowStrings.device.activation_warning}`}</p>}, onChange, {}, true)}
        </Box>,
        CreateFormField(retrieval, wfFields.get('retrieval_comment'), onChange),
      ])}
    </>
  );
}