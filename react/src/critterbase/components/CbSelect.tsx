import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import { ICbRouteKey } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { uuid } from 'types/common_types';
import { capitalize } from 'utils/common_helpers';

interface CbSelectProps {
  routeKey: ICbRouteKey;
  label?: string;
}

export const CbSelect = (props: CbSelectProps): JSX.Element => {
  const { routeKey, label } = props;
  const cbApi = useTelemetryApi();
  const { data, isError } = cbApi.useCritterbaseSelectOptions(routeKey);
  const [selected, setSelected] = useState<uuid | string>('');

  const handleSelect = (event: SelectChangeEvent): void => {
    setSelected(event.target.value);
  };
  return (
    <FormControl
      size='small'
      style={{ ...baseInputStyle }}
      className={`select-control ${isError ? 'input-error' : ''}`}
      error={isError}
      disabled={isError}>
      <InputLabel>{label ? label : routeKey}</InputLabel>
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
