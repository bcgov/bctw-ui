import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, capitalize } from '@mui/material';
import { baseInputStyle, selectMenuProps } from 'components/component_constants';
import { CreateInputProps } from 'components/form/create_form_components';
import { isFunction } from 'components/table/table_helpers';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { id, pl } from 'date-fns/locale';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';

export type CbSelectPayload = { id: string; value: string };

export type CbSelectProps = Omit<CreateInputProps, 'type'> & { cbRouteKey: ICbRouteKey };
export const CbSelect = ({ cbRouteKey, value, prop, required, handleChange }: CbSelectProps): JSX.Element => {
  const cbApi = useTelemetryApi();
  const { data, isError, isLoading, isSuccess } = cbApi.useCritterbaseSelectOptions(cbRouteKey);
  const [selected, setSelected] = useState<uuid | string>('');
  // const [hasError, setHasError] = useState((required && !selected) || !cbRouteKey);

  const hasError = isError || (required && !selected) || !cbRouteKey;
  const isDisabled = isLoading || isError || !cbRouteKey;
  // console.log({ cbRouteKey }, { isLoading }, { isError });
  const label = cbRouteKey ? columnToHeader(cbRouteKey) : 'Missing Route Key';

  useEffect(() => {
    if (!data?.length) return;
    if (typeof value !== 'string') return;
    setSelected(value);
  }, [isSuccess]);

  const pushChange = (pl: CbSelectPayload): void => {
    if (!isFunction(handleChange)) return;
    const ret = { [prop]: pl, error: false };
    handleChange(ret);
  };

  const handleSelect = (pl: CbSelectPayload): void => {
    //On enum selects id and value will be the same
    setSelected(pl.id);
    pushChange(pl);
  };
  return (
    <FormControl
      size='small'
      style={{ ...baseInputStyle, marginBottom: baseInputStyle.marginRight }}
      required={required}
      className={`select-control ${hasError ? 'input-error' : ''}`}
      error={!isLoading && hasError}
      key={`${cbRouteKey}-${String(prop)}`}
      disabled={isDisabled}>
      <InputLabel>{label}</InputLabel>
      <Select value={selected} MenuProps={selectMenuProps}>
        {data?.map((val, idx) => {
          const id = typeof val === 'string' ? val : val.id;
          const value = typeof val === 'string' ? val : val.value;
          return (
            <MenuItem value={id} key={`${val}-${idx}`} onClick={() => handleSelect({ id, value })}>
              {capitalize(value)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
