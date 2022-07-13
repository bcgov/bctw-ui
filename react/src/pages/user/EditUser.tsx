import { EditorProps } from 'components/component_interfaces';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { eUserRole, KeyCloakDomainType, User } from 'types/user';
import { CreateFormField } from 'components/form/create_form_components';
import { useState } from 'react';
import useDidMountEffect from 'hooks/useDidMountEffect';
import BasicSelect from 'components/form/BasicSelect';
import { Box } from '@mui/material';
import { eInputType, isRequired } from 'types/form_types';
import PhoneInput from 'components/form/PhoneInput';
import { columnToHeader, doNothing, headerToColumn } from 'utils/common_helpers';

/**
 * the edit user form, implemented in pags/admin/UserAdmin
 * to allow admins to create new users via a form
 */
export default function EditUser(props: EditorProps<User>): JSX.Element {
  const { editing } = props;
  const [domain, setDomain] = useState<KeyCloakDomainType>("idir");
  //const [roleType, setRoleType] = useState<eUserRole>(editing.role_type);
  useDidMountEffect(() => {
    editing.domain = domain;
  }, [editing, domain]);

  return (
    <EditModal
      disableTabs={true}
      disableHistory={true}
      title={editing?.id ? `Editing ${editing.username}` : 'Create New User'}
      showInFullScreen={false}
      onSave={doNothing}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          return (
            <div className='container'>
              <Box mt={2} mb={2} display={'flex'} alignItems={'center'}>
                {CreateFormField(editing, { prop: 'username', type: eInputType.text, ...isRequired }, handlerFromContext)}
                <BasicSelect
                  handleChange={(v: string): void => setDomain(v as KeyCloakDomainType)}
                  defaultValue={domain}
                  values={['idir', 'bceid']}
                  label={'Domain Type'}
                  sx={{flex:1}}
                />
                
              </Box>
              <Box mt={2} mb={2} display={'flex'}>
                <BasicSelect
                  handleChange={(e) => editing.role_type = headerToColumn(e) as eUserRole}
                  defaultValue={columnToHeader(editing.role_type)}
                  values={Object.keys(eUserRole).map(p => columnToHeader(p))}
                  label={'Permission Type'}
                  sx={{flex:1}}
                />
              </Box>
              <Box mt={2} mb={2} display={'flex'}>
                {CreateFormField(editing, { prop: 'firstname', type: eInputType.text, ...isRequired }, handlerFromContext)}
                {CreateFormField(editing, { prop: 'lastname', type: eInputType.text, ...isRequired }, handlerFromContext, {}, false, {flex: 1, marginRight: 0})}
              </Box>
              <Box mt={2} mb={2}>
                {CreateFormField(editing, { prop: 'email', type: eInputType.text, ...isRequired }, handlerFromContext )}
                <PhoneInput
                  defaultValue={editing.phone}
                  propName='phone'
                  label='Phone'
                  changeHandler={handlerFromContext}
                />
              </Box>
            </div>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
