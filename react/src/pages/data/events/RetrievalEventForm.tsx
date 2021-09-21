import { useEffect, useState } from 'react';
import RetrievalEvent from 'types/events/retrieval_event';
import { FormChangeEvent, parseFormChangeResult } from 'types/form_types';
import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import { FormSection } from '../common/EditModalComponents';
import { boxSpreadRowProps } from './EventComponents';
import { EventFormStrings } from 'constants/strings';
import dayjs, { Dayjs } from 'dayjs';

type RetrievalEventProps = {
  event: RetrievalEvent;
  handleFormChange: FormChangeEvent;
};

/**
*/
export default function RetrievalEventForm({event, handleFormChange}: RetrievalEventProps): JSX.Element {
  const [retrieval, setRetrieval] = useState<RetrievalEvent>(event);

  useEffect(() => {
    setRetrieval(retrieval);
    determineMinRetrievalDate();
  }, [retrieval]);

  const [isRetrieved, setIsRetrieved] = useState(true);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [minRetrievalDate, setMinRetrievalDate] = useState<Dayjs>(retrieval.retrieval_date);

  /**
   * retrieval date minimum must be the latest of the malfunction/capture/mortality dates
   */
  const determineMinRetrievalDate = (): void => {
    const { capture_date, malfunction_date, mortality_date } = retrieval;
    const dates: Dayjs[] = [capture_date, malfunction_date, mortality_date]
      .map(d => d ? dayjs(d) : null)
      .filter(d => d)
      .sort((a, b) => a.isBefore(b) ? 1 : 0);
    if (dates.length) {
      const minDate = dates[dates.length -1];
      // eslint-disable-next-line no-console
      // console.log('min retrieval date determined', minDate);
      setMinRetrievalDate(minDate);
    }
  }

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
  if (!fields) {
    return null;
  }

  return (
    <>
      {FormSection('retrieval-device', 'Device Details', [
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, fields.retrieved, onChange)}
          {CreateFormField(retrieval, fields.retrieval_date, onChange, !isRetrieved, false, {minDate: minRetrievalDate} )}
        </Box>,
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, fields.shouldUnattachDevice, onChange, false, true)}
          {CreateFormField(retrieval, {...fields.data_life_end, required: isBeingUnattached }, onChange, !isBeingUnattached)}
        </Box>,
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, fields.device_condition, onChange)}
          {CreateFormField(retrieval, fields.device_deployment_status, onChange)}
        </Box>,
        <Box {...boxSpreadRowProps} mb={1}>
          {CreateFormField(retrieval, {...fields.activation_status, tooltip: <p><span style={{color: 'orangered'}}>Reminder: </span>{`${EventFormStrings.device.activation_warning}`}</p>}, onChange, false, true)}
        </Box>,
        CreateFormField(retrieval, fields.retrieval_comment, onChange),
      ])}
    </>
  );
}