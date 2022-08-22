import 'styles/form.scss';
import { FormControl, Select, InputLabel, MenuItem, Checkbox, SelectChangeEvent, SelectProps } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { removeProps } from 'utils/common_helpers';
import { eUDFType, IUDF } from 'types/udf';
import { NotificationMessage } from 'components/common';
import { formatAxiosError } from 'utils/errors';
import { PartialPick } from 'types/common_types';
import { SharedSelectProps } from './BasicSelect';

type ISelectProps = SelectProps &
  PartialPick<SharedSelectProps, 'triggerReset' | 'defaultValue'> & {
    udfType: eUDFType;
    changeHandler: (o: IUDF[] | IUDF) => void;
    hide?: boolean;
  };

/**
 * todo: merge base select component with select codes / basic select components!
 */
export default function SelectUDF(props: ISelectProps): JSX.Element {
  const { label, udfType, defaultValue, changeHandler, triggerReset, multiple = true, className, hide } = props;
  const api = useTelemetryApi();
  const [values, setValues] = useState<string[] | string>(defaultValue ?? []);
  const [udfs, setUdfs] = useState<IUDF[]>([]);

  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, ['udfType', 'changeHandler', 'triggerReset']);

  // fetch the user's udfs
  const { data, isSuccess, isLoading, isFetching, isError, error } = api.useUDF(udfType);

  // note: watching 'isSuccess' will not trigger rerenders when new data is fetched
  useEffect(() => {
    if (isSuccess) {
      setUdfs(data);
    }
  }, [data]);

  useEffect(() => {
    if (triggerReset) {
      setValues([]);
    }
  }, [triggerReset]);

  // when values are selected, set selected and call the parent handler
  const handleChange = (event: SelectChangeEvent<string[] | string>): void => {
    const selected = event.target.value;
    setValues(selected);
    if (multiple) {
      changeHandler(udfs.filter((u) => selected.includes(u.key)));
    } else {
      changeHandler(udfs.find((u) => u.value === (selected as string)));
    }
  };
  if (hide) {
    return null;
  }
  return (
    <>
      {isError ? (
        <NotificationMessage severity='error' message={formatAxiosError(error)} />
      ) : isLoading || isFetching ? (
        <div>Please wait...</div>
      ) : (
        <FormControl size='small' className={className}>
          <InputLabel>{label}</InputLabel>
          <Select
            disabled={data?.length === 0}
            multiple={multiple}
            label={label}
            value={values}
            onChange={handleChange}
            renderValue={(selected: string[] | string): string =>
              Array.isArray(selected) ? selected.join(', ') : selected
            }
            {...propsToPass}>
            {udfs.map((u: IUDF, idx: number) => {
              if (multiple) {
                return (
                  <MenuItem key={idx} value={u.key}>
                    <Checkbox size='small' color='primary' checked={values.indexOf(u.key) !== -1} />
                    {u.key} ({u.value.length})
                  </MenuItem>
                );
              } else {
                return (
                  <MenuItem key={idx} value={u.value}>
                    {u.value}
                  </MenuItem>
                );
              }
            })}
          </Select>
        </FormControl>
      )}
    </>
  );
}
