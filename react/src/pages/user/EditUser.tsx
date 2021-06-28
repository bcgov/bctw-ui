import { EditorProps } from 'components/component_interfaces';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { User, userFormFields } from 'types/user';
import { MakeEditField } from 'components/form/create_form_components';
import { formatLabel } from 'types/common_helpers';
import { eInputType } from 'types/form_types';

/**
 * the edit user form, implemented in pags/admin/UserAdmin
 * todo: also implement in UserProfile?
 */
export default function EditUser(props: EditorProps<User>): JSX.Element {
  const { editing } = props;

  return (
    <EditModal
      disableHistory={true}
      title={editing?.id ? `Editing ${editing.idir}` : 'Create New User'}
      showInFullScreen={false}
      onReset={close}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          return (
            <div className='container'>
              <form className='rootEditInput' autoComplete='off'>
                {userFormFields
                  .map((d) => {
                    const { prop } = d;
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
                      prop,
                      value: editing[prop],
                      type: eInputType.text,
                      handleChange: handlerFromContext,
                      label: formatLabel(editing, prop),
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
