import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DesktopDatePicker } from '@mui/lab';
import { formatDay } from 'utils/time';
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';
import { FormBaseProps } from 'types/form_types';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

export type DateInputProps = FormBaseProps & StandardTextFieldProps & {
  defaultValue: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
};

export default function DateInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate } = props;
  const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultValue.isValid() ? dayjs(defaultValue) : null);

  // fixme: adapterdatefns not working, typed as dayjs but it's a string
  const handleDateChange = (d: Dayjs): void => {
    const djs = dayjs(d);
    setSelectedDate(djs);
    if (djs) {
      changeHandler({ [propName]: djs.format(formatDay) });
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
