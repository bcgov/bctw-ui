import TextField from 'components/form/TextInput';
import NumberField from 'components/form/NumberInput';
import SelectCode from './SelectCode';
import DateInput, { DateInputProps } from 'components/form/Date';
import DateTimeInput from 'components/form/DateTimeInput';
import CheckBox from 'components/form/Checkbox';
import { ReactElement, ReactNode } from 'react';
import { removeProps } from 'utils/common_helpers';
import { eInputType, FormChangeEvent, FormFieldObject, KeyType, Overlap } from 'types/form_types';
import dayjs, { Dayjs } from 'dayjs';
import { BCTWFormat } from 'types/common_types';
import { Tooltip } from 'components/common'
import { BaseTextFieldProps, InputProps } from '@material-ui/core';

type CreateInputBaseProps = {
  value: unknown;
  prop: KeyType;
  type: eInputType;
  handleChange: FormChangeEvent;
};

type CreateInputProps = CreateInputBaseProps 
& Pick<InputProps, 'rows' | 'multiline' | 'disabled' | 'required'> 
& Pick<DateInputProps, 'minDate' |'maxDate'> 
& Pick<BaseTextFieldProps, 'label'> & {
  codeName?: string;
  errorMessage?: string;
  span?: boolean;
};

// text and number field handler
function CreateEditTextField(props: CreateInputProps): ReactElement {
  const { prop, type, value, errorMessage, handleChange } = props;
  // note: passing 'value' will cause the component to consider itself 'controlled'
  const propsToPass = removeProps(props, ['value', 'errorMessage', 'codeName']);
  return typeof value === 'number' ? (
    <NumberField
      propName={prop}
      key={`input-num-${String(prop)}`}
      defaultValue={value as number}
      changeHandler={handleChange}
      {...propsToPass}
    />
  ) : (
    <TextField
      key={`input-text-${String(prop)}`}
      propName={prop}
      defaultValue={value as string}
      type={type}
      changeHandler={handleChange}
      error={!!errorMessage ?? false}
      helperText={errorMessage}
      {...propsToPass}
    />
  );
}

function CreateEditMultilineTextField(props: CreateInputProps): ReactElement {
  const newProps = Object.assign({multiline: true, rows: 1, style: { width: '100%'}}, props);
  return CreateEditTextField(newProps);
}

// date field handler
function CreateEditDateField({ prop, value, handleChange, label, disabled }: CreateInputProps): ReactElement {
  return (
    <DateInput
      propName={prop}
      label={label}
      defaultValue={value as Dayjs}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-date-${String(prop)}`}
    />
  );
}

// datetime field handler
function CreateEditDateTimeField({ prop, value, handleChange, label, disabled, required, minDate, maxDate}: CreateInputProps): ReactElement {
  return (
    <DateTimeInput
      propName={prop}
      label={label}
      defaultValue={dayjs(value as Date)}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-dt-${String(prop)}`}
      required={required}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}

// checkbox field handler
function CreateEditCheckboxField({ prop, value, handleChange, label, disabled }: CreateInputProps): ReactElement {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={value as boolean}
      label={label}
      propName={prop}
      disabled={disabled}
      key={`input-check-${String(prop)}`}
    />
  );
}

// select component handler
function CreateEditSelectField({
  value,
  prop,
  handleChange,
  disabled,
  required,
  errorMessage,
  label,
  codeName
}: CreateInputProps): ReactElement {
  return (
    <SelectCode
      style={{ width: '200px', marginRight: '10px' }}
      label={label}
      disabled={disabled}
      codeHeader={codeName ?? String(prop)}
      defaultValue={typeof value === 'string' ? value : ''}
      changeHandler={handleChange}
      required={required}
      error={!!errorMessage?.length}
      propName={codeName || undefined}
    />
  );
}

// returns the funtion to create the form component based on input type
const getInputFnFromType = (inputType: eInputType): ((props: unknown) => ReactElement ) => {
  switch (inputType) {
    case eInputType.check:
      return CreateEditCheckboxField;
    case eInputType.datetime:
      return CreateEditDateTimeField;
    case eInputType.date:
      return CreateEditDateField;
    case eInputType.code:
      return CreateEditSelectField;
    case eInputType.multiline:
      return CreateEditMultilineTextField;
    default:
      return CreateEditTextField;
  }
};

/**
 * the "main" form component creation handler.
 * @param obj of @type {T} must implement the Format type (so it can format the input label)
 * @param formField @type {U} all keys should be of keyof @type {T}
 * fixme: still need to improve typing
 */
function CreateFormField<T extends BCTWFormat<T>, U extends Overlap<T, U>>(
  obj: T,
  formField: FormFieldObject<U> | undefined,
  handleChange: FormChangeEvent,
  inputProps?: Partial<CreateInputProps>,
  displayBlock = false,
): ReactNode {
  if (formField === undefined) {
    return null;
  }
  const { prop, type, tooltip } = formField;

  const toPass = {
    // fixme: why wont this type if U overlaps T?
    value: obj[prop as keyof T],
    handleChange,
    label: obj.formatPropAsHeader(prop as keyof T),
    // todo: is this needed
    // key: `${type}-${prop}`,
    ...formField,
    ...inputProps
  };
  let Comp = getInputFnFromType(type)(toPass);

  if (tooltip) {
    Comp = (
      <Tooltip title={tooltip} placement={'right-end'} enterDelay={600}>
        {Comp}
      </Tooltip>
    );
  }
  return displayBlock ? <div>{Comp}</div> : Comp;
}

export { CreateEditTextField, CreateEditDateField, CreateEditCheckboxField, CreateEditSelectField, CreateFormField };
