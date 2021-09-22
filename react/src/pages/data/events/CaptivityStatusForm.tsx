import { Box } from '@material-ui/core';
import { CreateFormField } from 'components/form/create_form_components';
import { eInputType, FormChangeEvent, FormFieldObject } from 'types/form_types';
import MortalityEvent from 'types/events/mortality_event';
import { boxSpreadRowProps } from './EventComponents';
import { BCTWWorkflow, OptionalAnimal } from 'types/events/event';
import { WorkflowStrings } from 'constants/strings';
type CaptivityStatusFormProps<T> = {
  event: T;
  handleFormChange: FormChangeEvent;
  disabled?: boolean;
};

/**
 *
 */
export default function CaptivityStatusForm<
  T extends BCTWWorkflow<T> & Pick<OptionalAnimal, 'captivity_status' | 'mortality_captivity_status'>
>({ event, handleFormChange, disabled = false }: CaptivityStatusFormProps<T>): JSX.Element {

  const captivity_status: FormFieldObject<T> = {
    prop: 'captivity_status',
    type: eInputType.check,
    tooltip: <p>{`${WorkflowStrings.captivity.captivity} (cannot edit in this workflow)`}</p>
  };

  const mortality_captivity_status: FormFieldObject<T> = {
    prop: 'mortality_captivity_status',
    type: eInputType.code,
    codeName: 'mortality_habitat',
    tooltip: <p>{WorkflowStrings.captivity.mort_captivity_status}</p>
  };

  // only disable captivity status in mortality workflow
  const isDisabled = event instanceof MortalityEvent;

  return (
    <Box {...boxSpreadRowProps} mt={1}>
      {CreateFormField(event, captivity_status, handleFormChange, {disabled: isDisabled || disabled})}
      {CreateFormField(event, mortality_captivity_status, handleFormChange, {disabled: disabled})}
    </Box>
  );
}
