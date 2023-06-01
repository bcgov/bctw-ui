import { FormControl, InputLabel, MenuItem, Select, capitalize } from '@mui/material';
import { baseInputStyle, selectMenuProps } from 'components/component_constants';
import { CreateInputProps } from 'components/form/create_form_components';
import { isFunction } from 'components/table/table_helpers';
import { ICbRouteKey } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { uuid } from 'types/common_types';
import { CbRouteStatusHandler } from 'types/form_types';
import { columnToHeader } from 'utils/common_helpers';

export type CbSelectProps = Omit<CreateInputProps, 'type'> & {
  cbRouteKey: ICbRouteKey;
  handleRoute?: CbRouteStatusHandler;
  query: string;
};
export const CbSelect = ({
  cbRouteKey,
  value,
  prop,
  required,
  handleChange,
  handleRoute,
  label,
  disabled,
  query
}: CbSelectProps): JSX.Element => {
  const cbApi = useTelemetryApi();
  const { data, isError, isLoading, isSuccess, status } = cbApi.useCritterbaseSelectOptions(cbRouteKey, query);
  const [selected, setSelected] = useState<uuid | string>('');
  const [hasError, setHasError] = useState(isError || (required && !selected) || !cbRouteKey);
  const isDisabled = isLoading || isError || !cbRouteKey || disabled;
  const labelOverride = label ?? columnToHeader(cbRouteKey);

  useEffect(() => {
    handleRoute?.(status, cbRouteKey);
  }, [status]);

  useEffect(() => {
    //console.log(`Triggered cbSelect ${cbRouteKey} ${isSuccess} ${isLoading}`)
    if (!data?.length) return;
    if (!value) {
      handleSelect();
      return;
    }
    if (typeof value !== 'string') return;
    const val = data.find((d) => (typeof d === 'string' ? d === value : d.id === value));
    handleSelect(value, typeof val === 'string' ? val : val.value);
    //setSelected(value);
  }, [isSuccess, isLoading, value, data]);

  const pushChange = (v: string | Record<string, unknown>): void => {
    if (!isFunction(handleChange)) return;
    const err = !v && required;
    setHasError(err);
    const ret = { [prop]: v, error: err };
    handleChange(ret);
  };

  const handleSelect = (id?: string, label?: string): void => {
    const hasProps = id && label;
    const a = { id, label };
    setSelected(hasProps ? a.id : '');
    pushChange(hasProps ? a : '');
  };

  return (
    <FormControl
      size='small'
      style={{ ...baseInputStyle }}
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
