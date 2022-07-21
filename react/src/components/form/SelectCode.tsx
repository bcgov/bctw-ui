import 'styles/form.scss';
import { FormControl, Select, InputLabel, MenuItem, Checkbox, SelectChangeEvent } from '@mui/material';
import { useState, useEffect, ReactNode } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICode, ICodeFilter } from 'types/code';
import { NotificationMessage } from 'components/common';
import { columnToHeader, headerToColumn, removeProps } from 'utils/common_helpers';
import { SelectProps } from '@mui/material';
import { FormStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';
import { FormBaseProps, SpeciesCast } from 'types/form_types';
import { SharedSelectProps } from './BasicSelect';
import { PartialPick } from 'types/common_types';
import { baseInputStyle, selectMenuProps } from 'components/component_constants';
import { useSpecies, useUpdateSpecies } from 'contexts/SpeciesContext';
import { transformCodeHeader } from 'types/animal';

type SelectCodeProps = FormBaseProps & SelectProps &
PartialPick<SharedSelectProps, 'defaultValue' | 'triggerReset'> & {
  codeHeader: string;
  changeHandlerMultiple?: (o: ICodeFilter[]) => void;
  addEmptyOption?: boolean;
  cast?: SpeciesCast;
};

/**
 * a dropdown select component that loads code tables for options
 * @param codeHeader the code_header_name to load codes from
 * @param defaultValue default code description to display
 * @param changeHandler called when a dropdown option is selected
 * @param multiple specific props:
 *   @param changeHandlerMultiple
 *   @param triggerReset unchecks all selected values
 *   @param addEmptyOption optionally add a 'blank' entry to end of select options
 * @param propname use this field as the key if the code header isn't the same. ex - ear_tag_colour_id
 */

export default function SelectCode(props: SelectCodeProps): JSX.Element {
  const {
    addEmptyOption,
    codeHeader,
    defaultValue,
    changeHandler,
    changeHandlerMultiple,
    label,
    multiple,
    triggerReset,
    style,
    required,
    propName,
    disabled,
    cast
  } = props;
  const api = useTelemetryApi();
  const species = useSpecies();
  const updateSpecies = useUpdateSpecies();
  const [value, setValue] = useState(defaultValue);
  const [code, setCode] = useState<ICode>();
  const [values, setValues] = useState<string[]>([]);
  const [codes, setCodes] = useState<ICode[]>([]);
  const [hasError, setHasError] = useState(required && !defaultValue ? true : false);
  const SPECIES_STR = 'species';
  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, [
    'propName',
    'addEmptyOption',
    'codeHeader',
    'changeHandler',
    'labelTitle',
    'changeHandlerMultiple',
    'triggerReset',
    'defaultValue'
  ]);
  const convertCodeHeader = (codeHeader: string, cast?: SpeciesCast, species?: string) => {
    if(!cast) return codeHeader;
    if(!species) return codeHeader;
    if(!cast[species]) return codeHeader;
    return cast[species];
  }
  useEffect(() => {
    if(codeHeader === SPECIES_STR && updateSpecies){
      updateSpecies(headerToColumn(value));
    }
  },[value]);
  // load the codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading, isSuccess, refetch } 
  = api.useCodes(0, convertCodeHeader(codeHeader, cast, species), { cacheTime: species ? 0 : 5000});

  // when data is successfully fetched
  useEffect(() => {
    const updateOptions = (): void => {
      if (!data?.length) {
        return;
      }
      // add an empty option to beginning, use ' ' as sometimes the value is defaulted to ''
      if (addEmptyOption && data.findIndex((d) => d?.id === 0) === -1) {
        data.push({ id: 0, code: '', description: FormStrings.emptySelectValue });
      }
      setCodes(data);
      // if a default value was provided, update it to the actual value
      const found = data.find((d) => d?.description === defaultValue);
      // update the error status if found
      if (found?.description && hasError) {
        setHasError(false);
      }
      setValue(found?.description ?? '');
      setCode(found);
    };
    updateOptions();
  }, [isSuccess]);

  useEffect(() => {
    if ((required && value) || !required) {
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [required]);

  // when the parent component forces a reset
  useEffect(() => {
    if (triggerReset && multiple) {
      setValues([]);
    }
  }, [triggerReset]);

  /**
   * selecting a value pushes change to the parent, which may in turn upate the defaultvalue
   * to avoid value being reset, check the new default is not the same as value
   */
  useDidMountEffect(() => {
    if (!data?.length) {
      return;
    }
    const match = data.find((d) => d.description === defaultValue);
    if (match && match.description !== value) {
      reset();
    }
  }, [defaultValue]);

  // call the parent change handler when the selected value or error status changes
  // use useEffect to ensure parent is notified when the code is required and empty
  useEffect(() => {
    pushChange(value);
  }, [value, hasError]);

  // handler when multiple is false
  const handleChange = (event: SelectChangeEvent<string>): void => {
    setHasError(false);
    const v = event.target.value;
    setValue(v);
  };

  // handler when multiple is true
  const handleChangeMultiple = (event: SelectChangeEvent<string[]>): void => {
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

  /**
   * calls the parent changeHandler function
   * passing an object in the form of
   * { *   [propName]: code, *   error: bool * }
   */
  const pushChange = (v: string): void => {
    const codeObj = codes.find((c) => c?.description === v);
    if (!codeObj && !hasError) {
      return;
    }
    const ret = { [getIdentifier()]: codeObj?.code, error: hasError };
    if (typeof changeHandler === 'function') {
      changeHandler(ret);
    }
  };

  /**
   * if @param codeHeader is not the same, use @param propName instead when
   * pushing the changed value to the parent @param changeHandler
   */
  const getIdentifier = (): string => String(propName ? propName : codeHeader);

  const pushChangeMultiple = (selected: string[]): void => {
    const filtered = codes.filter((c) => selected.indexOf(c?.description) !== -1);
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
  const getLabel = (codeHeader: string, required: boolean, species?: string): string => {
    const t = columnToHeader(convertCodeHeader(`${codeHeader}`, cast, species));
    return required ? `${t} *` : t;
  }
  return (
    <>
      {isError ? (
        <NotificationMessage severity='error' message={formatAxiosError(error)} />
      ) : isLoading || isFetching ? (
        <div>Please wait...</div>
      ) : codes && codes.length ? (
        <FormControl
          error={hasError}
          size='small'
          style={{...baseInputStyle, ...style}}
          className={`select-control ${hasError ? 'input-error' : ''}`}>
          <InputLabel disabled={disabled}>{getLabel(codeHeader, required, species)}</InputLabel>
          <Select
            MenuProps={selectMenuProps}
            value={multiple ? values : value}
            onChange={multiple ? handleChangeMultiple : handleChange}
            renderValue={(selected: string | string[]): ReactNode => {
              if (multiple) {
                // remove empty string values
                const l = (selected as string[]).filter((a) => a);
                return l.length > 4 ? `${l.length} selected` : l.join(', ');
              }
              return <span>{selected}</span>;
            }}
            {...propsToPass}>
            {codes.map((c: ICode) => (
              <MenuItem key={c?.id} value={c?.description}>
                {multiple ? <Checkbox size='small' checked={values.indexOf(c?.description) !== -1} /> : null}
                {c?.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <div>unable to load {codeHeader} codes</div>
      )}
    </>
  );
}
