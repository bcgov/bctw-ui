import { Box } from '@mui/material';
import { BCTWWorkflow, IBCTWWorkflow, WorkflowFormProps } from 'types/events/event';
import { boxSpreadRowProps } from './EventComponents';

type CaptivityStatusFormProps<T extends IBCTWWorkflow> = WorkflowFormProps<T> & {
  disabled?: boolean;
  hideMortStatus?: boolean;
};

/**
 *
 */
//& Pick<OptionalAnimal, 'captivity_status_ind' | 'mortality_captivity_status_ind'>
export default function CaptivityStatusForm<T extends BCTWWorkflow<T>>({
  event,
  handleFormChange,
  disabled = false,
  hideMortStatus = false
}: CaptivityStatusFormProps<T>): JSX.Element {
  // only disable captivity status in mortality workflow

  // const captivity_status_ind: FormFieldObject<T> = {
  //   prop: 'captivity_status_ind',
  //   type: eInputType.check,
  //   tooltip: <p>{`${WorkflowStrings.captivity.captivity} ${isDisabled ? '(cannot edit in this workflow)' : ''}`}</p>
  // };

  // const mortality_captivity_status_ind: FormFieldObject<T> = {
  //   prop: 'mortality_captivity_status_ind',
  //   type: eInputType.check,
  //   tooltip: <p>{WorkflowStrings.captivity.mort_captivity_status}</p>
  // };

  return (
    <Box {...boxSpreadRowProps} mt={1}>
      {/* 
      //TODO add this back maybe CRITTERBASE INTEGRATION
      {CreateFormField(event, captivity_status_ind, handleFormChange, { disabled: isDisabled || disabled })}
      {hideMortStatus
        ? null
        : CreateFormField(event, mortality_captivity_status_ind, handleFormChange, {
            disabled: disabled,
            style: { width: '250px' }
          })} */}
    </Box>
  );
}
