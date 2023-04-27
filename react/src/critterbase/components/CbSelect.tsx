import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import { ICbRouteKey } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { uuid } from 'types/common_types';
import { capitalize, columnToHeader } from 'utils/common_helpers';

export interface CbSelectProps {
  cbRouteKey: ICbRouteKey;
  required: boolean;
  value?: string;
}

export const CbSelect = (props: CbSelectProps): JSX.Element => {
  const { cbRouteKey, required, value } = props;
  const cbApi = useTelemetryApi();
  const { data, isError } = cbApi.useCritterbaseSelectOptions(cbRouteKey);
  const [selected, setSelected] = useState<uuid | string>(value);

  const hasError = isError || (required && !selected) || !cbRouteKey;
  const label = !cbRouteKey ? 'Missing Route Key' : columnToHeader(cbRouteKey);
  const handleSelect = (event: SelectChangeEvent): void => {
    setSelected(event.target.value);
  };
  return (
    <FormControl
      size='small'
      style={{ ...baseInputStyle }}
      required={required}
      className={`select-control ${isError ? 'input-error' : ''}`}
      error={hasError}
      disabled={isError || !cbRouteKey}>
      <InputLabel>{label}</InputLabel>
      <Select value={selected} onChange={handleSelect}>
        {data?.map((val, idx) => {
          const valueId = typeof val === 'string' ? val : val.id;
          const value = typeof val === 'string' ? val : val.value;
          return (
            <MenuItem value={valueId} key={`${val}-${idx}`}>
              {capitalize(value)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
