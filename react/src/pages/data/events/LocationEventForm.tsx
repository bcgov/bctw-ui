import React, { useState } from 'react';
import { LocationEvent } from 'types/location_event';
import DateInput from 'components/form/Date';
import TextField from 'components/form/TextInput';
import { InputChangeHandler } from 'components/component_interfaces';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { WorkflowStrings } from 'constants/strings';
import NumberInput from 'components/form/NumberInput';
import { mustBeNegativeNumber, mustBeXDigits } from 'components/form/form_validators';

type LocationEventProps = {
  event: LocationEvent;
  handleChange: InputChangeHandler;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const { event, handleChange } = props;
  const [useUTM, setUseUTM] = useState<string>('utm');

  // create the form inputs
  const longField = event.formFields.find((f) => f.prop === 'longitude');
  const latField = event.formFields.find((f) => f.prop === 'latitude');
  const utmFields = event.formFields.filter((f) => f.prop.includes('utm'));
  const dateField = event.formFields.find((f) => f.prop === 'date');
  const commentField = event.formFields.find((f) => f.prop === 'comment');

  const changeCoordinateType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value;
    setUseUTM(val);
  }

  const baseInputProps = { changeHandler: handleChange, required: true };
  return (
    <>
      <DateInput
        propName={dateField.prop}
        label={event.formatPropAsHeader(dateField.prop)}
        defaultValue={event[dateField.prop] as Date}
        {...baseInputProps}
      />
      {/* show the UTM or Lat/Long fields depending on this checkbox state */}
      <RadioGroup
        row
        aria-label='position'
        name='position'
        value={useUTM}
        onChange={changeCoordinateType}>
        <FormControlLabel
          value={'utm'}
          control={<Radio color='primary' />}
          label={WorkflowStrings.locationEventCoordTypeUTM}
          labelPlacement='start'
        />
        <FormControlLabel
          value={'coords'}
          control={<Radio color='primary' />}
          label={WorkflowStrings.locationEventCoordTypeLat}
          labelPlacement='start'
        />
      </RadioGroup>
      <div style={{ marginTop: '20px', height: '120px' }}>
        {useUTM === 'utm' ? (
          utmFields.map((f) => {
            const numberProps = { ...baseInputProps, label: event.formatPropAsHeader(f.prop), propName: f.prop};
            if (f.prop === 'utm_easting') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 6);
            } else if (f.prop === 'utm_northing') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 7);
            }
            return f.prop === 'utm_zone' ? (
              <div>
                <NumberInput {...numberProps} />
              </div>
            ) : (
              <span className={'edit-form-field-span'}>
                <NumberInput {...numberProps} />
              </span>
            );
          })
        ) : (
          <>
            <NumberInput propName={latField.prop } {...baseInputProps} label={event.formatPropAsHeader(latField.prop )} />
            <NumberInput
              propName={longField.prop }
              {...baseInputProps}
              label={event.formatPropAsHeader(longField.prop )}
              validate={mustBeNegativeNumber}
            />
          </>
        )}
      </div>
      <div>
        <TextField
          style={{ width: '100%' }}
          multiline={true}
          rows={2}
          key={commentField.prop }
          propName={commentField.prop }
          defaultValue={event[commentField.prop] as string}
          label={event.formatPropAsHeader(commentField.prop)}
          changeHandler={handleChange}
        />
      </div>
    </>
  );
}
