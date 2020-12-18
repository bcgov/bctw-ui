import React from 'react';
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import { IAnimal, Animal } from 'types/animal';
import { getInputTypesOfT, InputType } from 'components/form/form_helpers';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import Checkbox from 'components/form/Checkbox';
import TextField from 'components/form/Input';
import SelectCode from 'components/form/SelectCode';
import EditModal from 'pages/data/common/EditModal';
import ChangeContext from 'contexts/InputChangeContext';

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
  error: string;
};

export default function CritterModal(props: ICritterModalProps) {
  const { isEdit, editing, editableProps, selectableProps, error } = props;
  const classes = useStyles();

  const title = isEdit ? `Editing ${editing?.nickname ?? editing?.animal_id }` : `Add a new animal`;
  const inputTypes = getInputTypesOfT<IAnimal>(editing, editableProps, selectableProps);

  // console.log(`editing: ${JSON.stringify(editing)}`);
  return (
    <EditModal title={title} newT={new Animal()} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext) => {
          return (
            <>
              <form className={classes.root} noValidate autoComplete='off'>
                <>
                  <Typography variant='h6'>General Information</Typography>
                  {/* render props that are text inputs */}
                  {inputTypes
                    .filter((f) => f.type === InputType.text || f.type === InputType.number)
                    .map((d, i) => {
                      return (
                        <TextField
                          key={`${d.key}${i}`}
                          propName={d.key}
                          defaultValue={d.value}
                          type={d.type}
                          label={d.key}
                          disabled={false}
                          changeHandler={handlerFromContext}
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
                          changeHandler={handlerFromContext}
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
