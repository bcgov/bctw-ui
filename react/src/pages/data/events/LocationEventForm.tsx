import React, { useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import TextField from 'components/form/TextInput';
import { InputChangeHandler } from 'components/component_interfaces';
import { Box, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { WorkflowStrings } from 'constants/strings';
import NumberInput from 'components/form/NumberInput';
import { mustBeNegativeNumber, mustBeXDigits } from 'components/form/form_validators';
import { FormFieldObject } from 'types/form_types';
import DateTimeInput from 'components/form/DateTimeInput';

type LocationEventProps = {
  event: LocationEvent;
  handleChange: InputChangeHandler;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const { event, handleChange } = props;
  const [useUTM, setUseUTM] = useState<string>('utm');

  // create the form inputs
  const fields = event.fields;
  const latField = fields.latlon[0];
  const longField = fields.latlon[1];
  const utmFields = fields.utm as FormFieldObject<LocationEvent>[];
  const dateField = fields.date as FormFieldObject<LocationEvent>;
  const commentField = fields.comment as FormFieldObject<LocationEvent>;

  const changeCoordinateType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value;
    setUseUTM(val);
  };

  const changeDT = (v): void => {
    console.log(v);
  };

  const baseInputProps = { changeHandler: handleChange, required: true };
  return (
    <>
      <DateTimeInput
        propName={dateField.prop}
        label={event.formatPropAsHeader('date')}
        defaultValue={event.date}
        changeHandler={changeDT}
      />
      {/* show the UTM or Lat/Long fields depending on this checkbox state */}
      <RadioGroup row aria-label='position' name='position' value={useUTM} onChange={changeCoordinateType}>
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
      <Box>
        {useUTM === 'utm' ? (
          utmFields.map((f, idx) => {
            const numberProps = { ...baseInputProps, label: event.formatPropAsHeader(f.prop), propName: f.prop, key: `${f.prop}-${idx}` };
            // custom form validation
            if (f.prop === 'utm_easting') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 6);
            } else if (f.prop === 'utm_northing') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 7);
            }
            return f.prop === 'utm_zone' ? (
              <NumberInput {...numberProps} />
            ) : (
              <span className={'edit-form-field-span'}>
                <NumberInput {...numberProps} />
              </span>
            );
          })
        ) : (
          <>
            <NumberInput propName={latField.prop} {...baseInputProps} label={event.formatPropAsHeader(latField.prop)} />
            <NumberInput
              propName={longField.prop}
              {...baseInputProps}
              label={event.formatPropAsHeader(longField.prop)}
              validate={mustBeNegativeNumber}
            />
          </>
        )}
      </Box>
      <Box marginTop={5}>
        <TextField
          style={{ width: '100%' }}
          multiline={true}
          rows={2}
          key={commentField.prop}
          propName={commentField.prop}
          defaultValue={event.comment}
          label={event.formatPropAsHeader(commentField.prop)}
          changeHandler={handleChange}
        />
      </Box>
    </>
  );
}
