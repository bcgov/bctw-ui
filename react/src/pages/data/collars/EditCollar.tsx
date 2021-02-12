import { Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { getInputTypesOfT, InputType, validateRequiredFields } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import SelectCode from 'components/form/SelectCode';
import useModalStyles from 'components/modal/modal_styles';
import { CollarStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import { useDataStyles } from 'pages/data/common/data_styles';
import EditModal from 'pages/data/common/EditModal';
import { useEffect, useState } from 'react';
import { Collar, eNewCollarType } from 'types/collar';
import { removeProps } from 'utils/common';

export default function EditCollar(props: CritterCollarModalProps<Collar>): JSX.Element {
  const { isEdit, editing, editableProps, selectableProps } = props;
  const classes = useDataStyles();
  const modalClasses = useModalStyles();

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<eNewCollarType>(eNewCollarType.Other);
  const [newCollar, setNewCollar] = useState<Collar>(editing);

  const title = isEdit ? `Editing device ${editing.device_id}` : `Add a new ${collarType} collar`;
  const requiredFields = CS.requiredProps;
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<{key: string, type: InputType, value: unknown}[]>([]);

  useEffect(() => {
    setInputTypes(getInputTypesOfT<Collar>(isEdit ? editing : newCollar, editableProps, selectableProps));
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
  }

  // render the choose collar type form if the add button was clicked
  const chooseCollarType = ():JSX.Element => {
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
    <EditModal title={title} newT={new Collar()} onValidate={validate} onReset={close} isEdit={isEdit} hideSave={isAddNewCollar} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v);
          };

          return (
            <>
              {isAddNewCollar ? (
                chooseCollarType()
              ) : (
                <form className={classes.rootEditInput} autoComplete='off'>
                  <>
                    <Typography variant='h6'>Collar Information</Typography>
                    {/* render text inputs */}
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
                    <Typography variant='h6'>Other Information</Typography>
                    {/* render props that are selects */}
                    {inputTypes
                      .filter((f) => f.type === InputType.select)
                      .map((d) => {
                        return (
                          <SelectCode
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
                </form>
              )}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}

