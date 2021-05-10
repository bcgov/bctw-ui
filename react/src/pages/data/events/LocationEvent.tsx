import { useState } from 'react';
import { MakeEditField } from 'components/form/create_form_components';
// import { generateFieldTypes, generateLocationEventProps, LocationEvent, LocationEventType } from 'types/event';
import { LocationEvent, LocationEventType } from 'types/event';
import DateInput from 'components/form/Date';
import Checkbox from 'components/form/Checkbox';
import TextField from 'components/form/Input';
import { columnToHeader } from 'utils/common';
import { InputChangeHandler } from 'components/component_interfaces';
import { getInputTypesOfT } from 'components/form/form_helpers';

type LocationEventProps = {
  event: LocationEvent;
  handleChange: InputChangeHandler;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const { event, handleChange } = props;
  const [useUTM, setUseUTM] = useState<boolean>(true);

  const formFields = getInputTypesOfT(event, Object.keys(event), []);

  // create the form inputs
  const latlongFields = formFields.filter((f) => f.key.includes('tude'));
  const utmFields = formFields.filter((f) => f.key.includes('utm'));
  const dateField = formFields.find((f) => f.key.includes('date'));
  const commentField = formFields.find((f) => f.key.includes('comment'));

  /* 
    before calling the parent change event handler, 
   append the location event type to the base type property that was changed
   ex. latitude -> mortality_latitude
  */
  const onChange = (e): void => {
    const n = {};
    for (const [key, value] of Object.entries(e)) {
      n[`${event.locationType}_${key}`] = value;
    }
    handleChange(n);
  };

  return (
    <>
      <DateInput
        propName={dateField.key}
        label={columnToHeader(dateField.key)}
        defaultValue={dateField.value as Date}
        changeHandler={onChange}
      />
      <div>
        {/* show the UTM or Lat/Long fields depending on this checkbox state */}
        <Checkbox changeHandler={(): void => setUseUTM((o) => !o)} initialValue={useUTM} label={'Use UTM'} />
      </div>
      <div style={{ marginTop: '20px', height: '120px' }}>
        {useUTM
          ? utmFields.map((f, idx) =>
            MakeEditField({
              formType: f,
              required: true,
              handleChange: onChange,
              label: event.formatPropAsHeader(f.key),
              span: idx < 2
            })
          )
          : latlongFields.map((f) =>
            MakeEditField({ formType: f, required: true, handleChange: onChange, span: true })
          )}
      </div>
      <div>
        <TextField
          style={{ width: '100%' }}
          multiline={true}
          rows={2}
          outline={true}
          key={commentField.key}
          propName={commentField.key}
          defaultValue={commentField.value as string}
          label={columnToHeader(commentField.key)}
          changeHandler={onChange}
        />
      </div>
    </>
  );
}
