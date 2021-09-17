import { useState } from 'react';
import RetrievalEvent from 'types/events/retrieval_event';
import { FormChangeEvent, parseFormChangeResult } from 'types/form_types';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import { FormSection } from '../common/EditModalComponents';
import DataLifeInputForm from 'components/form/DataLifeInputForm';

type RetrievalEventProps = {
  event: RetrievalEvent;
  handleFormChange: FormChangeEvent;
};

/**
 * 
*/
export default function RetrievalEventForm({event, handleFormChange}: RetrievalEventProps): JSX.Element {
  const [retrieval, setRetrieval] = useState<RetrievalEvent>(event);

  useDidMountEffect(() => {
    console.log('new retrieval event', event)
    setRetrieval(retrieval);
  }, [retrieval]);

  const [isRetrieved, setIsRetrieved] = useState(true);

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof RetrievalEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<RetrievalEvent>(v);
    // const key = Object.keys(v)[0] as keyof RetrievalEvent;
    // const value = Object.values(v)[0];
    // retrieved checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved') {
      setIsRetrieved(value as boolean);
    }
  };

  const { fields } = retrieval;
  if (!fields) {
    return null;
  }

  return (
    <>
      {FormSection('retrieval-device', 'Device Details', [
        <Box>
          {CreateFormField(retrieval, fields.retrieved, onChange)}
          {CreateFormField(retrieval, fields.retrieval_date, onChange, !isRetrieved)}
        </Box>,
        CreateFormField(retrieval, fields.shouldUnattachDevice, onChange, false, true),
        CreateFormField(retrieval, fields.device_condition, onChange),
        CreateFormField(retrieval, fields.device_deployment_status, onChange),
        CreateFormField(retrieval, fields.activation_status, onChange, false, true),
        CreateFormField(retrieval, fields.retrieval_comment, onChange),
        // <DataLifeInputForm
        //   dli={retrieval.getDatalife()}
        //   // only allow data life end dates changes if the device is being removed
        //   enableEditEnd={requiredDLProps.length !== 0}
        //   enableEditStart={false}
        //   onChange={handleFormChange}
        //   propsRequired={requiredDLProps}
        //   message={<div style={{color: 'darkorange', marginBottom: '5px'}}> Note: data life can only be edited if the device is being removed</div>} // todo:
        //   displayInRows={true}
        // />,
      ])}
    </>
  );
}