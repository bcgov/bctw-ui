import { createContext } from 'react';
import { InboundObj } from 'types/form_types';
/**
 * used in EditModal component so that when an input is changed
 * in a form (child of EditModal), the input change handler can be
 * called in the EditModal instead of the form
 */
const ChangeContext = createContext((o: InboundObj) => {
  /* do nothing */
});
export default ChangeContext;
