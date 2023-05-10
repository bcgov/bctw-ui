import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, capitalize } from '@mui/material';
import { baseInputStyle, selectMenuProps } from 'components/component_constants';
import { CreateInputProps } from 'components/form/create_form_components';
import { isFunction } from 'components/table/table_helpers';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';

export type CbSelectProps = Omit<CreateInputProps, 'type'> & { cbRouteKey: ICbRouteKey };
export const CbSelect = ({ cbRouteKey, value, prop, required, handleChange, label, disabled }: CbSelectProps): JSX.Element => {
  const cbApi = useTelemetryApi();
  const { data, isError, isLoading, isSuccess } = cbApi.useCritterbaseSelectOptions(cbRouteKey);
  const [selected, setSelected] = useState<uuid | string>('');
  // const [hasError, setHasError] = useState((required && !selected) || !cbRouteKey);

  const hasError = isError || (required && !selected) || !cbRouteKey;
  const isDisabled = isLoading || isError || !cbRouteKey || disabled;
  // console.log({ cbRouteKey }, { isLoading }, { isError });
  const labelOverride = label ?? columnToHeader(cbRouteKey);
  /*
  useEffect(() => {
    pushChange(selected);
  }, []) //Necessary to have the parent check for errors in this dropdown on initial render
  
  useEffect(() => {
    pushChange(selected);
  }, [required]);*/

  useEffect(() => {
    if (!data?.length) return;
    if (typeof value !== 'string') return;
    setSelected(value);
  }, [isSuccess]);

  /*useEffect(() => {
    if (typeof value !== 'string') return;
    if(value !== selected) {
      setSelected(value);
      pushChange(value);
    }
  }, [value]) //Necessary to have manual overrides of the selected value from the parent to have much effect
*/
  const pushChange = (v: string | Record<string, unknown>): void => {
    if (!isFunction(handleChange)) return;
    const ret = { [prop]: v, error: required && !v };
    handleChange(ret);
  };

  /*const handleSelect = (event: SelectChangeEvent): void => {
    const { value } = event.target;
    setSelected(value);
    pushChange(value);
  };*/

  const handleSelect = (id: string, label: string) => { 
    const a = { id: id, label: label};
    setSelected(a.id);
    pushChange(a);
  }

  return (
    <FormControl
      size='small'
      style={{ ...baseInputStyle, marginBottom: baseInputStyle.marginRight }}
      required={required}
      className={`select-control ${hasError ? 'input-error' : ''}`}
      error={!isLoading && hasError}
      key={`${cbRouteKey}-${String(prop)}`}
      disabled={isDisabled}>
      <InputLabel>{labelOverride}</InputLabel>
      <Select value={selected} /*onChange={handleSelect}*/ MenuProps={selectMenuProps}>
        {data?.map((val, idx) => {
          const valueId = typeof val === 'string' ? val : val.id;
          const value = typeof val === 'string' ? val : val.value;
          return (
            <MenuItem value={valueId} key={`${val}-${idx}`} onClick={() => handleSelect(valueId, value)}>
              {capitalize(value)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
