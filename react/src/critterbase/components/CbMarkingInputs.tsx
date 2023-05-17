import { Button } from '@mui/material';
import { CreateFormField, getInputFnFromType } from 'components/form/create_form_components';
import { cbInputValue } from 'critterbase/constants';
import { isCbVal } from 'critterbase/helper_functions';
import { FormSection } from 'pages/data/common/EditModalComponents';
import { useState } from 'react';
import { Critter, IMarking, markingFormFields } from 'types/animal';
import { uuid } from 'types/common_types';
import { FormChangeEvent, InboundObj, parseFormChangeResult } from 'types/form_types';
import { columnToHeader } from 'utils/common_helpers';
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
    const customProps = props?.[f.prop];
    if (['frequency', 'frequency_unit'].includes(f.prop) && !showFrequency) {
      return;
    }
    return getInputFnFromType(f.type)({
      ...f,
      value: marking?.[f.prop],
      handleChange: onChange,
      label: columnToHeader(f.prop),
      ...customProps
    });
  });

  return <div>{render}</div>;
};

type CbMarkingsProps = {
  markings?: IMarking[];
} & CbMarkingSharedProps;

export const CbMarkings = (props: CbMarkingsProps): JSX.Element => {
  const { markings } = props;
  const [markingsData, setMarkingsData] = useState<IMarking[]>(markings ?? []);
  const onChange = (v: InboundObj, idx: number): void => {
    const [key, value, label] = parseFormChangeResult<IMarking>(v);
    const updatedMarking = value ? { ...markingsData[idx], [key]: value } : { ...markingsData[idx] };
    markingsData[idx] = updatedMarking;
    setMarkingsData(markingsData);
    console.log(markingsData);
  };
  const [markingsElementArr, setMarkingsElementArr] = useState<JSX.Element[]>(
    markings?.map((m, i) => <CbMarkingInput {...props} marking={m} handleChange={onChange} index={i} />)
  );

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
