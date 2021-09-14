import { useEffect, useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { formatTime } from 'utils/time';
import { DateInputProps } from 'components/form/Date';
import { FormControl } from '@material-ui/core';

// fixme: alignment / size
export default function DateTimeInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate, required } = props;
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(defaultValue?.isValid() ? defaultValue : null);

  const checkForErr = (d: Dayjs | null): boolean => required && (!d || !d?.isValid());

  const [hasError, setHasError] = useState(checkForErr(selectedTime));

  const handleChangeTime = (d: Dayjs): void => {
    setSelectedTime(d);
    const isErr = checkForErr(d);
    setHasError(isErr);
    const t = { [propName]: d, error: isErr};
    changeHandler(t);
  };

  // trigger error status on check when required prop changes
  // pass undefined as a value
  // fixme: wiping state when we dont want to
  useEffect(() => {
    const isErr = checkForErr(selectedTime);
    setHasError(isErr);
    const e = {[propName]: isErr ? undefined : selectedTime, error: isErr};
    console.log(e)
    changeHandler(e);
  }, [ required])

  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      {/* shows the asterisk at the end of the label if error is present */}
      <FormControl error={hasError}> 
        <DateTimePicker
          autoOk={true}
          ampm={false} // 24 hours
          inputVariant={'outlined'}
          disabled={props.disabled}
          size={'small'}
          clearable={true}
          format={dayjs.isDayjs(selectedTime) ? selectedTime.format(formatTime) : ' '}
          margin='normal'
          label={label}
          value={selectedTime}
          onChange={handleChangeTime}
          minDate={minDate}
          maxDate={maxDate}
          required={required}
          error={hasError} /* shows the label in error state (red) if error */
        />
      </FormControl>
    </MuiPickersUtilsProvider>
  );
}
