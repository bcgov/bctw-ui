import { useState } from 'react';
import { MakeEditField } from 'components/form/create_form_components';
import { generateFieldTypes, generateLocationEventProps, LocationEventType } from 'types/event';
import DateInput from 'components/form/Date';
import Checkbox from 'components/form/Checkbox';
import TextField from 'components/form/Input';
import { columnToHeader } from 'utils/common';
import { InputChangeHandler } from 'components/component_interfaces';

type LocationEventProps = {
  eventType: LocationEventType;
  handleChange: InputChangeHandler;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const { eventType, handleChange } = props;
  const [useUTM, setUseUTM] = useState<boolean>(true);

  // create the form inputs, depending on the event type passed in as prop
  const fieldTypes = generateFieldTypes(generateLocationEventProps(eventType));
  const latlongFields = fieldTypes.filter((f) => f.key.includes('_l'));
  const utmFields = fieldTypes.filter((f) => f.key.includes('_utm'));
  const dateField = fieldTypes.find((f) => f.key.includes('_date'));
  const commentField = fieldTypes.find((f) => f.key.includes('_comment'));

  return (
    <>
      <DateInput
        propName={dateField.key}
        label={columnToHeader(dateField.key)}
        defaultValue={dateField.value as Date}
        changeHandler={handleChange}
      />
      <div>
        {/* show the UTM or Lat/Long fields depending on this checkbox state */}
        <Checkbox changeHandler={(): void => setUseUTM((o) => !o)} initialValue={useUTM} label={'Use UTM'} />
      </div>
      <div style={{marginTop: '20px', height: '120px'}}>
        {useUTM
          ? utmFields.map((f, idx) => MakeEditField({ formType: f, required: true, handleChange, span: idx < 2 }))
          : latlongFields.map((f) => MakeEditField({ formType: f, required: true, handleChange, span: true }))}
      </div>
      <div>
        <TextField
          style={{width: '100%'}}
          multiline={true}
          rows={2}
          outline={true}
          key={commentField.key}
          propName={commentField.key}
          defaultValue={commentField.value as string}
          label={columnToHeader(commentField.key)}
          changeHandler={handleChange}
        />
      </div>
    </>
  );
}