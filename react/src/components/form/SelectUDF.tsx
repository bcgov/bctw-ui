import 'styles/form.scss';
import { FormControl, Select as MuiSelect, InputLabel, MenuItem } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICodeFilter } from 'types/code';
import { removeProps } from 'utils/common';
import { SelectProps } from '@material-ui/core';
import { eUDFType, IUDF } from 'types/udf';

type ISelectProps = SelectProps & {
  udfType: eUDFType;
  defaultValue?: string; // will otherwise default to empty string
  labelTitle: string;
  changeHandler: (o: ICodeFilter[]) => void;
  triggerReset?: boolean; // force components that are 'multiple' to unselect all values
};

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectUDF(props: ISelectProps): JSX.Element {
  const { udfType, defaultValue, changeHandler, labelTitle, triggerReset } = props;
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState<string[]>([defaultValue]);
  const [udfs, setUdfs] = useState<IUDF[]>([]);

  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, [
    'udfType',
    'changeHandler',
    'labelTitle',
    'triggerReset'
  ]);

  // load this codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading, isSuccess } = bctwApi.useUDF(udfType);

  useEffect(() => {
    const updateOptions = (): void => {
      if (!data?.length) {
        return;
      }
      setUdfs(data);
      // const found = data.find((d) => d.description === defaultValue);
      // if (found) {
      //   pushChange(found.code, false);
      // }
    };
    updateOptions();
  }, [isSuccess]);

  useEffect(() => {
    if (triggerReset) {
      // console.log('reset triggered from parent component!');
      setValue([]);
    }
  }, [triggerReset]);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const v = event.target.value;
    // setValue(v);
    pushChange(v, true);
  };

  // triggered when the default value is changed - ex. different editing object selected
  const reset = (): void => {
    const v = defaultValue ?? '';
    // setValue(v);
  };

  const pushChange = (selected: string[], b: boolean): void => {
    // const filtered = codes.filter((c) => selected.indexOf(c.description) !== -1);
    // const ret = filtered.map((c) => {
    // });
    // if (typeof changeHandlerMultiple === 'function') {
    //   changeHandlerMultiple(ret as ICodeFilter[]);
    // }
  };

  useEffect(() => {
    reset();
  }, [defaultValue]);

  return (
    <>
      <FormControl size='small' variant={'outlined'} className={'udf-select-control'}>
        <InputLabel id='select-label'>{labelTitle}</InputLabel>
        <MuiSelect
          label={labelTitle}
          labelId='select-label'
          variant='outlined'
          value={value}
          onChange={handleChange}
          renderValue={(selected: string | string[]): string => {
            return selected as string;
          }}
          {...propsToPass}>
          {udfs.map((u: IUDF) => {
            return (
              <MenuItem key={u.udf_id} value={u.udf_id}>
                {/* <Checkbox size='small' color='primary' checked={values.indexOf(c.description) !== -1} /> */}
                {u.value}
              </MenuItem>
            );
          })}
        </MuiSelect>
      </FormControl>
    </>
  );
}
