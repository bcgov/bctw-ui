import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { UserCritterAccess } from 'types/animal_access';
import TextField from 'components/form/TextInput';
import { UDF } from 'types/udf';
import { FormChangeEvent } from 'types/form_types';

/**
 * for @type {eUDFType.critter_group}
 * displays critter names (wlh_id/animal_id) from a UDFs value,
 * this UDFs value is an array of critter_id
 */
const CritterDropdown = (critters: UserCritterAccess[], u: UDF): JSX.Element => {
  if (!u) {
    return <></>;
  }
  return (
    <FormControl style={{ width: '100px' }} size='small' variant='outlined' className={'select-small'}>
      <InputLabel>Show</InputLabel>
      <Select disabled={u?.value?.length === 0}>
        {critters
          .filter((c) => u?.value?.includes(c.critter_id))
          .map((c: UserCritterAccess) => (
            <MenuItem key={c.critter_id}>{c.name}</MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

/**
 * renders a plain table cell
 */
const NumSelected = (u: UDF): JSX.Element => <>{u?.value?.length}</>;

/**
 * renders a textfield containing the UDF key as the input
 * used for critter_group udfs
 */
const UDFNameField = (handleChange: FormChangeEvent, u: UDF, disabled = false): JSX.Element => (
  <TextField
    changeHandler={handleChange}
    propName={'group'}
    defaultValue={u.key}
    required={true}
    disabled={disabled}
  />
);

export { CritterDropdown, NumSelected, UDFNameField };
