import { CritterCollarModalProps } from 'components/component_interfaces';
import { getInputTypesOfT, InputType } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { CodeHeader } from 'types/code';
import { removeProps } from 'utils/common';

export default function EditCodeHeader(props: CritterCollarModalProps<CodeHeader>): JSX.Element {
  const { isEdit, editing, editableProps, selectableProps } = props;
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  const inputTypes = getInputTypesOfT<CodeHeader>(editing, editableProps, selectableProps);
  return (
    <EditModal
      title=''
      newT={new CodeHeader()}
      onValidate={(): boolean => true}
      onReset={close}
      isEdit={isEdit}
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
            <form className='rootEditInput' autoComplete='off'>
              {inputTypes
                .filter((f) => f.type === InputType.text || f.type === InputType.number)
                .map((d) => {
                  const hasError = !!errors[d.key];
                  return (
                    <TextField
                      key={d.key}
                      propName={d.key}
                      defaultValue={d.value}
                      type={d.type}
                      label={d.key}
                      disabled={false}
                      changeHandler={onChange}
                      required={true}
                      error={hasError}
                      helperText={hasError && errors[d.key]}
                    />
                  );
                })}
            </form>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
