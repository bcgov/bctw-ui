import { AttachedCritter, getAnimalFormFields } from 'types/animal';
import { Collar, getDeviceFormFields } from 'types/collar';
import { FormFieldObject } from 'types/form_types';

export type WorkflowFormField = FormFieldObject<Partial<Collar> & Partial<AttachedCritter>>;
const allFields: WorkflowFormField[] = [...getDeviceFormFields(), ...getAnimalFormFields()];
export const wfFields = new Map(allFields?.map((f) => [f.prop, f]));
