import { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';
import { DesktopDateTimePicker } from '@mui/lab';
import { DateInputProps } from 'components/form/Date';
import { FormControl, TextField } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { baseInputStyle } from 'components/component_constants';
type DateOrNull = Dayjs | null;
/**
 * date time picker component
 */
export default function DateTimeInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate, required } = props;
  const [selectedTime, setSelectedTime] = useState<DateOrNull>(defaultValue?.isValid() ? defaultValue : null);

  const checkForErr = (d: DateOrNull): boolean => {
    if (required && (!d || !d?.isValid())) return true;
    if (minDate && d && d.isBefore(minDate)) return true;
    if (maxDate && d && d.isAfter(maxDate)) return true;
    return false;
  };

  const [hasError, setHasError] = useState(checkForErr(selectedTime));

  const callParentHandler = (d: DateOrNull): void => {
    const isErr = checkForErr(d);
    setHasError(isErr);
    const t = { [propName]: d, error: isErr };
    changeHandler(t);
  };

  const handleChangeTime = (d: DateOrNull): void => {
    setSelectedTime(d);
    callParentHandler(d);
  };

  useEffect(() => {
    callParentHandler(selectedTime);
  }, [minDate, maxDate]);
  //On mount if a defaultValue is provided call the parent handler
  useEffect(() => {
    if (defaultValue?.isValid()) {
      callParentHandler(defaultValue);
    }
  }, []);

  // trigger error status check when required prop changes
  useEffect(() => {
    if (typeof required !== 'boolean') {
      return;
    }
    callParentHandler(selectedTime);
  }, [required]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* shows the asterisk at the end of the label if error is present */}
      <FormControl error={hasError} style={baseInputStyle}>
        <DesktopDateTimePicker
          ampm={false} // 24 hours
          InputProps={{ required, error: hasError }}
          disabled={props.disabled}
          renderInput={(p): JSX.Element => <TextField {...p} size='small' />}
          label={label}
          value={selectedTime}
          onChange={handleChangeTime}
          minDate={minDate}
          maxDate={maxDate}
        />
      </FormControl>
    </LocalizationProvider>
  );
}
