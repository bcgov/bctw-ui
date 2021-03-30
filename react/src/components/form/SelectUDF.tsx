import 'styles/form.scss';
import { FormControl, Select as MuiSelect, InputLabel, MenuItem, Checkbox } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { removeProps } from 'utils/common';
import { SelectProps } from '@material-ui/core';
import { eUDFType, IUDF } from 'types/udf';

type ISelectProps = SelectProps & {
  udfType: eUDFType;
  changeHandler: (o: IUDF[]) => void;
  triggerReset?: boolean; // force components that are 'multiple' to unselect all values
};

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectUDF(props: ISelectProps): JSX.Element {
  const { label, udfType, changeHandler, triggerReset } = props;
  const bctwApi = useTelemetryApi();
  const [values, setValues] = useState<string[]>([]);
  const [udfs, setUdfs] = useState<IUDF[]>([]);

  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, ['udfType', 'changeHandler', 'triggerReset']);

  // load this codeHeaders codes from db
  const { data, isSuccess } = bctwApi.useUDF(udfType);

  useEffect(() => {
    const updateOptions = (): void => {
      if (!data?.length) {
        return;
      }
      setUdfs(data);
    };
    updateOptions();
  }, [isSuccess]);

  useEffect(() => {
    if (triggerReset) {
      setValues([]);
    }
  }, [triggerReset]);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const selected = event.target.value as string[];
    setValues(selected);
    pushChange(selected);
  };

  const pushChange = (selected: string[]): void => {
    const filtered = udfs.filter(u => selected.includes(u.key));
    if (typeof changeHandler === 'function') {
      changeHandler(filtered);
    }
  };

  return (
    <>
      <FormControl size='small' variant={'outlined'} className={'udf-select-control'}>
        <InputLabel id='select-label'>{label}</InputLabel>
        <MuiSelect
          label={label}
          labelId='select-label'
          variant='outlined'
          value={values}
          onChange={handleChange}
          renderValue={(selected: string | string[]): string => {
            return selected as string;
          }}
          {...propsToPass}>
          {udfs.map((u: IUDF) => {
            return (
              <MenuItem key={u.key} value={u.key}>
                <Checkbox size='small' color='primary' checked={values.indexOf(u.key) !== -1} />
                {u.key}
              </MenuItem>
            );
          })}
        </MuiSelect>
      </FormControl>
    </>
  );
}
