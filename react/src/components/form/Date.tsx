import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DesktopDatePicker } from '@mui/lab';
import { formatDay } from 'utils/time';
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';
import { FormBaseProps } from 'types/form_types';
import AdapterDateFns from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

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
