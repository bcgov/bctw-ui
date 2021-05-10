import { CritterCollarModalProps } from 'components/component_interfaces';
import { getInputTypesOfT, eInputType } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import ChangeContext from 'contexts/InputChangeContext';
import { CodeHeaderInput } from 'types/code';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { CodeStrings as S } from 'constants/strings';
import { removeProps } from 'utils/common';

// todo: remove these
type EditCodeModalProps = CritterCollarModalProps<CodeHeaderInput> & {
  editableProps: string[];
  selectableProps: string[];
}

export default function EditCodeHeader(props: EditCodeModalProps): JSX.Element {
  const { isEdit, editing, editableProps, selectableProps } = props;
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  const inputTypes = getInputTypesOfT<CodeHeaderInput>(editing, editableProps.map(e => ({prop: e})), selectableProps);
  return (
    <EditModal
      title={S.addHeaderTitle}
      newT={new CodeHeaderInput()}
      onValidate={(): boolean => true}
      showInFullScreen={false}
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
            <div className='container'>
              <form className='rootEditInput' autoComplete='off'>
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
              </form>
            </div>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
