import { TextField as MuiTextField, StandardTextFieldProps} from '@material-ui/core';

interface ITextfieldProps extends StandardTextFieldProps {
  propName: string;
  changeHandler: (o: object) => void;
}
export default function TextField(props: ITextfieldProps) {
  const { changeHandler, propName } = props;
  return (
    <MuiTextField
      {...props}
      onChange={(event) => {
        const o = { [propName]: event.target.value };
        changeHandler(o);
      }}
    />
  );
}
