import {
  FormControl,
  Select as MuiSelect,
  InputLabel,
  MenuItem,
  createStyles,
  makeStyles,
  Theme,
  SelectProps
} from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICode } from 'types/code';
import { NotificationMessage } from 'components/common';
import { formatAxiosError, getSelectCodeLabel, removeProps } from 'utils/common';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    }
  })
);

type ISelectProps<T> = SelectProps & {
  codeHeader: string;
  label: string;
  defaultValue: T;
  changeHandler: (o: Record<string, unknown>) => void;
};

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectCode(props: ISelectProps<any>): JSX.Element {
  const { codeHeader, label, defaultValue, changeHandler } = props;
  const classes = useStyles();
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState(defaultValue);

  const propsToPass = removeProps(props, ['codeHeader', 'changeHandler']);

  // load this codeHeaders codes from db

  const { data, error, isFetching, isError, isLoading } = (bctwApi.useCodes as any)(0, codeHeader);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const v = event.target.value;
    setValue(v);
    pushChange(v);
  };

  const reset = (): void => {
    const nv = defaultValue ?? '';
    setValue(nv)
    pushChange(nv);
  }

  const pushChange = (v: any): void => {
    const ret = { [getSelectCodeLabel(label)]: v };
    changeHandler(ret);
  }

  useEffect(() => {
    reset();
  }, [defaultValue]);

  return (
    <>
      {
        isError ? <NotificationMessage type='error' message={formatAxiosError(error)} /> :
          isLoading || isFetching ? <div>loading...</div> :
            <FormControl className={classes.formControl}>
              <InputLabel id='select-label'>{label}</InputLabel>
              <MuiSelect
                labelId='select-label'
                value={value ?? ''}
                onChange={handleChange}
                {...propsToPass}
              >
                {data?.map((c: ICode) => {
                  return (
                    <MenuItem key={c.id} value={c.description ?? ''}>
                      {c.description}
                    </MenuItem>
                  );
                })}
              </MuiSelect>
            </FormControl>
      }
    </>)
}
