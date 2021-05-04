import 'styles/form.scss';
import { FormControl, Select, InputLabel, MenuItem, Checkbox } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICode, ICodeFilter } from 'types/code';
import { NotificationMessage } from 'components/common';
import { formatAxiosError, removeProps } from 'utils/common';
import { SelectProps } from '@material-ui/core';
import { FormStrings } from 'constants/strings';

type ISelectProps = SelectProps & {
  codeHeader: string; // code header type to retrieve
  defaultValue?: string; // will otherwise default to empty string
  label: string;
  changeHandler: (o: Record<string, unknown>, isChange: boolean) => void;
  changeHandlerMultiple?: (o: ICodeFilter[]) => void;
  triggerReset?: boolean; // force components that are 'multiple' to unselect all values
  addEmptyOption?: boolean; // optionally add a 'blank' entry to bottom of select menu
};

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectCode(props: ISelectProps): JSX.Element {
  const { addEmptyOption, codeHeader, defaultValue, changeHandler, changeHandlerMultiple, label: labelTitle, multiple, triggerReset, className } = props;
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState<string>(defaultValue);
  const [values, setValues] = useState<string[]>([]);
  const [codes, setCodes] = useState<ICode[]>([]);

  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, [ 'addEmptyOption', 'codeHeader', 'changeHandler', 'labelTitle', 'changeHandlerMultiple', 'triggerReset' ]);

  // load this codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading, isSuccess } = bctwApi.useCodes(0, codeHeader);

  useEffect(() => {
    const updateOptions = (): void => {
      if (!data?.length) {
        return;
      }
      // add an empty option to beginning, use ' ' as sometimes the value is defaulted to ''
      if (addEmptyOption && data.findIndex(d => d.id === 0) === -1) {
        data.push({id: 0, code: '', description: FormStrings.emptySelectValue})
      }
      setCodes(data);
      // if a default was set (a code description, update the value to its actual value)
      // pass false as second param to not update the modals 'is saveable property'
      const found = data.find((d) => d.description === defaultValue);
      if (found) {
        pushChange(found.code, false);
      }
    };
    updateOptions();
  }, [isSuccess]);

  useEffect(() => {
    if (triggerReset && multiple) {
      // console.log('reset triggered from parent component!');
      setValues([]);
    }
  }, [triggerReset]);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const v = event.target.value;
    setValue(v);
    pushChange(v, true);
  };

  const handleChangeMultiple = (event: React.ChangeEvent<{ value }>): void => {
    const selected = event.target.value as string[];
    setValues(selected);
    pushChangeMultiple(selected);
  };

  // triggered when the default value is changed 
  // ex. different editing object selected
  const reset = (): void => {
    const v = defaultValue;
    if (multiple && defaultValue !== undefined) {
      setValues([v]);
    } else {
      setValue(v);
    }
  };

  // call the parent changeHandler
  const pushChange = (v: unknown, isChange: boolean): void => {
    const code = codes.find((c) => c.description === v)?.code ?? v;
    const ret = { [codeHeader]: code };
    if (typeof changeHandler === 'function') {
      changeHandler(ret, isChange);
    }
  };

  const pushChangeMultiple = (selected: string[]): void => {
    const filtered = codes.filter((c) => selected.indexOf(c.description) !== -1);
    const ret = filtered.map((c) => {
      /// return a combination of the original code and the value
      /// why? these are most likely to be used in client side filtering
      /// where we dont need the code value but the description
      return { ...c, ...{ code_header: codeHeader } };
    });
    if (typeof changeHandlerMultiple === 'function') {
      changeHandlerMultiple(ret as ICodeFilter[]);
    }
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
        <FormControl size='small' variant={'outlined'} className={className ?? 'select-control'}>
          <InputLabel>{labelTitle}</InputLabel>
          <Select
            className={className}
            MenuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              getContentAnchorEl: null,
            }}
            label={labelTitle}
            variant={'outlined'}
            value={multiple ? values : value}
            onChange={multiple ? handleChangeMultiple : handleChange}
            renderValue={(selected: string | string[]): string => {
              if (multiple) {
                // remove empty string values
                const l = (selected as string[]).filter((a) => a);
                return l.length > 4 ? `${l.length} selected` : l.join(', ');
              }
              return selected as string;
            }}
            {...propsToPass}>
            {codes.map((c: ICode) => {
              if (!multiple) {
                return (
                  <MenuItem key={c.id} value={c.description}>
                    {c.description}
                  </MenuItem>
                );
              }
              return (
                <MenuItem key={c.id} value={c.description}>
                  <Checkbox size='small' color='primary' checked={values.indexOf(c.description) !== -1} />
                  {c.description}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <div>unable to load dropdown</div>
      )}
    </>
  );
}
