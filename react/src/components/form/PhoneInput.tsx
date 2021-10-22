import MuiPhoneNumber from 'material-ui-phone-number';
import { TextInputProps } from './TextInput';

export default function PhoneInput(props: TextInputProps): JSX.Element {
  const { propName, label, changeHandler, defaultValue, required } = props;
  const propsToPass = { label, value: defaultValue, required };

  const handleChange = (val): void => {
    changeHandler({ [propName]: val });
  };

  return (
    <MuiPhoneNumber
      size={'small'}
      variant={'outlined'}
      value={''}
      defaultCountry='ca'
      onlyCountries={['ca']}
      onChange={handleChange}
      {...propsToPass}
    />
  );
}
