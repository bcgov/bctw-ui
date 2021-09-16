import { useEffect, useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { formatTime } from 'utils/time';
import { DateInputProps } from 'components/form/Date';
import { FormControl } from '@material-ui/core';

// fixme: alignment / size
// todo: merge with plain date component
export default function DateTimeInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate, required, margin } = props;
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

  // trigger error status check when required prop changes
  useEffect(() => {
    if (typeof required !== 'boolean') {
      return;
    }
    const isErr = checkForErr(selectedTime);
    setHasError(isErr);
    changeHandler({[propName]: selectedTime, error: isErr});
  }, [required])

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
          margin={margin ?? 'none'}
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
