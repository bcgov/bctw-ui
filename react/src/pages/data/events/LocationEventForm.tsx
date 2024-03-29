import { Box, capitalize } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { ReactNode } from 'react';
import { LocationEvent } from 'types/events/location_event';
import { CbRouteStatusHandler, FormChangeEvent, InboundObj } from 'types/form_types';
import { FormSection } from '../common/EditModalComponents';

type LocationEventProps = {
  event: LocationEvent;
  notifyChange: FormChangeEvent;
  handleRoute?: CbRouteStatusHandler;
  children?: ReactNode;
  childNextToDate?: ReactNode;
  disabled?: boolean;
};

export default function LocationEventForm({
  event,
  notifyChange,
  children,
  childNextToDate,
  disabled = false,
  handleRoute = undefined
}: LocationEventProps): JSX.Element {
  // create the form inputs
  const { regions, latlon } = event.fields;
  // const [isRequired, setIsRequired] = useState({ required: false });

  // const requiredLocationInputs: Array<keyof LocationEvent> = [
  //   'latitude',
  //   'longitude',
  //   'coordinate_uncertainty',
  //   'coordinate_uncertainty_unit'
  // ];

  const changeHandler = (v: InboundObj): void => {
    const key = Object.keys(v)[0];
    const value = Object.values(v)[0];

    event[key] = value;
    //console.log('LocationEventForm inboundObj: ' + JSON.stringify(v));

    // if (requiredLocationInputs.includes(key as keyof LocationEvent) && value) {
    //   setIsRequired({ required: true });
    // }
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
        <FormSection id='date' header={`${capitalize(event.event_type)} Date`}>
          {children}
        </FormSection>
      ) : null}
      <FormSection id='latlon' header={`${capitalize(event.event_type)} Location`}>
        {latlon.map((f) => CreateFormField(event, f, changeHandler))}
      </FormSection>
      <FormSection id='Region' header={`${capitalize(event.event_type)} Region`}>
        {regions.map((f) => CreateFormField(event, f, changeHandler, {}, false, {}, handleRoute))}
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
