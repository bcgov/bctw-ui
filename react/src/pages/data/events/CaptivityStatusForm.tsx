import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { eInputType, FormFieldObject } from 'types/form_types';
import MortalityEvent from 'types/events/mortality_event';
import { boxSpreadRowProps } from './EventComponents';
import { BCTWWorkflow, IBCTWWorkflow, OptionalAnimal, WorkflowFormProps } from 'types/events/event';
import { WorkflowStrings } from 'constants/strings';

type CaptivityStatusFormProps<T extends IBCTWWorkflow> = WorkflowFormProps<T> & {
  disabled?: boolean;
  hideMortStatus?: boolean;
};

/**
 *
 */
export default function CaptivityStatusForm<
  T extends BCTWWorkflow<T> & Pick<OptionalAnimal, 'captivity_status_ind' | 'mortality_captivity_status_ind'>
>({ event, handleFormChange, disabled = false, hideMortStatus = false }: CaptivityStatusFormProps<T>): JSX.Element {
  // only disable captivity status in mortality workflow
  const isDisabled = event instanceof MortalityEvent;

  const captivity_status_ind: FormFieldObject<T> = {
    prop: 'captivity_status_ind',
    type: eInputType.check,
    tooltip: <p>{`${WorkflowStrings.captivity.captivity} ${isDisabled ? '(cannot edit in this workflow)' : ''}`}</p>
  };

  const mortality_captivity_status_ind: FormFieldObject<T> = {
    prop: 'mortality_captivity_status_ind',
    type: eInputType.check,
    tooltip: <p>{WorkflowStrings.captivity.mort_captivity_status}</p>
  };

  return (
    <Box {...boxSpreadRowProps} mt={1}>
      {CreateFormField(event, captivity_status_ind, handleFormChange, { disabled: isDisabled || disabled })}
      {hideMortStatus
        ? null
        : CreateFormField(event, mortality_captivity_status_ind, handleFormChange, {
            disabled: disabled,
            style: { width: '250px' }
          })}
    </Box>
  );
}
