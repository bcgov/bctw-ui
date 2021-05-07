import { eInputType, FormInputType } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import SelectCode from './SelectCode';
import DateInput from 'components/form/Date';
import CheckBox from 'components/form/Checkbox';
import React from 'react';
import { columnToHeader } from 'utils/common';

type CreateInputBaseProps = {
  formType: FormInputType;
  handleChange: (v: Record<string, unknown>) => void;
};

type CreateInputProps = CreateInputBaseProps & {
  label?: string;
  disabled?: boolean;
  errorMessage?: string;
  required?: boolean;
  span?: boolean;
};


function CreateEditTextField(props: CreateInputProps): JSX.Element {
  const { key, value, type } = props.formType;
  return (
    <TextField
      outline={true}
      key={key}
      propName={key}
      defaultValue={typeof value === 'number' ? value as number : value as string}
      type={type}
      {...props}
      changeHandler={props.handleChange}
      error={!!props.errorMessage ?? false}
    />
  );
}

function CreateEditDateField({ formType, handleChange, label }: CreateInputProps): JSX.Element {
  return (
    <DateInput
      propName={formType.key}
      label={label}
      defaultValue={formType.value as Date}
      changeHandler={handleChange}></DateInput>
  );
}

function CreateEditCheckboxField({ formType, handleChange, label }: CreateInputProps): JSX.Element {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={formType.value as boolean}
      label={label}
      propName={formType.key}
    />
  );
}

function CreateEditSelectField({
  formType,
  handleChange,
  disabled,
  required,
  errorMessage,
  label
}: CreateInputProps): JSX.Element {
  return (
    <SelectCode
      style={{ width: '200px', marginRight: '10px' }}
      label={label}
      disabled={disabled}
      key={formType.key}
      codeHeader={formType.key}
      defaultValue={formType.value as string}
      changeHandler={handleChange}
      required={required}
      error={!!errorMessage?.length}
      className={'select-control-small'}
    />
  );
}

function MakeEditField({
  formType,
  handleChange,
  label,
  disabled = false,
  errorMessage = '',
  required = false,
  span = false
}: CreateInputProps): React.ReactNode {
  const inputType = formType.type;
  const lbl = label ?? columnToHeader(formType.key);
  let Comp: React.ReactNode;
  if (inputType === eInputType.check) {
    Comp = CreateEditCheckboxField({ formType, handleChange, label: lbl });
  } else if (inputType === eInputType.date) {
    Comp = CreateEditDateField({ formType, handleChange, label: lbl });
  } else if (inputType === eInputType.select) {
    Comp = CreateEditSelectField({ formType, handleChange, disabled, required, errorMessage, label: lbl });
  } else if (inputType === eInputType.text || inputType === eInputType.number) {
    Comp = CreateEditTextField({ formType, handleChange, label: lbl });
  }
  return span ? (
    <span className={'edit-form-field-span'}>{Comp}</span>
  ) : (
    <div key={formType.key} className={'edit-form-field'}>
      {Comp}
    </div>
  );
}

export { CreateEditTextField, CreateEditDateField, CreateEditCheckboxField, CreateEditSelectField, MakeEditField };
