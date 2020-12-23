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
import { useState } from 'react';
import { Animal, IAnimal } from 'types/animal';
import { removeProps } from 'utils/common';
import { useDataStyles } from 'pages/data/common/data_styles';

export default function EditCritter(props: CritterCollarModalProps<Animal>): JSX.Element {
  const { isEdit, editing, editableProps, selectableProps, handleClose, iMsg } = props;
  const classes = useDataStyles();

  const title = isEdit ? `Editing ${editing?.nickname ?? editing?.animal_id}` : `Add a new animal`;
  const requiredFields = CS.requiredProps;
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  const validate = (o: Animal): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const close = (v: boolean): void => {
    setErrors({});
    handleClose(v);
  }

  // retrieve input types from the object being edited
  const inputTypes = getInputTypesOfT<IAnimal>(editing, editableProps, selectableProps);

  return (
    <EditModal title={title} newT={new Animal()} onValidate={validate} handleClose={close} {...props}>
      <ChangeContext.Consumer>
        {
          (handlerFromContext): JSX.Element => {
            // validate form before passing change handler to EditModal
            const onChange = (v: Record<string, unknown>): void => {
              if (v) {
                setErrors(o => removeProps(o, [Object.keys(v)[0]]));
              }
              handlerFromContext(v);
            }
            return (
              <>
                <form className={classes.rootEditInput} autoComplete='off'>
                  <>
                    <Typography variant='h6'>General Information</Typography>
                    {/* render props that are text inputs */}
                    {inputTypes
                      .filter((f) => f.type === InputType.text || f.type === InputType.number)
                      .map((d, i) => {
                        const hasError = !!errors[d.key];
                        return (
                          <TextField
                            key={`${d.key}${i}`}
                            propName={d.key}
                            defaultValue={d.value}
                            type={d.type}
                            label={d.key}
                            disabled={false}
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
                      .map((d, i) => {
                        return (
                          <SelectCode
                            key={`${d.key}${i}`}
                            codeHeader={d.key}
                            label={d.key}
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
                        const checked = d.value === false || d.value === 'N' || d.value === 'false' ? false : true;
                        return <Checkbox key={`${d.key}${i}`} initialValue={checked} label={d.key} changeHandler={handlerFromContext} />;
                      })}
                  </>
                </form>
                {/* render collar assignment components if this is in edit mode */}
                {isEdit ? <AssignmentHistory animalId={editing.id} isEdit={isEdit} {...props} /> : null}
              </>
            );
          }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
