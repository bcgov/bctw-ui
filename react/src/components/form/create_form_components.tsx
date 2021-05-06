import { eInputType, FormInputType } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import { BCTW } from 'types/common_types';
import SelectCode from './SelectCode';
import DateInput from 'components/form/Date';
import CheckBox from 'components/form/Checkbox';
import React from 'react';

type CreateInputBaseProps<T> = {
  editing: T;
  formType: FormInputType;
  handleChange: (v: Record<string, unknown>) => void;
};

type CreateInputProps<T> = CreateInputBaseProps<T> & {
  errorMessage: string;
  isEdit: boolean;
  isError: boolean;
  isRequired: boolean;
};

const baseStyle = {marginRight: '10px'};

function CreateEditTextField<T extends BCTW>({
  editing,
  errorMessage,
  formType,
  isEdit,
  isError,
  isRequired,
  handleChange
}: CreateInputProps<T>): JSX.Element {
  return (
    <TextField
      outline={true}
      key={formType.key}
      style={{width: '200px', ...baseStyle}}
      propName={formType.key}
      defaultValue={formType.value}
      type={formType.type}
      label={editing.formatPropAsHeader(formType.key)}
      disabled={!isEdit}
      changeHandler={handleChange}
      required={isRequired}
      error={isError}
      helperText={errorMessage}
    />
  );
}

function CreateEditDateField<T extends BCTW>({
  editing,
  formType,
  handleChange
}: CreateInputBaseProps<T>): JSX.Element {
  return (
    <DateInput
      propName={formType.key}
      label={editing.formatPropAsHeader(formType.key)}
      defaultValue={formType.value as Date}
      changeHandler={handleChange}></DateInput>
  );
}

function CreateEditCheckboxField<T extends BCTW>({
  editing,
  formType,
  handleChange
}: CreateInputBaseProps<T>): JSX.Element {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={formType.value as boolean}
      label={editing.formatPropAsHeader(formType.key)}
      propName={formType.key}
    />
  );
}

function CreateEditSelectField<T extends BCTW>({
  editing,
  formType,
  isEdit,
  isError,
  isRequired,
  handleChange
}: CreateInputProps<T>): JSX.Element {
  return (
    <SelectCode
      style={{width: '200px', ...baseStyle }}
      label={editing.formatPropAsHeader(formType.key)}
      disabled={!isEdit}
      key={formType.key}
      codeHeader={formType.key}
      defaultValue={formType.value as string}
      changeHandler={handleChange}
      required={isRequired}
      error={isError}
      className={'select-control-small'}
    />
  );
}

function MakeEditFields<T extends BCTW>(
  props: CreateInputProps<T>,
  span = false
): React.ReactNode {
  const inputType = props.formType.type;
  let Comp: React.ReactNode;
  if (inputType === eInputType.check) {
    Comp = CreateEditCheckboxField(props);
  } else if (inputType === eInputType.date) {
    Comp = CreateEditDateField(props);
  } else if (inputType === eInputType.select) {
    Comp = CreateEditSelectField(props);
  } else if (inputType === eInputType.text || inputType === eInputType.number) {
    Comp = CreateEditTextField(props);
  }
  return span ? (
    <span className={'edit-form-field-span'}>{Comp}</span>
  ) : (
    <div key={props.formType.key} className={'edit-form-field'}>
      {Comp}
    </div>
  );
}

export { CreateEditTextField, CreateEditSelectField, MakeEditFields };
