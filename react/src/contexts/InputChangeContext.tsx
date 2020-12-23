import { createContext } from 'react';
/**
 * used in EditModal component so that when an input is changed
 * in a form (child of EditModal), the input change handler can be
 * called in the EditModal instead of the form
 */
const ChangeContext = createContext((o: Record<string, unknown>) => {/* do nothing */});
export default ChangeContext;
