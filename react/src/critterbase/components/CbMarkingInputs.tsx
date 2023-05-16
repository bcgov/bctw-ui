import { Button } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { isCbVal } from 'critterbase/helper_functions';
import { useState } from 'react';
import { Critter, IMarking, markingFormFields } from 'types/animal';
import { uuid } from 'types/common_types';
import { FormChangeEvent, InboundObj } from 'types/form_types';

interface CbMarkingInputsProps {
  taxon_id: uuid;
  markings: IMarking[];
  handleChange: FormChangeEvent;
}

export const CbMarkingInputs = ({ taxon_id, markings: m, handleChange }: CbMarkingInputsProps): JSX.Element => {
  const { markingFields, frequencyFields } = markingFormFields;
  const [showFrequency, setShowFrequency] = useState(false);
  const props = {
    attached_timestamp: {
      label: 'Attached Date'
    },
    removed_timestamp: {
      label: 'Removed Date'
    },
    body_location: {
      query: `taxon_id=${taxon_id}`
    }
  };

  const onChange = (v: InboundObj): void => {
    if (v?.marking_type) {
      const isEarTag = isCbVal(v.marking_type, 'Ear Tag');
      setShowFrequency(isEarTag);
    }
    handleChange(v);
  };
  const render = markingFields.map((f) => {
    if (['frequency', 'frequency_unit'].includes(f.prop) && !showFrequency) {
      return;
    }
    return CreateFormField(new Critter(), f, onChange, props[f.prop]);
  });
  return (
    <div>
      {render}
      {/* <Button>click me</Button> */}
    </div>
  );
};
