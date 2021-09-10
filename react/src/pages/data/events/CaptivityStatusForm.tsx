import { Box } from '@material-ui/core';
import { FormFromFormfield } from 'components/form/create_form_components';
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
};

export default function CaptivityStatusForm({ event }: CaptivityStatusFormProps): JSX.Element {
  const { fields } = event;

  if (!fields) {
    return null;
  }

  const onChange = (v): void => {
    console.log(v);
  };

  return (
    <>
      {FormPart('Captivity Details', [
        <Box {...boxProps}>
          <span>{fields.captivity_status.long_label}</span>
          {/* captivity_status is always disabled in mortality workflow */}
          {FormFromFormfield(event, fields.captivity_status, onChange, true)}
        </Box>,
        <Box {...boxProps}>
          <span>{fields.mortality_captivity_status.long_label}</span>
          {FormFromFormfield(event, fields.mortality_captivity_status, onChange)}
        </Box>
      ])}
    </>
  );
}
