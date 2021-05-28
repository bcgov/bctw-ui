import { EditorProps } from 'components/component_interfaces';
import { getInputTypesOfT } from 'components/form/form_helpers';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { User, userFormFields } from 'types/user';
import { MakeEditField } from 'components/form/create_form_components';
import { formatLabel } from 'types/common_helpers';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormInputType } from 'types/form_types';

export default function EditUser(props: EditorProps<User>): JSX.Element {
  const { editing } = props;
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);

  useDidMountEffect(() => {
    setInputTypes(getInputTypesOfT<User>(editing, userFormFields, []));
  }, [editing]);

  return (
    <EditModal
      hideHistory={true}
      title={editing?.id ? `Editing ${editing.idir}` : 'Create New User'}
      showInFullScreen={false}
      onReset={close}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          return (
            <div className='container'>
              <form className='rootEditInput' autoComplete='off'>
                {inputTypes
                  .map((d) => {
                    const { key, value } = d;
                    // const hasError = !!errors[key];
                    // console.log(hasError)
                    // return <TextField
                    //   outline={true}
                    //   key={key}
                    //   propName={key}
                    //   defaultValue={value as string}
                    //   type={'email'}
                    //   changeHandler={onChange}
                    //   error={hasError}
                    //   helperText={hasError && errors[d.key] as string}
                    //   label={formatLabel(editing, key)}
                    // />
                    return MakeEditField({
                      formType: d,
                      handleChange: handlerFromContext,
                      label: formatLabel(editing, d.key),
                      required: true,
                    })
                  })}
              </form>
            </div>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
