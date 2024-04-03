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
  query?: string;
  isSelectionAllowed?: (newval: unknown) => boolean | Promise<boolean>;
  param?: string;
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
  query,
  param,
  isSelectionAllowed
}: CbSelectProps): JSX.Element => {
  const cbApi = useTelemetryApi();

  const { data, isError, isLoading, isSuccess, status } = cbApi.useCritterbaseSelectOptions(
    cbRouteKey,
    query,
    !disabled,
    param
  );
  const [selected, setSelected] = useState<uuid | string>(typeof value === 'string' ? value : '');
  const [hasError, setHasError] = useState(isError || (required && !selected) || !cbRouteKey);
  const isDisabled = isLoading || isError || !cbRouteKey || disabled;
  const labelOverride = label ?? columnToHeader(cbRouteKey);

  useEffect(() => {
    if (selected == value) return;
    if (typeof value === 'string') {
      setSelected(value);
      pushChange(value);
    }
  }, [value]);

  useEffect(() => {
    handleRoute?.(status, cbRouteKey);
  }, [status]);

  const pushChange = (v: string | Record<string, unknown>): void => {
    if (!isFunction(handleChange)) return;
    const err = !v && required;
    setHasError(err);
    const ret = { [prop]: v, error: err };
    handleChange(ret);
  };

  const handleSelect = async (id?: string, label?: string): Promise<void> => {
    const shouldChange = await isSelectionAllowed?.(id);
    if (isFunction(isSelectionAllowed) && !shouldChange) {
      return;
    }
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
      <Select value={isSuccess ? selected : ''} /*onChange={handleSelect}*/ MenuProps={selectMenuProps}>
        {data?.map((val, idx) => {
          const valueId = typeof val === 'string' ? val : val.id;
          const value = typeof val === 'string' ? val : val.value;
          return (
            <MenuItem value={valueId} key={`${val}-${idx}`} onClick={async () => await handleSelect(valueId, value)}>
              {capitalize(value)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
