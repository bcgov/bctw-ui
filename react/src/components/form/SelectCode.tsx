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
import { formatAxiosError, removeProps } from 'utils/common';

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
  codeHeader: string; // code header type to retrieve
  defaultValue: T;
  changeHandler: (o: Record<string, unknown>) => void;
};

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectCode<T>(props: ISelectProps<T>): JSX.Element {
  const { codeHeader, defaultValue, changeHandler } = props;
  const classes = useStyles();
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState<T>(defaultValue);

  const propsToPass = removeProps(props, ['codeHeader', 'changeHandler']);

  // load this codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading } = bctwApi.useCodes(0, codeHeader);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const v = event.target.value;
    setValue(v);
    pushChange(v);
  };

  const reset = (): void => {
    const nv = defaultValue ?? value; // ?? '' as any;
    setValue(nv);
    pushChange(nv);
  };

  const pushChange = (v: unknown): void => {
    const ret = { [codeHeader]: v };
    changeHandler(ret);
  };

  useEffect(() => {
    reset();
  }, [defaultValue]);

  return (
    <>
      {isError ? (
        <NotificationMessage type='error' message={formatAxiosError(error)} />
      ) : isLoading || isFetching ? (
        <div>loading...</div>
      ) : (
        <FormControl className={classes.formControl}>
          <InputLabel id='select-label'>{data[0].code_header_title}</InputLabel>
          <MuiSelect labelId='select-label' value={value} onChange={handleChange} {...propsToPass}>
            {data?.map((c: ICode) => {
              return (
                <MenuItem key={c.id} value={c.description}>
                  {c.description}
                </MenuItem>
              );
            })}
          </MuiSelect>
        </FormControl>
      )}
    </>
  );
}
