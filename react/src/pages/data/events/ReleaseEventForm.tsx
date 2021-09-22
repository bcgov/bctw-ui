import { WorkflowStrings } from 'constants/strings';

type IReleaseWorkflowProps = {
  open;
  handleClose;
  handleSave; 
  animal_id: string;
};

/**
*/
export default function ReleaseEventForm(): JSX.Element {
  return (
    <>
      <h3>{WorkflowStrings.release.workflowTitle}</h3>
    </>
  );
}
