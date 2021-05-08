import { useState, useEffect } from 'react';
import { Animal, critterFormFields } from 'types/animal';
import { Paper } from '@material-ui/core';
import { eCritterPermission } from 'types/user';
import { getInputTypesOfT, validateRequiredFields, FormInputType } from 'components/form/form_helpers';
import ChangeContext from 'contexts/InputChangeContext';
import { CritterCollarModalProps } from 'components/component_interfaces';
import { CritterStrings as CS } from 'constants/strings';
import { MakeEditField } from 'components/form/create_form_components';
import { removeProps } from 'utils/common';
import { WorkflowStrings } from 'constants/strings';

type IMortalityWorkflowProps<T> = CritterCollarModalProps<T> & {
  animalId: string;
  canEdit: boolean;
};

export default function MortalityWorkflow(props: IMortalityWorkflowProps<Animal>): JSX.Element {
  const { animalId, isEdit, editing } = props;
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const canEdit = !isEdit ? true : editing.permission_type === eCritterPermission.change;
  const requiredFields = CS.requiredProps;

  useEffect(() => {
    setInputTypes(
      getInputTypesOfT<Animal>(
        editing,
        allFields.map((a) => a.prop),
        allFields.filter((f) => f.isCode).map((a) => a.prop)
      )
    );
  }, [editing]);

  const {
    mortalityFields,
  } = critterFormFields;
  const allFields = [
    ...mortalityFields,
  ];

  return (
    <>
    <ChangeContext.Consumer>
      {(handlerFromContext): JSX.Element => {
        // override the modal's onChange function
        const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
          if (v) {
            setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
          }
          handlerFromContext(v, modifyCanSave);
        };
        const makeFormField = (formType: FormInputType): React.ReactNode => {
          return MakeEditField({
            formType,
            handleChange: onChange,
            disabled: !canEdit,
            required: requiredFields.includes(formType.key),
            errorMessage: !!errors[formType.key] && (errors[formType.key] as string),
            span: true
          });
        };
        return (
          <div>
            <h2 className={'dlg-full-body-subtitle'}>{WorkflowStrings.mortalityWorkflowTitle}</h2>
            <Paper elevation={3} className={'dlg-full-body-details'}>
              <div className={'dlg-details-section'}>
                <h3>Mortality Details</h3>
                  {inputTypes
                    .filter((f) => mortalityFields.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f))}
              </div>
            </Paper>
          </div>
        );
      }}
      </ChangeContext.Consumer>
    </>
  );
}