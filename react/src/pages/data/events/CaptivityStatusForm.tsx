import { Box } from '@material-ui/core';
import { FormFromFormfield } from 'components/form/create_form_components';
import { eInputType, FormChangeEvent } from 'types/form_types';
import MortalityEvent, { MortalityFormField } from 'types/events/mortality_event';
import { boxRowProps } from './EventComponents';
import { EventFormStrings } from 'constants/strings';
/**
 *
 * todo: handle more than just a mortality event
 */
type CaptivityStatusFormProps = {
  event: MortalityEvent;
  handleFormChange: FormChangeEvent;
};

export default function CaptivityStatusForm({ event, handleFormChange }: CaptivityStatusFormProps): JSX.Element {
  const captivityFields: Required<Pick<MortalityFormField, 'captivity_status' | 'mortality_captivity_status'>> = {
    captivity_status: {
      prop: 'captivity_status',
      type: eInputType.check,
      tooltip: <p>{EventFormStrings.animal.captivity}</p>
    },
    mortality_captivity_status: {
      prop: 'mortality_captivity_status',
      type: eInputType.code,
      codeName: 'mortality_habitat',
      tooltip: <p>{EventFormStrings.animal.mort_captivity_status}</p>
    }
  };
  return (
    <Box {...boxRowProps} mt={2}>
      {/* captivity_status is always disabled in mortality workflow */}
      {FormFromFormfield(event, captivityFields.captivity_status, handleFormChange, true)}
      {FormFromFormfield(event, captivityFields.mortality_captivity_status, handleFormChange)}
    </Box>
  );
}
