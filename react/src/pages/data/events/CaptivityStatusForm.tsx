import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import { eInputType, FormChangeEvent } from 'types/form_types';
import MortalityEvent, { MortalityFormField } from 'types/events/mortality_event';
import { boxSpreadRowProps } from './EventComponents';
import { EventFormStrings } from 'constants/strings';
/**
 *
 * todo: handle more than just a mortality event
 */
type CaptivityStatusFormProps = {
  event: MortalityEvent;
  handleFormChange: FormChangeEvent;
  disabled?: boolean;
};

export default function CaptivityStatusForm({ event, handleFormChange, disabled = false }: CaptivityStatusFormProps): JSX.Element {
  const captivityFields: Required<Pick<MortalityFormField, 'captivity_status' | 'mortality_captivity_status'>> = {
    captivity_status: {
      prop: 'captivity_status',
      type: eInputType.check,
      tooltip: <p>{`${EventFormStrings.animal.captivity} (cannot edit in this workflow)`}</p>
    },
    mortality_captivity_status: {
      prop: 'mortality_captivity_status',
      type: eInputType.code,
      codeName: 'mortality_habitat',
      tooltip: <p>{EventFormStrings.animal.mort_captivity_status}</p>
    }
  };
  return (
    <Box {...boxSpreadRowProps} mt={1}>
      {/* captivity_status is always disabled in mortality workflow */}
      {CreateFormField(event, captivityFields.captivity_status, handleFormChange, true)}
      {CreateFormField(event, captivityFields.mortality_captivity_status, handleFormChange, disabled)}
    </Box>
  );
}
