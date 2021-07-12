import { EditorProps } from 'components/component_interfaces';
import TextField from 'components/form/TextInput';
import ChangeContext from 'contexts/InputChangeContext';
import { CodeFormFields, CodeHeaderInput } from 'types/code';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { CodeStrings as S } from 'constants/strings';
import { removeProps } from 'utils/common_helpers';

export default function EditCodeHeader(props: EditorProps<CodeHeaderInput>): JSX.Element {
  const { editing } = props;
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  return (
    <EditModal
      title={S.addHeaderTitle}
      showInFullScreen={false}
      onReset={close}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v);
          };
          return (
            <div style={{marginBottom: '1rem'}}>
              {CodeFormFields
                .map((d) => {
                  const key = d.prop;
                  const value = editing[key];
                  const hasError = !!errors[key];
                  return (
                    <TextField
                      key={key}
                      propName={key}
                      defaultValue={value as string}
                      type={d.type}
                      label={new CodeHeaderInput().formatPropAsHeader(key)}
                      disabled={false}
                      changeHandler={onChange}
                      required={true}
                      error={hasError}
                      helperText={hasError && errors[key]}
                    />
                  );
                })}
            </div>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
