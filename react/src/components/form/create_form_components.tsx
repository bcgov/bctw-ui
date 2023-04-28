import { BaseTextFieldProps, FormControlLabelProps, InputProps } from '@mui/material';
import { Tooltip } from 'components/common';
import CheckBox from 'components/form/Checkbox';
import DateInput, { DateInputProps } from 'components/form/Date';
import DateTimeInput from 'components/form/DateTimeInput';
import NumberField from 'components/form/NumberInput';
import TextField from 'components/form/TextInput';
import { useTaxon } from 'contexts/TaxonContext';
import { CbSelect, CbSelectProps } from 'critterbase/components/CbSelect';
import { ICbRouteKey } from 'critterbase/types';
import dayjs, { Dayjs } from 'dayjs';
import { CSSProperties, ReactElement, ReactNode } from 'react';
import { Critter, AttachedCritter } from 'types/animal';
import { ICodeFilter } from 'types/code';
import { BCTWFormat } from 'types/common_types';
import { WorkflowFormField } from 'types/events/event';
import { FormChangeEvent, FormFieldObject, KeyType, Overlap, eInputType } from 'types/form_types';
import { removeProps } from 'utils/common_helpers';
import { showField } from 'utils/taxon';
import SelectCode from './SelectCode';
import { type } from 'os';

type CreateInputBaseProps = {
  value: unknown;
  prop: KeyType;
  type: eInputType;
  handleChange: FormChangeEvent;
};

export type CreateInputProps = CreateInputBaseProps &
  Pick<InputProps, 'rows' | 'multiline' | 'disabled' | 'required' | 'style'> &
  Pick<DateInputProps, 'minDate' | 'maxDate'> &
  Pick<BaseTextFieldProps, 'label'> &
  Pick<FormControlLabelProps, 'labelPlacement'> & {
    codeName?: string;
    errorMessage?: string;
    span?: boolean;
    validate?: <T>(input: T) => string;
    maxwidth?: boolean;
    multiple?: boolean;
    handleChangeMultiple?: (o: ICodeFilter[]) => void;
  };

// text and number field handler
function CreateEditTextField(props: CreateInputProps): ReactElement {
  const { prop, type, value, errorMessage, handleChange, validate } = props;
  // note: passing 'value' will cause the component to consider itself 'controlled'
  const propsToPass = removeProps(props, ['value', 'errorMessage', 'codeName']);
  return type === eInputType.number ? (
    <NumberField
      propName={prop}
      key={`input-num-${String(prop)}`}
      defaultValue={value as number}
      validate={validate}
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
  const newProps = Object.assign({ multiline: true, rows: 1, style: { width: '100%' } }, props);
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
function CreateEditDateTimeField({
  prop,
  value,
  handleChange,
  label,
  disabled,
  required,
  minDate,
  maxDate
}: CreateInputProps): ReactElement {
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
function CreateEditCheckboxField({
  prop,
  value,
  handleChange,
  label,
  disabled,
  labelPlacement
}: CreateInputProps): ReactElement {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={value as boolean}
      label={label}
      labelPlacement={labelPlacement}
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
  handleChangeMultiple,
  disabled,
  required,
  errorMessage,
  label,
  codeName,
  style,
  multiple
}: CreateInputProps): ReactElement {
  return (
    <SelectCode
      style={style}
      key={`${label}-select`}
      label={label}
      disabled={disabled}
      multiple={multiple}
      codeHeader={codeName ?? String(prop)}
      defaultValue={typeof value === 'string' ? value : ''}
      defaultValues={multiple ? (value as string[]) : []}
      changeHandler={handleChange}
      changeHandlerMultiple={handleChangeMultiple}
      required={required}
      error={!!errorMessage?.length}
      propName={String(prop)}
    />
  );
}

function CreateCbSelectField(props: CbSelectProps): ReactElement {
  return <CbSelect {...props} />;
}

// returns the funtion to create the form component based on input type
const getInputFnFromType = (inputType: eInputType): ((props: unknown) => ReactElement) => {
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
    case eInputType.cb_select:
      return CreateCbSelectField;
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
  style = {}
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
    style,
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
interface ItaxonFormField {
  obj: Critter | AttachedCritter;
  formField: WorkflowFormField;
  handleChange: FormChangeEvent;
  inputProps?: Partial<CreateInputProps>;
  displayBlock?: boolean;
  style?: CSSProperties;
}
function CreateTaxonFormField({
  obj,
  formField,
  handleChange,
  inputProps,
  displayBlock = false,
  style = {}
}: ItaxonFormField): JSX.Element {
  const taxon = useTaxon();
  if (!showField(formField, taxon)) {
    return null;
  } else {
    return CreateFormField(obj, formField, handleChange, inputProps, displayBlock, style) as JSX.Element;
  }
}
export {
  CreateEditTextField,
  CreateEditDateField,
  CreateEditCheckboxField,
  CreateEditSelectField,
  CreateFormField,
  CreateTaxonFormField
};
