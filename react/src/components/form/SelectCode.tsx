import {
  FormControl,
  Select as MuiSelect,
  InputLabel,
  MenuItem,
  createStyles,
  makeStyles,
  Theme
} from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICode } from 'types/code';

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

type ISelectProps<T> = {
  codeHeader: string;
  label: string;
  defaultValue: T;
  changeHandler: (o: object) => void;
};

/*
  fixme: in react strictmode the material ui component is warning about
  deprecated findDOMNode usage
*/
export default function SelectCode({ codeHeader, label, defaultValue, changeHandler }: ISelectProps<any>) {
  const classes = useStyles();
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState(defaultValue);
  
  const { data, error, isFetching, isError, isLoading, /*isPreviousData, isStale*/} = bctwApi.useCodes(codeHeader);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const v = event.target.value;
    setValue(v);
    pushChange(v);
  };

  const reset = () => {
    const nv = defaultValue ?? '';
    setValue(nv)
    pushChange(nv);
  }

  const pushChange = (v: any) => {
    changeHandler({[label]: v});
  }

  useEffect(() => {
    reset();
  }, [defaultValue]);

  // if (isPreviousData) {
  //   console.log('previous data!')
  // } 
  // if (isStale) {
  //   console.log('stale data!')
  // }
  if (isError) {
    return <div>error: {error.response.data}</div>;
  } else if (isFetching || isLoading) {
    return <div>loading...</div>;
  }
  if (data?.length) {
    return (
      <FormControl className={classes.formControl}>
        <InputLabel id='select-label'>{label}</InputLabel>
        <MuiSelect labelId='select-label' value={value ?? ''} onChange={handleChange}>
          {data?.map((c: ICode) => {
            return (
              <MenuItem key={c.id} value={c.description ?? ''}>
                {c.description}
              </MenuItem>
            );
          })}
        </MuiSelect>
      </FormControl>
    );
  }
  return <></>;
}
