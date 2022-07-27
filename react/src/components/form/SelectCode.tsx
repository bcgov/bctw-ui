import 'styles/form.scss';
import { FormControl, Select, InputLabel, MenuItem, Checkbox, SelectChangeEvent } from '@mui/material';
import { useState, useEffect, ReactNode } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICode, ICodeFilter } from 'types/code';
import { NotificationMessage } from 'components/common';
import { removeProps } from 'utils/common_helpers';
import { SelectProps } from '@mui/material';
import { FormStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';
import { FormBaseProps, SpeciesCast } from 'types/form_types';
import { SharedSelectProps } from './BasicSelect';
import { PartialPick } from 'types/common_types';
import { baseInputStyle, selectMenuProps } from 'components/component_constants';
import { useSpecies, useUpdateLockSpecies, useUpdateSpecies } from 'contexts/SpeciesContext';
import { formatCodeToSpecies } from 'utils/species';
import ConfirmModal from 'components/modal/ConfirmModal';
import { speciesModalMessage } from 'constants/formatted_string_components';

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
  } = props;
  const api = useTelemetryApi();
  const species = useSpecies();
  const updateSpecies = useUpdateSpecies();
  const updateSpeciesLock = useUpdateLockSpecies();
  
  const [value, setValue] = useState(defaultValue);
  const [values, setValues] = useState<string[]>([]);
  const [codes, setCodes] = useState<ICode[]>([]);
  const [canFetch, setCanFetch] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
  const handleConfirmSpeciesUpdate = (): void => {
    // && updateSpecies && value && codes.length
    const s = formatCodeToSpecies(codes.find(c => c?.description === value));
    updateSpecies(s);
    setShowModal(false);
  }

  const handleDeclineSpeciesModal = (): void => {
    setValue(species?.name);
    setShowModal(false);
    updateSpeciesLock(true);
  } 

  useEffect(() => {
    if(!value){
      //console.log(`ch: ${codeHeader} val: ${value}`);
      // const ret = { [getIdentifier()]: value, error: hasError };
      // console.log(ret);
      // changeHandler(ret);
    }
    if(codeHeader !== SPECIES_STR) return;
    //if(!species) setCanFetch(true);
    //When the species  first dropdown value is '' we know we are adding a new critter.
    if(!value) return;
    if(!codes.length) return;
      if(species) {
        //Show the modal on all changes to the species from within the edit critter page
        if(value !== species?.name) {
          setShowModal(true);
        }
      }else {
        //Only show the modal after the second species selection
        handleConfirmSpeciesUpdate();
      }
    setCanFetch(false);
  },[value]);

  // load the codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading, isSuccess } 
  = api.useCodes(0, codeHeader, species?.id, {
    // cacheTime set to zero to prevent weird caching behaviour with species selection
    cacheTime: 0, 
    enabled: canFetch,
  });

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
      //Set the species context
      if(found && found?.code_header_title.toLowerCase() === SPECIES_STR){
        updateSpecies(formatCodeToSpecies(found));
      }
      // update the error status if found
      if (found?.description && hasError) {
        setHasError(false);
      }
      setValue(found?.description ?? "");
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
  return (
    <>
    <ConfirmModal 
      open={showModal} 
      handleClose={handleDeclineSpeciesModal} 
      message={speciesModalMessage} 
      handleClickYes={handleConfirmSpeciesUpdate}/>
      {isError ? (
        <NotificationMessage severity='error' message={formatAxiosError(error)} />
      ) : isLoading || isFetching ? (
        <div>Please wait...</div>
      ) : codes && codes.length ? (
        <FormControl
          error={hasError}
          size='small'
          style={{...baseInputStyle, ...style}}
          className={`select-control ${hasError ? 'input-error' : ''}`}
          disabled={disabled}
          >
          <InputLabel disabled={disabled}>{
          required 
            ? `${codes[0].code_header_title} *` 
            : codes[0].code_header_title}
          </InputLabel>
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
