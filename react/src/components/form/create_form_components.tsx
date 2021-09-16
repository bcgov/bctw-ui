import TextField from 'components/form/TextInput';
import NumberField from 'components/form/NumberInput';
import SelectCode from './SelectCode';
import DateInput from 'components/form/Date';
import DateTimeInput from 'components/form/DateTimeInput';
import CheckBox from 'components/form/Checkbox';
import { ReactNode } from 'react';
import { removeProps } from 'utils/common_helpers';
import { eInputType, FormChangeEvent, FormFieldObject } from 'types/form_types';
import dayjs, { Dayjs } from 'dayjs';
import { BCTWFormat } from 'types/common_types';
import { Tooltip } from 'components/common'

type CreateInputBaseProps<T> = {
  value: unknown;
  prop: keyof T;
  type: eInputType;
  handleChange: (v: Record<string, unknown>) => void;
};

type CreateInputProps<T> = CreateInputBaseProps<T> & {
  codeName?: string;
  label?: string;
  disabled?: boolean;
  errorMessage?: string;
  required?: boolean;
  span?: boolean;
};

// text and number field handler
function CreateEditTextField<T>(props: CreateInputProps<T>): JSX.Element {
  const { prop, type, value } = props;
  // note: passing 'value' will cause the component to consider itself 'controlled'
  const propsToPass = removeProps(props, ['value', 'errorMessage', 'codeName']);
  const propName = prop as string;
  return typeof value === 'number' ? (
    <NumberField
      propName={propName}
      key={`input-num-${propName}`}
      defaultValue={value as number}
      changeHandler={props.handleChange}
      {...propsToPass}
    />
  ) : (
    <TextField
      key={`input-text-${propName}`}
      propName={propName}
      defaultValue={value as string}
      type={type}
      changeHandler={props.handleChange}
      error={!!props.errorMessage ?? false}
      helperText={props.errorMessage}
      {...propsToPass}
    />
  );
}

// date field handler
function CreateEditDateField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): JSX.Element {
  return (
    <DateInput
      propName={prop as string}
      label={label}
      defaultValue={value as Dayjs}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-date-${prop}`}
    />
  );
}

// datetime field handler
function CreateEditDateTimeField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): JSX.Element {
  return (
    <DateTimeInput
      propName={prop as string}
      label={label}
      defaultValue={dayjs(value as Date)}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-dt-${prop}`}
    />
  );
}

// checkbox field handler
function CreateEditCheckboxField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): JSX.Element {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={value as boolean}
      label={label}
      propName={prop as string}
      disabled={disabled}
      key={`input-check-${prop}`}
    />
  );
}

// select component handler
function CreateEditSelectField<T>({
  value,
  prop,
  handleChange,
  disabled,
  required,
  errorMessage,
  label,
  codeName
}: CreateInputProps<T>): JSX.Element {
  return (
    <SelectCode
      style={{ width: '200px', marginRight: '10px' }}
      label={label}
      disabled={disabled}
      key={prop as string}
      codeHeader={codeName ?? (prop as string)}
      defaultValue={(value as string) ?? ''}
      changeHandler={handleChange}
      required={required}
      error={!!errorMessage?.length}
      className={'select-control-small'}
      propName={codeName ? (prop as string) : undefined}
    />
  );
}

// returns the funtion to create the form component based on input type
const getInputFnFromType = (inputType: eInputType): ((props: unknown) => JSX.Element) => {
  switch (inputType) {
    case eInputType.check:
      return CreateEditCheckboxField;
    case eInputType.datetime:
      return CreateEditDateTimeField;
    case eInputType.date:
      return CreateEditDateField;
    case eInputType.code:
      return CreateEditSelectField;
    default:
      return CreateEditTextField;
  }
};

/**
 * the "main" form component creation handler.
 */
function FormFromFormfield<T extends BCTWFormat<T>>(
  obj: T,
  formField: FormFieldObject<T> | undefined,
  handleChange: FormChangeEvent,
  disabled = false,
  displayBlock = false
): ReactNode {
  if (formField === undefined) {
    return null;
  }
  const { type, prop, required, codeName, tooltip } = formField;
  const toPass = {
    prop,
    type,
    value: obj[prop],
    handleChange,
    label: obj.formatPropAsHeader(prop),
    disabled,
    required,
    codeName,
    key: `${type}-${prop}`
  };
  const Comp = getInputFnFromType(type)(toPass);
  // if (tooltip) {
  //   Comp = (
  //     <Tooltip title={tooltip} placement={'right-end'} enterDelay={750}>
  //       {Comp}
  //     </Tooltip>
  //   );
  // }
  return displayBlock ? <div>{Comp}</div> : Comp;
}

export { CreateEditTextField, CreateEditDateField, CreateEditCheckboxField, CreateEditSelectField, FormFromFormfield };
