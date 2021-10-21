import 'styles/form.scss';
import { FormControl, Select, InputLabel, MenuItem, Checkbox, SelectChangeEvent } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { removeProps } from 'utils/common_helpers';
import { SelectProps } from '@mui/material';
import { eUDFType, IUDF } from 'types/udf';
import { NotificationMessage } from 'components/common';
import { formatAxiosError } from 'utils/errors';

type ISelectProps = SelectProps & {
  udfType: eUDFType;
  changeHandler: (o: IUDF[]) => void;
  // force components that are 'multiple' to unselect all values
  triggerReset?: boolean;
};

export default function SelectUDF(props: ISelectProps): JSX.Element {
  const { label, udfType, changeHandler, triggerReset, multiple = true } = props;
  const bctwApi = useTelemetryApi();
  const [values, setValues] = useState<string[]>([]);
  const [udfs, setUdfs] = useState<IUDF[]>([]);

  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, ['udfType', 'changeHandler', 'triggerReset']);

  // load this codeHeaders codes from db
  const { data, isSuccess, isLoading, isFetching, isError, error } = bctwApi.useUDF(udfType);

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
  const handleChange = (event: SelectChangeEvent<string[]>): void => {
    const selected = event.target.value as string[];
    setValues(selected);
    changeHandler(udfs.filter((u) => selected.includes(u.key)));
  };

  return (
    <>
      {isError ? (
        <NotificationMessage severity='error' message={formatAxiosError(error)} />
      ) : isLoading || isFetching ? (
        <div>Please wait...</div>
      ) : (
        <FormControl size='small' variant={'outlined'} className={'udf-select-control'}>
          <InputLabel>{label}</InputLabel>
          <Select
            multiple={multiple}
            label={label}
            variant={'outlined'}
            value={values}
            onChange={handleChange}
            renderValue={(selected: string[]): string => selected.join(', ')}
            {...propsToPass}>
            {udfs.map((u: IUDF, idx: number) => {
              return (
                <MenuItem key={idx} value={u.key}>
                  <Checkbox size='small' color='primary' checked={values.indexOf(u.key) !== -1} />
                  {u.key} ({u.value.length})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}
    </>
  );
}
