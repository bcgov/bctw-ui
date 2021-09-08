import { useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import { formatDay } from 'utils/time';
import { StandardTextFieldProps } from '@material-ui/core/TextField';

type DateTimeChangeOutput = Record<string, string>;

// todo: convert to Dayjs
// todo: handle invalid dayjs
export type DateInputProps = StandardTextFieldProps & {
  propName: string;
  label: string;
  defaultValue: Date;
  changeHandler: (v: DateTimeChangeOutput) => void;
  minDate?: Date;
  maxDate?: Date;
};

export default function DateInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate } = props;
  const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultValue ? dayjs(defaultValue) : undefined);

  const handleDateChange = (date: Dayjs | null): void => {
    setSelectedDate(date);
    if (date) {
      changeHandler({ [propName]: date.format(formatDay) });
    }
  };
  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <DatePicker
        autoOk={true}
        inputVariant={'outlined'}
        disableToolbar
        disabled={props.disabled}
        size={'small'}
        variant='dialog'
        // a plain empty string renders as today?
        format={dayjs.isDayjs(selectedDate) ? selectedDate.format('YYYY/MM/DD') : ' '}
        margin='normal'
        label={label}
        value={selectedDate}
        onChange={handleDateChange}
        // KeyboardButtonProps={{ 'aria-label': 'change date' }}
        minDate={minDate}
        maxDate={maxDate}
      />
    </MuiPickersUtilsProvider>
  );
}
