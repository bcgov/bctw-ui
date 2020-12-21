import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import { INotificationMessage } from 'components/component_interfaces';
import Checkbox from 'components/form/Checkbox';
import { getInputTypesOfT, InputType, validateRequiredFields } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import SelectCode from 'components/form/SelectCode';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import EditModal from 'pages/data/common/EditModal';
import { Animal, IAnimal } from 'types/animal';
import { useState } from 'react';
import { removeProps } from 'utils/common';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '25ch'
      }
    }
  })
);

type ICritterModalProps = {
  editing: IAnimal;
  isEdit?: boolean;
  show: boolean;
  onClose: (v: boolean) => void;
  onSave: (o: any) => void;
  editableProps: string[];
  selectableProps: string[];
  onPost: (s: string) => void; // for passing up collar link response messages
  iMsg: INotificationMessage;
};

export default function CritterModal(props: ICritterModalProps) {
  const { isEdit, editing, editableProps, selectableProps, onClose, iMsg } = props;
  const classes = useStyles();

  const title = isEdit ? `Editing ${editing?.nickname ?? editing?.animal_id}` : `Add a new animal`;
  const requiredFields = CS.requiredProps;
  const [errors, setErrors] = useState({});

  const validate = (o: any): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const close = (v: boolean) => {
    setErrors({});
    onClose(v);
  }

  // retrieve input types from the object being edited
  const inputTypes = getInputTypesOfT<IAnimal>(editing, editableProps, selectableProps);

  return (
    <EditModal title={title} newT={new Animal()} onValidate={validate} onClose={close} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext) => {

          // do form validation before passing change handler to EditModal
          const onChange = (v: any) => {
            if (v) {
              setErrors(o => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v);
          }

          return (
            <>
              <form className={classes.root} autoComplete='off'>
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
                      let checked = d.value === false || d.value === 'N' || d.value === 'false' ? false : true;
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
