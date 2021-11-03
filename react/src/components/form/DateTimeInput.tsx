import { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';
import { DesktopDateTimePicker } from '@mui/lab';
import { DateInputProps } from 'components/form/Date';
import { FormControl, TextField } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { baseInputStyle } from 'components/component_constants';

/**
 * date time picker component
 */
export default function DateTimeInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate, required } = props;
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(defaultValue?.isValid() ? defaultValue : null);

  const checkForErr = (d: Dayjs | null): boolean => required && (!d || !d?.isValid());

  const [hasError, setHasError] = useState(checkForErr(selectedTime));

  const handleChangeTime = (d: Dayjs | null): void => {
    setSelectedTime(d);
    const isErr = checkForErr(d);
    setHasError(isErr);
    const t = { [propName]: d, error: isErr };
    changeHandler(t);
  };

  // trigger error status check when required prop changes
  useEffect(() => {
    if (typeof required !== 'boolean') {
      return;
    }
    const isErr = checkForErr(selectedTime);
    setHasError(isErr);
    changeHandler({ [propName]: selectedTime, error: isErr });
  }, [required]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* shows the asterisk at the end of the label if error is present */}
      <FormControl error={hasError} style={baseInputStyle}>
        <DesktopDateTimePicker
          ampm={false} // 24 hours
          InputProps={{ size: 'small', required, error: hasError }}
          disabled={props.disabled}
          renderInput={(props): JSX.Element => <TextField {...props} />}
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
