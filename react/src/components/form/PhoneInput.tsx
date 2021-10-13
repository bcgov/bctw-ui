import MuiPhoneNumber from 'material-ui-phone-number';
import { TextInputProps } from './TextInput';

export default function PhoneInput(props: TextInputProps): JSX.Element {
  const { propName, label, changeHandler, defaultValue } = props;
  const propsToPass = { label, value: defaultValue };

  const handleChange = (val): void => {
    changeHandler({ [propName]: val });
  };

  return (
    <MuiPhoneNumber
      size={'small'}
      variant={'outlined'}
      value={'122-222-3333'}
      {...propsToPass}
      defaultCountry='ca'
      onlyCountries={['ca']}
      onChange={handleChange}
    />
  );
}
