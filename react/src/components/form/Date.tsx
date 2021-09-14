import { useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import { formatDay } from 'utils/time';
import { StandardTextFieldProps } from '@material-ui/core/TextField';
import { FormChangeEvent } from 'types/form_types';

export type DateInputProps = StandardTextFieldProps & {
  propName: string;
  label: string;
  defaultValue: Dayjs;
  changeHandler: FormChangeEvent;
  minDate?: Dayjs;
  maxDate?: Dayjs;
};

export default function DateInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate } = props;
  const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultValue.isValid() ? dayjs(defaultValue) : null);

  const handleDateChange = (djs: Dayjs | null): void => {
    setSelectedDate(djs);
    if (djs) {
      changeHandler({ [propName]: djs.format(formatDay) });
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
