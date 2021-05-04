import { eInputType, FormInputType } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import { BCTW } from 'types/common_types';
import SelectCode from './SelectCode';

/**
 * @param iType
 * @param changeHandler
 * @param hasError
 * @param editing
 * @param canEdit
 * @param required
 * @param errText
 * @returns
 */
function CreateEditTextField<T extends BCTW>(
  iType: FormInputType,
  changeHandler: (v: Record<string, unknown>) => void,
  hasError: boolean,
  editing: T,
  canEdit: boolean,
  required: boolean,
  errText: string
): JSX.Element {
  return (
    <TextField
      outline={true}
      key={iType.key}
      propName={iType.key}
      defaultValue={iType.value}
      type={iType.type}
      label={editing.formatPropAsHeader(iType.key)}
      disabled={!canEdit}
      changeHandler={changeHandler}
      required={required}
      error={hasError}
      helperText={errText}
    />
  );
}

const createEditDateField = () => {
  // todo:

}
const createEditCheckboxField = () => {
  // todo:

}

function CreateEditSelectField<T extends BCTW>(
  iType: FormInputType,
  changeHandler: (v: Record<string, unknown>) => void,
  hasError: boolean,
  editing: T,
  canEdit: boolean,
  required: boolean
): JSX.Element {
  return (
    <SelectCode
      label={editing.formatPropAsHeader(iType.key)}
      disabled={!canEdit}
      key={iType.key}
      codeHeader={iType.key}
      defaultValue={iType.value as string}
      changeHandler={changeHandler}
      required={required}
      error={hasError}
      className={'select-control-small'}
    />
  );
}

function MakeEditFields<T extends BCTW>(
  iType: FormInputType,
  changeHandler: (v: Record<string, unknown>) => void,
  hasError: boolean,
  editing: T,
  canEdit: boolean,
  required: boolean,
  errText: string,
  span?: boolean,
  cl?: string
): React.ReactNode {
  let Comp;
  if (iType.type === eInputType.select) {
    Comp = CreateEditSelectField(iType, changeHandler, hasError, editing, canEdit, required);
  } else if (iType.type === eInputType.text || iType.type === eInputType.number || iType.type === eInputType.date) {
    Comp = CreateEditTextField(iType, changeHandler, hasError, editing, canEdit, required, errText);
  }
  return span ? (
    <span className={'edit-form-field-span'}>{Comp}</span>
  ) : (
    <div key={iType.key} className={'edit-form-field'}>
      {Comp}
    </div>
  );
}

export { CreateEditTextField, CreateEditSelectField, MakeEditFields };
