import { useState } from 'react';
import DateTimeInput, { DTimeChangeOutput } from 'components/form/DateTimeInput';
import { Box, Typography } from '@material-ui/core';
import { DataLifeStrings } from 'constants/strings';
import { DataLifeInput } from 'types/data_life';
import { Dayjs } from 'dayjs';

/**
 * @param dli instance of @type {DataLifeIinput} 
 * @param disableEditActual always disable the attachment start/end fields
 * @param enableEditStart @param enableEditEndenable whether or not to enable the start / end fields
 * @param disableDLStart @param disableDLEnd explicity disable only the data life fields
 * @param onChange optional change handler when a datetime is modified
 */
type DataLifeInputProps = {
  dli: DataLifeInput;
  enableEditStart: boolean;
  enableEditEnd: boolean;

  disableDLStart?: boolean;
  disableDLEnd?: boolean;
  disableEditActual?: boolean;
  onChange?: (d: DTimeChangeOutput) => void;
};

// todo: doc
const getFirstKey = (d: DTimeChangeOutput): string => Object.keys(d)[0];
const getFirstValue = (d: DTimeChangeOutput): Dayjs => Object.values(d)[0];

/**
 * todo: time validation if same date?
 */
export default function DataLifeInputForm(props: DataLifeInputProps): JSX.Element {
  const { dli, disableEditActual, enableEditStart, enableEditEnd, onChange, disableDLEnd, disableDLStart } = props;
  const [minDate, setMinDate] = useState<Dayjs>(dli.attachment_start);
  const [maxDate, setMaxDate] = useState<Dayjs>(dli.attachment_end);

  const [isModified, setIsModified] = useState<boolean>(false);

  const handleDateOrTimeChange = (d): void => {
    const k = getFirstKey(d);
    const v = getFirstValue(d);
    dli[k] = v;
    if (k === 'attachment_start') {
      setMinDate(v);
    } else if (k === 'attachment_end') {
      setMaxDate(v);
    }
    // call parent change handler if it exists
    if (typeof onChange === 'function') {
      onChange(d);
    }
    // update state to show warning if data life was modified
    if (k.indexOf('data_') !== -1) {
      setIsModified(true);
    }
  };

  return (
    <Box paddingBottom={2}>
      {/* if data life has been modified - show a warning */}
      <Box height={35} display='flex' justifyContent={'center'}>
        {isModified ? (<Typography color={'error'}>{DataLifeStrings.editWarning}</Typography>) : null}
      </Box>
      <Box>
        {/* attachment start field */}
        <DateTimeInput
          propName='attachment_start'
          changeHandler={handleDateOrTimeChange}
          label='Attachment Start'
          defaultValue={dli.attachment_start}
          disabled={!enableEditStart|| disableEditActual}
        />
        <Box component={'span'} m={1} />
        {/* data life start field */}
        <DateTimeInput
          propName='data_life_start'
          changeHandler={handleDateOrTimeChange}
          label='Data Life Start'
          defaultValue={dli.data_life_start}
          disabled={!enableEditStart || disableDLStart}
          minDate={minDate}
        />
        <Box component={'span'} m={1} />
        {/* data life end field */}
        <DateTimeInput
          propName='data_life_end'
          changeHandler={handleDateOrTimeChange}
          label='Data Life End'
          defaultValue={dli.data_life_end}
          disabled={!enableEditEnd || disableDLEnd}
          maxDate={maxDate}
        />
        <Box component={'span'} m={1} />
        {/* attachment end field */}
        <DateTimeInput
          propName='attachment_end'
          changeHandler={handleDateOrTimeChange}
          label='Attachment End'
          defaultValue={dli.attachment_end}
          disabled={!enableEditEnd|| disableEditActual}
        />
      </Box>
    </Box>
  );
}
