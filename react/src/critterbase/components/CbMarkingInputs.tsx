import { Button } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { cbInputValue } from 'critterbase/constants';
import { isCbVal } from 'critterbase/helper_functions';
import { FormSection } from 'pages/data/common/EditModalComponents';
import { useState } from 'react';
import { Critter, IMarking, markingFormFields } from 'types/animal';
import { uuid } from 'types/common_types';
import { FormChangeEvent, InboundObj, parseFormChangeResult } from 'types/form_types';
type CbMarkingSharedProps = {
  taxon_id: uuid;
};

type CbMarkingInputProps = {
  marking?: IMarking;
  handleChange: (v: InboundObj, idx?: number) => void;
  index?: number;
} & CbMarkingSharedProps;

export const CbMarkingInput = ({ taxon_id, marking, handleChange, index = 0 }: CbMarkingInputProps): JSX.Element => {
  const { markingFields } = markingFormFields;
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
      const isPitTag = isCbVal(v.marking_type, cbInputValue.pitTag);
      setShowFrequency(isPitTag);
    }
    handleChange(v, index);
  };
  const render = markingFields.map((f, i) => {
    if (['frequency', 'frequency_unit'].includes(f.prop) && !showFrequency) {
      return;
    }
    return CreateFormField(new Critter(), f, onChange, props[f.prop]);
  });
  return (
    <div>
      <p>index{index}</p>
      {render}
    </div>
  );
};

type CbMarkingsProps = {
  markings?: IMarking[];
} & CbMarkingSharedProps;

export const CbMarkings = (props: CbMarkingsProps): JSX.Element => {
  const { markings } = props;
  const [markingsElementArr, setMarkingsElementArr] = useState<JSX.Element[]>([]);
  const [markingsData, setMarkingsData] = useState<IMarking[]>(markings ?? []);

  const onChange = (v: InboundObj, idx: number): void => {
    const [key, value, label] = parseFormChangeResult<IMarking>(v);
    console.log(key, value, label);

    // const markingMutate = { ...markingsData[idx] };
  };

  const handleAddMarking = (): void => {
    setMarkingsElementArr((old) => [...old, <CbMarkingInput {...props} handleChange={onChange} index={old.length} />]);
  };

  return (
    <div>
      {markingsElementArr.map((m, i) => (
        <FormSection id={`marking-${i}`} header={`Marking ${i + 1}`} key={`marking-${i}-key`}>
          {m}
        </FormSection>
      ))}
      <Button onClick={handleAddMarking}>add marking</Button>
    </div>
  );
};
