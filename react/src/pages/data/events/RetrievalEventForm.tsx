import { useEffect, useState } from 'react';
import RetrievalEvent from 'types/events/retrieval_event';
import { parseFormChangeResult } from 'types/form_types';
import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { FormSection } from '../common/EditModalComponents';
import { boxSpreadRowProps } from './EventComponents';
import { Dayjs } from 'dayjs';
import { WorkflowStrings } from 'constants/strings';
import { wfFields, WorkflowFormProps } from 'types/events/event';

/**
 *
 */
export default function RetrievalEventForm({
  event,
  handleFormChange
}: WorkflowFormProps<RetrievalEvent>): JSX.Element {
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
    // retrieved_ind checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved_ind') {
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
    <FormSection id='retrieval-device' header='Device Details'>
      {[
        <Box key='bx-ret' {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, wfFields.get('retrieved_ind'), onChange)}
          {CreateFormField(
            retrieval,
            wfFields.get('retrieval_date'),
            onChange,
            { disabled: !isRetrieved, minDate: minRetrievalDate },
            false
          )}
        </Box>,
        <Box key='bx-dev' {...boxSpreadRowProps}>
          {CreateFormField(retrieval, fields.shouldUnattachDevice, onChange, {}, true)}
          {CreateFormField(retrieval, fields.data_life_end, onChange, {
            disabled: !isBeingUnattached,
            required: isBeingUnattached
          })}
        </Box>,
        <Box key='bx-cdn' {...boxSpreadRowProps} mt={2} mb={1}>
          {CreateFormField(retrieval, wfFields.get('device_condition'), onChange)}
          {CreateFormField(retrieval, wfFields.get('device_deployment_status'), onChange)}
        </Box>,
        <Box key='bx-status' {...boxSpreadRowProps} mb={1}>
          {CreateFormField(
            retrieval,
            {
              ...wfFields.get('activation_status_ind'),
              tooltip: (
                <p>
                  <span style={{ color: 'orangered' }}>Reminder: </span>
                  {`${WorkflowStrings.device.activation_warning}`}
                </p>
              )
            },
            onChange,
            {},
            true
          )}
        </Box>,
        CreateFormField(retrieval, wfFields.get('retrieval_comment'), onChange)
      ]}
    </FormSection>
  );
}
