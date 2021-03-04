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

type ISelectProps = SelectProps & {
  codeHeader: string; // code header type to retrieve
  defaultValue: string;
  labelTitle: string;
  changeHandler: (o: Record<string, unknown>, isChange: boolean ) => void;
};

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectCode(props: ISelectProps): JSX.Element {
  const { codeHeader, defaultValue, changeHandler, labelTitle } = props;
  const classes = useStyles();
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState<string>(defaultValue);
  const [codes, setCodes] = useState<ICode[]>([]);

  const propsToPass = removeProps(props, ['codeHeader', 'changeHandler']);

  // load this codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading, isSuccess } = bctwApi.useCodes(0, codeHeader);

  useEffect(() => {
    const updateOptions = (): void => {
      if (!data?.length) {
        return;
      }
      setCodes(data);
      // if a default was set (a code description, update the value to its actual value)
      // pass false as second param to not update the modals 'is saveable property'
      const found = data.find(d => d.description === defaultValue);
      if (found) {
        pushChange(found.code, false)
      }
    };
    updateOptions();
  }, [isSuccess]);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const v = event.target.value;
    setValue(v);
    pushChange(v, true);
  };

  // triggered when the default value is changed - ex. different editing object selected
  const reset = (): void => {
    setValue(defaultValue ?? '');
  };

  // call the parent changeHandler
  const pushChange = (v: unknown, isChange: boolean): void => {
    const code = codes.find(c => c.description === v)?.code ?? v;
    const ret = { [codeHeader]: code };
    changeHandler(ret, isChange);
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
      ) : codes && codes.length ? (
        <FormControl className={classes.formControl}>
          <InputLabel id='select-label'>{labelTitle}</InputLabel>
          <MuiSelect labelId='select-label' value={value} onChange={handleChange} {...propsToPass}>
            {codes.map((c: ICode) => {
              return (
                <MenuItem key={c.id} value={c.description}>
                  {c.description}
                </MenuItem>
              );
            })}
          </MuiSelect>
        </FormControl>
      ): <div>unable to load dropdown</div>}
    </>
  );
}
