import React, { useState } from 'react';
import { Button, ButtonGroup, createStyles, makeStyles, TextField, Theme, Typography } from '@material-ui/core';
import { IAnimal } from 'types/animal';
import { getInputTypesOfT, InputType, isValidEditObject } from 'components/form/form_helpers';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import Checkbox from 'components/form/Checkbox';
import Modal from 'components/Modal';
import SelectCode from 'components/form/SelectCode';

/* todo:
  - how to handle add click
*/

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

const editableProps = ['nickname', 'animal_id', 'wlh_id', 'species', 'region', 'population_unit', 'calf_at_heel'];
const selectableProps = editableProps.slice(3, 6);

type ICritterModalProps = {
  show: boolean;
  onClose: (v: boolean) => void;
  isEdit: boolean;
  editing?: IAnimal;
};

export default function CritterModal({ show, onClose, isEdit, editing }: ICritterModalProps) {
  const classes = useStyles();
  const t = isEdit ? `Editing ${editing?.nickname ?? editing?.animal_id ?? ''}` : `Add a new animal`;
  const [canSave, setCanSave] = useState<boolean>(false);

  const handleSave = () => {};

  if (isValidEditObject(editing)) {
    const inputTypes = getInputTypesOfT<IAnimal>(editing, editableProps, selectableProps);
    return (
      <Modal open={show} handleClose={onClose} title={t}>
        <form className={classes.root} noValidate autoComplete='off'>
          <div>
            <Typography variant='h6'>General Information</Typography>
            {inputTypes
              .filter((f) => f.type === InputType.text || f.type === InputType.number)
              .map((d, i) => {
                return (
                  <TextField key={`${d.key}${i}`} defaultValue={d.value} type={d.type} label={d.key} disabled={false} />
                );
              })}
          </div>
          <div>
            <Typography variant='h6'>Group Information</Typography>
            {inputTypes
              .filter((f) => f.type === InputType.select)
              .map((d, i) => {
                return <SelectCode key={`${d.key}${i}`} codeHeader={d.key} label={d.key} val={d.value} />;
              })}
          </div>
          <div>
            <Typography variant='h6'>Individual Characteristics</Typography>
            {inputTypes
              .filter((f) => f.type === InputType.check)
              .map((d, i) => {
                let checked = d.value === 'N' || d.value === 'false' ? false : true;
                // console.log(`checked ${checked}, ${d.value}`);
                return <Checkbox key={`${d.key}${i}`} initialValue={checked} label={d.key} />;
              })}
          </div>
        </form>
        {isEdit ? <AssignmentHistory animalId={editing.id} isEdit={isEdit} /> : null}
        <ButtonGroup size='small' variant='contained' color='primary'>
          <Button onClick={handleSave} disabled={!canSave}>
            save animal
          </Button>
        </ButtonGroup>
      </Modal>
    );
  }
  return null;
}
