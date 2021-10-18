import React, { useState } from 'react';
import DateTimeInput from 'components/form/DateTimeInput';
import { Box, Typography } from '@mui/material';
import { DataLifeStrings } from 'constants/strings';
import { DataLifeInput } from 'types/data_life';
import { Dayjs } from 'dayjs';
import { FormChangeEvent, InboundObj } from 'types/form_types';
import { DateInputProps } from './Date';
import { Tooltip } from 'components/common';

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
  propsRequired?: (keyof DataLifeInput)[];
  onChange?: FormChangeEvent;
  message?: React.ReactNode;
  displayInRows?: boolean;
};

// returns the first key ex. { data_life_start : 'bill' } // 'data_life_start'
const getFirstKey = (d: InboundObj): string => Object.keys(d)[0];
const getFirstValue = (d: InboundObj): unknown => Object.values(d)[0];

/**
 * todo: time validation if same date?
 */
export default function DataLifeInputForm(props: DataLifeInputProps): JSX.Element {
  const {
    dli,
    disableEditActual,
    enableEditStart,
    enableEditEnd,
    onChange,
    disableDLEnd,
    disableDLStart,
    propsRequired,
    message,
    displayInRows
  } = props;
  const [minDate, setMinDate] = useState<Dayjs>(dli.attachment_start);
  const [maxDate, setMaxDate] = useState<Dayjs>(dli.attachment_end);

  const [isModified, setIsModified] = useState<boolean>(false);

  const handleDateOrTimeChange = (d): void => {
    const k = getFirstKey(d);
    const v = getFirstValue(d) as Dayjs;
    dli[k] = v;
    if (k === 'attachment_start') {
      setMinDate(v);
    } else if (k === 'attachment_end') {
      setMaxDate(v);
    }
    // update state to show warning if data life was modified
    // todo: check prop doesn't match attachment timestamp
    if (k.indexOf('data_') !== -1 && v) {
      // fixme:
      // setIsModified(true);
    }
    // call parent change handler if it exists
    if (typeof onChange === 'function') {
      onChange(d);
    }
  };

  const DTPRops: Pick<DateInputProps, 'changeHandler' | 'margin'> = {
    changeHandler: handleDateOrTimeChange,
    margin: 'dense'
  };

  const Body = (
    <Box paddingBottom={2} id='hi'>
      {/* if data life has been modified and display is not row format - show a warning */}
      {displayInRows ? null : (
        <Box height={35} display='flex' flexDirection={'column'} alignItems={'center'}>
          {isModified ? <Typography color={'error'}>{DataLifeStrings.editWarning}</Typography> : null}
        </Box>
      )}
      <Box>
        {/* attachment start field */}
        <DateTimeInput
          propName='attachment_start'
          label='Attachment Start'
          defaultValue={dli.attachment_start}
          disabled={!enableEditStart || disableEditActual}
          required={propsRequired?.includes('attachment_start')}
          {...DTPRops}
        />
        <Box component={'span'} m={1} />
        {/* data life start field */}
        <DateTimeInput
          propName='data_life_start'
          label='Data Life Start'
          defaultValue={dli.data_life_start}
          disabled={!enableEditStart || disableDLStart}
          minDate={minDate}
          required={propsRequired?.includes('data_life_start')}
          {...DTPRops}
        />
        {displayInRows ? <Box></Box> : <Box component={'span'} m={1} />}
        {/* data life end field */}
        <DateTimeInput
          propName='data_life_end'
          label='Data Life End'
          defaultValue={dli.data_life_end}
          disabled={!enableEditEnd || disableDLEnd}
          maxDate={maxDate}
          required={propsRequired?.includes('data_life_end')}
          {...DTPRops}
        />
        <Box component={'span'} m={1} />
        {/* attachment end field */}
        <DateTimeInput
          propName='attachment_end'
          label='Attachment End'
          defaultValue={dli.attachment_end}
          disabled={!enableEditEnd || disableEditActual}
          required={propsRequired?.includes('attachment_end')}
          {...DTPRops}
        />
      </Box>
    </Box>
  );

  return message ? (
    <Tooltip placement='top-end' enterDelay={750} title={message}>
      {Body}
    </Tooltip>
  ) : (
    Body
  );
}
