import { ISpecies } from 'types/animal';
import { ICode } from 'types/code';
import { FormFieldObject } from 'types/form_types';

const SPECIES_STR = 'species';
/**
 * Used to hide individual form elements from the UI - used with species related form fields
 * @param field FormFieldObject
 * @param species Name of species to search object
 * @returns Boolean
 */
const showField = <T>(field: FormFieldObject<T>, species: ISpecies): boolean => {
  //If field has length of 0, field applies to all species
  if (!field.species.length) return true;
  if (!species?.id) {
    return false;
  }
  return field.species.includes(species.id);
};

/**
 * Used to hide FormSection from UI
 * @param fields Array of FormFieldObjects
 * @param species Name of species to search object
 * @returns Boolean
 */
const hideSection = <T>(fields: FormFieldObject<T>[], species: ISpecies): boolean => {
  return !fields.map((f) => showField(f, species)).includes(true);
};

/**
 * Casts a prop used in a formFieldObject to the appropriate cast based on species
 * @param codeHeader prop from formFieldObject
 * @param cast species related cast
 * @param species species object
 * @returns casted codeHeader as string
 */
// const castCodeHeader = (codeHeader: string, cast?: SpeciesCast, species?: ISpecies):string => {
//   if(!cast) return codeHeader;
//   if(!species) return codeHeader;
//   if(!cast[species.key]) return codeHeader;
//   return cast[species.key];
// }

/**
 *
 * @param code
 * @returns species object
 */
const formatCodeToSpecies = (code: ICode): ISpecies => {
  return {
    id: String(code?.id),
    name: code?.description
  };
};

export { showField, hideSection, formatCodeToSpecies, SPECIES_STR };
