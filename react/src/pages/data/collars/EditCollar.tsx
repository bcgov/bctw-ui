import { Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import { getInputTypesOfT, InputType, validateRequiredFields } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import SelectCode from 'components/form/SelectCode';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { getSelectCodeLabel, removeProps } from 'utils/common';
import {CollarStrings as CS} from 'constants/strings';
import { Collar } from 'types/collar';
import { useDataStyles } from 'pages/data/common/data_styles';

export default function EditCollar(props: CritterCollarModalProps<Collar>): JSX.Element {
  const { isEdit, editing, editableProps, selectableProps, handleClose, collarType } = props;
  const classes = useDataStyles();

  const title = isEdit ? `Editing device ${editing.device_id}` : `Add a new ${collarType} collar`;
  const requiredFields = CS.requiredProps;
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  const validate = (o: Collar): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const close = (v: boolean): void => {
    setErrors({});
    handleClose(v);
  }

  // retrieve input types from the object being edited
  const inputTypes = getInputTypesOfT<Collar>(editing, editableProps, selectableProps);
  // console.log(JSON.stringify(inputTypes.filter(f => f.key==='collar_make')))
  // console.log(JSON.stringify(inputTypes))//.filter(f => f.key==='collar_make')))

  return (
    <EditModal title={title} newT={new Collar()} onValidate={validate} handleClose={close} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {

          // do form validation before passing change handler to EditModal
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
                  <Typography variant='h6'>Collar Information</Typography>
                  {/* render text inputs */}
                  {inputTypes
                    .filter((f) => f.type === InputType.text || f.type === InputType.number)
                    .map((d, i) => {
                      const hasError = !!errors[d.key];
                      return (
                        <>
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
                        </>
                      );
                    })}
                </>
                <>
                  <Typography variant='h6'>Other Information</Typography>
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
                          error={!!errors[getSelectCodeLabel(d.key)]}
                        />
                      );
                    })}
                </>
              </form>
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
