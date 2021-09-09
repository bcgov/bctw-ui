import { WorkflowStrings } from 'constants/strings';

type ICaptureWorkflowProps = {
  open;
  handleClose;
  handleSave; 
  animal_id: string;
};

/**
*/
export default function CaptureEventForm(): JSX.Element {

  return (
    <>
      <h3>{WorkflowStrings.captureWorkflowTitle}</h3>
    </>
  );
}
