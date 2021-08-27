import { EditorProps } from 'components/component_interfaces';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { User } from 'types/user';
import { MakeEditField } from 'components/form/create_form_components';
import { eInputType } from 'types/form_types';

/**
 * the edit user form, implemented in pags/admin/UserAdmin
 * to allow admins to create new users via a form
 * todo: only bceid or idir
 */
export default function EditUser(props: EditorProps<User>): JSX.Element {
  const { editing } = props;

  const onSave = (b: User): void => {
    // todo: fixme: implement save
    console.log('save user', b);
  }

  return (
    <EditModal
      disableHistory={true}
      title={editing?.id ? `Editing ${editing.uid}` : 'Create New User'}
      showInFullScreen={false}
      onReset={close}
      onSave={onSave}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          return (
            <div className='container'>
              <form className='rootEditInput' autoComplete='off'>
                {editing.formFields
                  .map((d) => {
                    const { prop } = d;
                    return MakeEditField({
                      prop,
                      value: editing[prop],
                      type: eInputType.text,
                      handleChange: handlerFromContext,
                      label: editing.formatPropAsHeader(prop),
                      required: true
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
