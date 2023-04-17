import { Itaxon } from 'types/animal';
import { ICode } from 'types/code';
import { FormFieldObject } from 'types/form_types';

const TAXON_STR = 'taxon';
/**
 * Used to hide individual form elements from the UI - used with taxon related form fields
 * @param field FormFieldObject
 * @param taxon Name of taxon to search object
 * @returns Boolean
 */
const showField = <T>(field: FormFieldObject<T>, taxon: Itaxon): boolean => {
  //If field has length of 0, field applies to all taxon
  if (!field.taxon.length) return true;
  if (!taxon?.id) {
    return false;
  }
  return field.taxon.includes(taxon.id);
};

/**
 * Used to hide FormSection from UI
 * @param fields Array of FormFieldObjects
 * @param taxon Name of taxon to search object
 * @returns Boolean
 */
const hideSection = <T>(fields: FormFieldObject<T>[], taxon: Itaxon): boolean => {
  return !fields.map((f) => showField(f, taxon)).includes(true);
};

/**
 * Casts a prop used in a formFieldObject to the appropriate cast based on taxon
 * @param codeHeader prop from formFieldObject
 * @param cast taxon related cast
 * @param taxon taxon object
 * @returns casted codeHeader as string
 */
// const castCodeHeader = (codeHeader: string, cast?: taxonCast, taxon?: Itaxon):string => {
//   if(!cast) return codeHeader;
//   if(!taxon) return codeHeader;
//   if(!cast[taxon.key]) return codeHeader;
//   return cast[taxon.key];
// }

/**
 *
 * @param code
 * @returns taxon object
 */
const formatCodeToTaxon = (code: ICode): Itaxon => {
  return {
    id: String(code?.id),
    //key: headerToColumn(code?.description),
    name: code?.description
  };
};

export { showField, hideSection, formatCodeToTaxon, TAXON_STR };
