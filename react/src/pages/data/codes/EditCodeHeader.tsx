import { EditorProps } from 'components/component_interfaces';
import { getInputTypesOfT } from 'components/form/form_helpers';
import TextField from 'components/form/TextInput';
import ChangeContext from 'contexts/InputChangeContext';
import { CodeFormFields, CodeHeaderInput } from 'types/code';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { CodeStrings as S } from 'constants/strings';
import { removeProps } from 'utils/common';
import { eInputType } from 'types/form_types';

export default function EditCodeHeader(props: EditorProps<CodeHeaderInput>): JSX.Element {
  const { editing } = props;
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  const inputTypes = getInputTypesOfT<CodeHeaderInput>(
    editing,
    CodeFormFields,
    []
  );
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
              {inputTypes
                .filter((f) => f.type === eInputType.text || f.type === eInputType.number)
                .map((d) => {
                  const hasError = !!errors[d.key];
                  return (
                    <TextField
                      key={d.key}
                      propName={d.key}
                      defaultValue={d.value as string}
                      type={d.type}
                      label={new CodeHeaderInput().formatPropAsHeader(d.key)}
                      disabled={false}
                      changeHandler={onChange}
                      required={true}
                      error={hasError}
                      helperText={hasError && errors[d.key]}
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
