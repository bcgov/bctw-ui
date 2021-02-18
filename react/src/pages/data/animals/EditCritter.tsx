import { Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import Checkbox from 'components/form/Checkbox';
import { getInputTypesOfT, InputType, validateRequiredFields } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import SelectCode from 'components/form/SelectCode';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import EditModal from 'pages/data/common/EditModal';
import { useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { eCritterPermission } from 'types/user';
import { removeProps } from 'utils/common';

export default function EditCritter(props: CritterCollarModalProps<Animal>): JSX.Element {
  const { isEdit, editing, editableProps, selectableProps } = props;

  const canEdit = !isEdit ? true : editing.permission_type === eCritterPermission.change;
  const requiredFields = CS.requiredProps;

  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<{ key: string; type: InputType; value: unknown }[]>([]);

  useEffect(() => {
    setInputTypes(getInputTypesOfT<Animal>(editing, editableProps, selectableProps));
  }, [editing]);

  const validateForm = (o: Animal): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createTitle = (): string =>
    !isEdit ? 'Add a new animal' : `${canEdit ? 'Editing' : 'Viewing'} ${editing.name}`;

  return (
    <EditModal title={createTitle()} newT={new Animal()} onValidate={validateForm} isEdit={isEdit} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // validate form before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v);
          };
          return (
            <>
              <form className='rootEditInput' autoComplete='off'>
                <>
                  <Typography variant='h6'>General Information</Typography>
                  {/* render props that are text inputs */}
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
                          label={editing.formatPropAsHeader(d.key)}
                          disabled={!canEdit}
                          changeHandler={onChange}
                          required={requiredFields.includes(d.key)}
                          error={hasError}
                          helperText={hasError && errors[d.key]}
                        />
                      );
                    })}
                </>
                <>
                  <Typography variant='h6'>Group Information</Typography>
                  {/* render props that are selects */}
                  {inputTypes
                    .filter((f) => f.type === InputType.select)
                    .map((d) => {
                      return (
                        <SelectCode
                          disabled={!canEdit}
                          key={d.key}
                          codeHeader={d.key}
                          defaultValue={d.value}
                          changeHandler={onChange}
                          required={requiredFields.includes(d.key)}
                          error={!!errors[d.key]}
                        />
                      );
                    })}
                </>
                <>
                  <Typography variant='h6'>Individual Characteristics</Typography>
                  {/* render props that are check boxes */}
                  {inputTypes
                    .filter((f) => f.type === InputType.check)
                    .map((d, i) => {
                      const checked =
                        d.value === null || d.value === false || d.value === 'N' || d.value === 'false' ? false : true;
                      return (
                        <Checkbox
                          key={`${d.key}${i}`}
                          initialValue={checked}
                          label={d.key}
                          changeHandler={handlerFromContext}
                          disabled={!canEdit}
                        />
                      );
                    })}
                </>
              </form>
              {/* dont show assignment history for new critters */}
              {isEdit ? <AssignmentHistory animalId={editing.id} canEdit={canEdit} {...props} /> : null}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
