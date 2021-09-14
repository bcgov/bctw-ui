import { Box } from '@material-ui/core';
import { FormFromFormfield } from 'components/form/create_form_components';
import { FormChangeEvent } from 'types/form_types';
import MortalityEvent from 'types/events/mortality_event';
import { FormPart } from '../common/EditModalComponents';
import { boxProps } from './EventComponents';
/**
 *
 * todo: handle more than just a mortality event
 * todo: move long_label to tooltip? 
 * todo: does mort_capt_status code work
 */
type CaptivityStatusFormProps = {
  event: MortalityEvent;
  handleFormChange: FormChangeEvent;
};

export default function CaptivityStatusForm({ event, handleFormChange }: CaptivityStatusFormProps): JSX.Element {
  const { fields } = event;

  if (!fields) {
    return null;
  }

  return (
    <>
      {FormPart('ev-capt','Captivity Details', [
        <Box {...boxProps}>
          <span>{fields.captivity_status.long_label}</span>
          {/* captivity_status is always disabled in mortality workflow */}
          {FormFromFormfield(event, fields.captivity_status, handleFormChange, true)}
        </Box>,
        <Box {...boxProps}>
          <span>{fields.mortality_captivity_status.long_label}</span>
          {FormFromFormfield(event, fields.mortality_captivity_status, handleFormChange)}
        </Box>
      ])}
    </>
  );
}
