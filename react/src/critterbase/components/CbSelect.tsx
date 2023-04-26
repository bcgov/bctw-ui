import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import { ICbRoutesKey } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { isError } from 'react-query';
import { uuid } from 'types/common_types';
import { capitalize, columnToHeader } from 'utils/common_helpers';

interface CbSelectProps {
  formProp: ICbRoutesKey;
}

export const CbSelect = (props: CbSelectProps): JSX.Element => {
  const { formProp } = props;
  const cbApi = useTelemetryApi();
  const { data, isError } = cbApi.useCritterbaseSelectOptions(formProp);
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
      <InputLabel>{columnToHeader(formProp)}</InputLabel>
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
