import { DesktopDatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { FormBaseProps } from 'types/form_types';
import { formatDay } from 'utils/time';

export type DateInputProps = FormBaseProps &
  StandardTextFieldProps & {
    defaultValue: Dayjs;
    minDate?: Dayjs;
    maxDate?: Dayjs;
    required?: boolean;
  };

export default function DateInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate, required } = props;
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(defaultValue ? defaultValue : null);

  const handleDateChange = (d: Dayjs): void => {
    setSelectedDate(d);
    if (d) {
      changeHandler({ [propName]: d.format(formatDay) });
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDatePicker
        disabled={props.disabled}
        InputProps={{ size: 'small' }}
        renderInput={(props): JSX.Element => <TextField {...props} />}
        label={label}
        value={selectedDate}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    </LocalizationProvider>
  );
}
