import { Paper, Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import { MakeEditFields } from 'components/form/create_form_components';
import { getInputTypesOfT, validateRequiredFields, FormInputType } from 'components/form/form_helpers';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import EditModal from 'pages/data/common/EditModal';
import { useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { eCritterPermission } from 'types/user';
import { removeProps } from 'utils/common';

// fixme: title pushed to top

export default function EditCritter(props: CritterCollarModalProps<Animal>): JSX.Element {
  const { isEdit, editing } = props;

  const canEdit = !isEdit ? true : editing.permission_type === eCritterPermission.change;
  const requiredFields = CS.requiredProps;

  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);

  useEffect(() => {
    setInputTypes(
      getInputTypesOfT<Animal>(
        editing,
        allFields.map((a) => a.prop),
        allFields.filter((f) => f.isCode).map((a) => a.prop)
      )
    );
  }, [editing]);

  const validateForm = (o: Animal): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createTitle = (): string =>
    !isEdit ? 'Add a new animal' : `${canEdit ? 'Editing' : 'Viewing'} ${editing.name}`;

  const generalFields = [
    { prop: 'animal_status', isCode: true },
    { prop: 'species', isCode: true },
    { prop: 'life_stage', isCode: true },
    { prop: 'estimated_age' },
    { prop: 'sex', isCode: true },
    { prop: 'juvenile_at_heel', isCode: true }
  ];
  const identifierFields = [
    { prop: 'wlh_id' },
    { prop: 'animal_id' },
    { prop: 'ear_tag_left' },
    { prop: 'ear_tag_right' },
    { prop: 'population_unit', isCode: true }
  ];
  const locationFields = [{ prop: 'region', isCode: true }, { prop: 'location' }];
  const allFields = [...locationFields, ...identifierFields, ...generalFields];

  const makeField = (
    iType: FormInputType,
    changeHandler: (v: Record<string, unknown>) => void,
    hasError: boolean
  ): React.ReactNode => {
    const isRequired = requiredFields.includes(iType.key);
    const errorText = hasError && (errors[iType.key] as string);
    return MakeEditFields(iType, changeHandler, hasError, editing, canEdit, isRequired, errorText);
  };

  return (
    <EditModal title={createTitle()} newT={new Animal()} onValidate={validateForm} isEdit={isEdit} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              <form className='rootEditInput' autoComplete='off'>
                <Paper className={'paper-edit'} elevation={3}>
                  <Typography className={'edit-form-header'} variant='h5'>
                    General Information
                  </Typography>
                  {inputTypes
                    .filter((f) => generalFields.map((x) => x.prop).includes(f.key))
                    .map((d) => makeField(d, onChange, !!errors[d.key]))}
                </Paper>
                <Paper className={'paper-edit'} elevation={3}>
                  <Typography className={'edit-form-header'} variant='h5'>
                    Identifiers
                  </Typography>
                  {inputTypes
                    .filter((f) => identifierFields.map((x) => x.prop).includes(f.key))
                    .map((d) => makeField(d, onChange, !!errors[d.key]))}
                </Paper>
                <Paper className={'paper-edit'} elevation={3}>
                  <Typography className={'edit-form-header'} variant='h5'>
                    Location
                  </Typography>
                  {inputTypes
                    .filter((f) => locationFields.map((x) => x.prop).includes(f.key))
                    .map((d) => makeField(d, onChange, !!errors[d.key]))}
                </Paper>
              </form>
              {/* dont show assignment history for new critters */}
              {isEdit ? <AssignmentHistory animalId={editing.critter_id} canEdit={canEdit} {...props} /> : null}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
