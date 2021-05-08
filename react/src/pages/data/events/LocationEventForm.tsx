import React, { useState } from 'react';
import { MakeEditField } from 'components/form/create_form_components';
import { LocationEvent } from 'types/location_event';
import DateInput from 'components/form/Date';
import TextField from 'components/form/Input';
import { columnToHeader } from 'utils/common';
import { InputChangeHandler } from 'components/component_interfaces';
import { getInputTypesOfT } from 'components/form/form_helpers';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

type LocationEventProps = {
  event: LocationEvent;
  handleChange: InputChangeHandler;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const { event, handleChange } = props;
  const [useUTM, setUseUTM] = useState<string>('utm');

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
    // const n = {};
    // for (const [key, value] of Object.entries(e)) {
    //   n[`${event.locationType}_${key}`] = value;
    // }
    handleChange(e);
  };

  return (
    <>
      <DateInput
        propName={dateField.key}
        label={event.formatPropAsHeader(dateField.key)}
        defaultValue={dateField.value as Date}
        changeHandler={onChange}
      />
      {/* show the UTM or Lat/Long fields depending on this checkbox state */}
      <RadioGroup row aria-label='position' name='position' value={useUTM} onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setUseUTM(event.target.value as string)}>
        <FormControlLabel
          value={'utm'}
          control={<Radio color='primary' />}
          label='Use UTM'
          labelPlacement='start'
        />
        <FormControlLabel
          value={'coords'}
          control={<Radio color='primary' />}
          label='Use Coords'
          labelPlacement='start'
        />
      </RadioGroup>
      <div style={{ marginTop: '20px', height: '120px' }}>
        {useUTM === 'utm'
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
            MakeEditField({ formType: f, required: true, handleChange: onChange, span: true, label: event.formatPropAsHeader(f.key) })
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
