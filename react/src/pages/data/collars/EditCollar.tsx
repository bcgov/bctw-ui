import { Paper, Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { MakeEditFields } from 'components/form/create_form_components';
import { getInputTypesOfT, validateRequiredFields, FormInputType } from 'components/form/form_helpers';
import useModalStyles from 'components/modal/modal_styles';
import { CollarStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useEffect, useState } from 'react';
import { Collar, collarFormFields, eNewCollarType } from 'types/collar';
import { removeProps } from 'utils/common';

export default function EditCollar(props: CritterCollarModalProps<Collar>): JSX.Element {
  const { isEdit, editing } = props;
  const modalClasses = useModalStyles();

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<eNewCollarType>(eNewCollarType.Other);
  const [newCollar, setNewCollar] = useState<Collar>(editing);

  const title = isEdit ? `Editing device ${editing.device_id}` : `Add a new ${collarType} collar`;
  const requiredFields = CS.requiredProps;
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);

  useEffect(() => {
    const ipt = getInputTypesOfT<Collar>(
      isEdit ? editing : newCollar,
      allFields.map((a) => a.prop),
      allFields.filter((f) => f.isCode).map((r) => r.prop)
    );
    setInputTypes(ipt);
  }, [editing, newCollar]);

  const validate = (o: Collar): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const close = (): void => {
    setCollarType(eNewCollarType.Other);
    setErrors({});
  };

  const handleChooseCollarType = (type: eNewCollarType): void => {
    setCollarType(type);
    setNewCollar(new Collar(type));
  };

  const { generalFields, networkFields, statusFields } = collarFormFields;
  const allFields: { prop: string; isCode?: boolean }[] = [...generalFields, ...networkFields, ...statusFields];

  const makeField = (
    iType: FormInputType,
    changeHandler: (v: Record<string, unknown>) => void,
    hasError: boolean,
    span?: boolean
  ): React.ReactNode => {
    const isRequired = requiredFields.includes(iType.key);
    const errorText = hasError && (errors[iType.key] as string);
    return MakeEditFields(iType, changeHandler, hasError, editing, true, isRequired, errorText, span);
  };

  // render the choose collar type form if the add button was clicked
  const chooseCollarType = (): JSX.Element => {
    return (
      <>
        <Typography>{CS.addCollarTypeText}</Typography>
        <div color='primary' className={modalClasses.btns}>
          <Button onClick={(): void => handleChooseCollarType(eNewCollarType.VHF)}>{eNewCollarType.VHF}</Button>
          <Button onClick={(): void => handleChooseCollarType(eNewCollarType.Vect)}>{eNewCollarType.Vect}</Button>
        </div>
      </>
    );
  };

  const isAddNewCollar = !isEdit && collarType === eNewCollarType.Other;
  return (
    <EditModal
      title={title}
      newT={new Collar()}
      onValidate={validate}
      onReset={close}
      isEdit={isEdit}
      hideSave={isAddNewCollar}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              {isAddNewCollar ? (
                chooseCollarType()
              ) : (
                <>
                  <form className='rootEditInput' autoComplete='off'>
                    <Paper className={'paper-edit'} elevation={3}>
                      <Typography className={'edit-form-header'} variant='h5'>General Information</Typography>
                      {inputTypes
                        .filter((f) => generalFields.map((x) => x.prop).includes(f.key))
                        .map((d) => makeField(d, onChange, !!errors[d.key]))}
                    </Paper>
                    <Paper className={'paper-edit'} elevation={3}>
                      <Typography className={'edit-form-header'} variant='h5'>Frequency and Network</Typography>
                      {inputTypes
                        .filter((f) => networkFields.map((x) => x.prop).includes(f.key))
                        .map((d) => makeField(d, onChange, !!errors[d.key]))}
                    </Paper>
                    <Paper className={'paper-edit'} elevation={3}>
                      <Typography className={'edit-form-header'} variant='h5'>Status Information</Typography>
                      {inputTypes
                        .filter((f) => statusFields.map((x) => x.prop).includes(f.key))
                        .map((d) => makeField(d, onChange, !!errors[d.key]))}
                    </Paper>
                  </form>
                </>
              )}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
