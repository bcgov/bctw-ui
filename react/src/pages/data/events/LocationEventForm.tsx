import React, { useState } from 'react';
import { LocationEvent, eLocationPositionType } from 'types/events/location_event';
import TextField from 'components/form/TextInput';
import Radio from 'components/form/Radio';
import { Box, capitalize } from '@mui/material';
import { WorkflowStrings } from 'constants/strings';
import NumberInput from 'components/form/NumberInput';
import { mustBeNegativeNumber, mustBeXDigits } from 'components/form/form_validators';
import { FormChangeEvent, FormFieldObject, InboundObj } from 'types/form_types';
import DateTimeInput from 'components/form/DateTimeInput';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { ReactNode } from 'react';
import { boxSpreadRowProps } from './EventComponents';
import { isDev } from 'api/api_helpers';
import { CreateFormField } from 'components/form/create_form_components';
import { AttachedCritter } from 'types/animal';
import { FormSection } from '../common/EditModalComponents';

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
  // create the form inputs
  const { regions, comment, latlon, extra } = event.fields;
  const [isRequired, setIsRequired] = useState({ required: false });

  const requiredLocationInputs: Array<keyof LocationEvent> = [
    'latitude',
    'longitude',
    'coordinate_uncertainty',
    'coordinate_uncertainty_unit'
  ];

  const changeHandler = (v: InboundObj): void => {
    const key = Object.keys(v)[0];
    const value = Object.values(v)[0];
    event[key] = value;
    if (requiredLocationInputs.includes(key as keyof LocationEvent) && value) {
      setIsRequired({ required: true });
    }
    if (event.event_type === 'release') {
      notifyChange({ ...v, nestedEventKey: 'release_location' });
      return;
    }
    if (event.event_type === 'capture') {
      notifyChange({ ...v, nestedEventKey: 'capture_location' });
      return;
    }
    if (event.event_type === 'mortality') {
      notifyChange({ ...v, nestedEventKey: 'location' });
      return;
    }
    // notify parent that the location event changed
    notifyChange(v);
  };

  return (
    <>
      {children ? (
        <FormSection id='latlon' header={`${capitalize(event.event_type)} Date`} flex>
          {children}
        </FormSection>
      ) : null}
      <FormSection id='latlon' header={`${capitalize(event.event_type)} Location`}>
        {latlon.map((f) => CreateFormField(event, f, changeHandler))}
      </FormSection>
      <FormSection id='Region' header={`${capitalize(event.event_type)} Region`}>
        {regions.map((f) => CreateFormField(event, f, changeHandler))}
      </FormSection>
      {/* <FormSection id='environment' header={`${capitalize(event.event_type)} Environment`}>
        <LocationFormField fields={extra} />
      </FormSection> */}

      {/* <FormSection id='Comment' header={`${capitalize(event.location_type)} Comment`} {...baseInputProps}>
        {comment.map((f, i) => CreateFormField(event, f, changeHandler))}
      </FormSection> */}
      {/* {event.disable_date ? null : (
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
      )} */}
      {/* optionally render children below the date component */}
      {/* {children} */}
      {/* show the UTM or Lat/Long fields depending on this checkbox state */}
      {/* <Radio
        propName={'coord_type'}
        defaultSelectedValue={showUtm}
        changeHandler={changeCoordinateType}
        values={[
          { value: 'utm', disabled, label: WorkflowStrings.location.coordTypeUTM },
          { value: 'coord', disabled, label: WorkflowStrings.location.coordTypeLatLong }
        ]}
      /> */}
      <Box>
        {/* render either the utm (default) or coordinate fields */}
        {/* {showUtm === 'utm' ? (
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
        )} */}
      </Box>
      <Box marginTop={1}>
        {/* <TextField
          style={{ width: '100%' }}
          multiline={true}
          rows={1}
          key={commentField.prop}
          propName={commentField.prop}
          defaultValue={event.comment}
          label={event.formatPropAsHeader(commentField.prop)}
          disabled={disabled}
          changeHandler={changeHandler}
        /> */}
      </Box>
    </>
  );
}
