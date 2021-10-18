import React, { useState } from 'react';
import { LocationEvent, eLocationPositionType } from 'types/events/location_event';
import TextField from 'components/form/TextInput';
import Radio from 'components/form/Radio';
import { Box } from '@mui/material';
import { WorkflowStrings } from 'constants/strings';
import NumberInput from 'components/form/NumberInput';
import { mustBeNegativeNumber, mustBeXDigits } from 'components/form/form_validators';
import { FormChangeEvent, FormFieldObject, InboundObj } from 'types/form_types';
import DateTimeInput from 'components/form/DateTimeInput';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { ReactNode } from 'react';
import { boxSpreadRowProps } from './EventComponents';

type LocationEventProps = {
  event: LocationEvent;
  notifyChange: FormChangeEvent;
  children?: ReactNode;
  childNextToDate?: ReactNode;
  disabled?: boolean;
};

export default function LocationEventForm({
  event,
  notifyChange,
  children,
  childNextToDate,
  disabled = false
}: LocationEventProps): JSX.Element {
  const [showUtm, setShowUtm] = useState<eLocationPositionType>(eLocationPositionType.utm);

  // create the form inputs
  const fields = event.fields;
  const latField = fields.latlon[0];
  const longField = fields.latlon[1];
  const utmFields = fields.utm as FormFieldObject<LocationEvent>[];
  const dateField = fields.date as FormFieldObject<LocationEvent>;
  const commentField = fields.comment as FormFieldObject<LocationEvent>;
  const radioID = 'coord_type';

  // radio button control on whether to show UTM or lat long fields
  const changeCoordinateType = (e: InboundObj): void => {
    const ct = e[radioID] as eLocationPositionType;
    event.coordinate_type = ct;
    setShowUtm(ct);
  };

  const changeHandler = (v: InboundObj): void => {
    const key = Object.keys(v)[0];
    const value = Object.values(v)[0];
    event[key] = value;
    // notify parent that the location event changed
    notifyChange(v);
  };

  // notify parent error handler that required errors need to update when utm/lat long is changed
  useDidMountEffect(() => {
    notifyChange({ reset: true });
  }, [showUtm]);

  const baseInputProps = { changeHandler, required: true, disabled };
  return (
    <>
      {event.disable_date ? null : (
        <Box {...boxSpreadRowProps} mb={1}>
          {childNextToDate}
          <DateTimeInput
            propName={dateField.prop}
            label={event.formatPropAsHeader('date')}
            defaultValue={event.date}
            changeHandler={(v): void => changeHandler(v)}
            disabled={disabled}
          />
        </Box>
      )}
      {/* optionally render children below the date component */}
      {children}
      {/* show the UTM or Lat/Long fields depending on this checkbox state */}
      <Radio
        propName={'coord_type'}
        defaultSelectedValue={showUtm}
        changeHandler={changeCoordinateType}
        values={[
          { value: 'utm', disabled, label: WorkflowStrings.location.coordTypeUTM },
          { value: 'coord', disabled, label: WorkflowStrings.location.coordTypeLatLong }
        ]}
      />
      <Box>
        {/* render either the utm (default) or coordinate fields */}
        {showUtm === 'utm' ? (
          utmFields.map((f, idx) => {
            const val = event[f.prop] as number;
            const numberProps = {
              ...baseInputProps,
              defaultValue: val,
              key: `loc-num-${idx}`,
              label: event.formatPropAsHeader(f.prop),
              propName: f.prop
            };
            // custom form validation
            if (f.prop === 'utm_easting') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 6);
            } else if (f.prop === 'utm_northing') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 7);
            }
            return f.prop === 'utm_zone' ? (
              <NumberInput {...numberProps} />
            ) : (
              <span className={'edit-form-field-span'} key={`event-span-wrap-${idx}`}>
                <NumberInput {...numberProps} />
              </span>
            );
          })
        ) : (
          <>
            <NumberInput propName={latField.prop} label={event.formatPropAsHeader(latField.prop)} {...baseInputProps} />
            <NumberInput
              propName={longField.prop}
              label={event.formatPropAsHeader(longField.prop)}
              validate={mustBeNegativeNumber}
              {...baseInputProps}
            />
          </>
        )}
      </Box>
      <Box marginTop={2}>
        <TextField
          style={{ width: '100%' }}
          multiline={true}
          rows={1}
          key={commentField.prop}
          propName={commentField.prop}
          defaultValue={event.comment}
          label={event.formatPropAsHeader(commentField.prop)}
          disabled={disabled}
          changeHandler={changeHandler}
        />
      </Box>
    </>
  );
}
