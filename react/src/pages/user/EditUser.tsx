import { EditorProps } from 'components/component_interfaces';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { KeyCloakDomainType, User } from 'types/user';
import { CreateFormField } from 'components/form/create_form_components';
import { useState } from 'react';
import useDidMountEffect from 'hooks/useDidMountEffect';
import BasicSelect from 'components/form/BasicSelect';
import { Box } from '@mui/material';
import { eInputType } from 'types/form_types';
import PhoneInput from 'components/form/PhoneInput';

/**
 * the edit user form, implemented in pags/admin/UserAdmin
 * to allow admins to create new users via a form
 */
export default function EditUser(props: EditorProps<User>): JSX.Element {
  const { editing } = props;
  const [domain, setDomain] = useState<KeyCloakDomainType>('idir');

  useDidMountEffect(() => {
    editing.domain = domain;
  }, [domain]);

  return (
    <EditModal
      disableTabs={true} /** users dont have history */
      disableHistory={true}
      title={editing?.id ? `Editing ${editing.uid}` : 'Create New User'}
      showInFullScreen={false}
      onSave={(): void => {
        /* do nothing, handled in UserAdmin.tsx */
      }}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          return (
            <div className='container'>
              <form autoComplete='off'>
                {
                  <Box mt={2} mb={2} display={'flex'} alignItems={'center'}>
                    <BasicSelect
                      handleChange={(v: string): void => setDomain(v as KeyCloakDomainType)}
                      defaultValue={domain}
                      values={['idir', 'bceid']}
                      label={'Domain Type'}
                    />
                    <Box mr={2}></Box>
                    {CreateFormField(editing, { prop: 'username', type: eInputType.text }, handlerFromContext, {
                      required: true
                    })}
                  </Box>
                }
                <Box mt={2} mb={2}>
                  {CreateFormField(editing, { prop: 'firstname', type: eInputType.text }, handlerFromContext)}
                  {CreateFormField(editing, { prop: 'lastname', type: eInputType.text }, handlerFromContext)}
                </Box>
                <Box mt={2} mb={2}>
                  {CreateFormField(editing, { prop: 'email', type: eInputType.text }, handlerFromContext)}
                  <PhoneInput
                    defaultValue={editing.phone}
                    propName='phone'
                    label='Phone'
                    changeHandler={handlerFromContext}
                  />
                </Box>
              </form>
            </div>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
