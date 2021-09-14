import { useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { formatTime} from 'utils/time';
import { DateInputProps } from 'components/form/Date';

// fixme: alignment / size
export default function DateTimeInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate, required } = props;
  const [selectedTime, setSelectedTime] = useState<Dayjs>(defaultValue?.isValid() ? defaultValue : null);
  const [hasError, setHasError] = useState<boolean>(!!(required && !defaultValue.isValid()));

  const handleChangeTime = (d: Dayjs): void => {
    setHasError(false);
    setSelectedTime(d);
    const t = {[propName]: d, error: hasError};
    changeHandler(t);
  };

  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <DateTimePicker
        autoOk={true}
        ampm={false} // 24 hours
        inputVariant={'outlined'}
        disabled={props.disabled}
        size={'small'}
        format={dayjs.isDayjs(selectedTime) ? selectedTime.format(formatTime) : ' '}
        margin='normal'
        label={label}
        value={selectedTime}
        onChange={handleChangeTime}
        minDate={minDate}
        maxDate={maxDate}
        required={required}
        error={hasError}
      />
    </MuiPickersUtilsProvider>
  );
}

