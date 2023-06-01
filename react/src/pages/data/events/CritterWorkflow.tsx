import { useEffect, useState } from 'react';
import { AttachedCritter, Critter } from 'types/animal';
import { IWorkflow, WorkflowType } from 'types/events/event';
// import ReleaseEvent from 'types/events/release_event';
import WorkflowWrapper from '../events/WorkflowWrapper';
import { createEvent } from './EventComponents';

type CritterWorkflowProps = {
  editing: Critter | AttachedCritter;
  workflow: WorkflowType;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const CritterWorkflow = ({ editing, workflow, open, setOpen }: CritterWorkflowProps): JSX.Element => {
  /**
   * when a workflow button is clicked, update the event type
   * binding all properties of the @var editing to the event
   * casting as CaptureEvent2 to prevent workflowWrapper error
   */

  const [event, updateEvent] = useState(createEvent(editing, workflow));

  useEffect(() => {
    const a = createEvent(editing, workflow);
    updateEvent(a);
  }, [editing, workflow]);
  /**
   * when a capture workflow is saved, always show the release workflow unless a translocation_ind is underway
   * todo: is this still needed?
   */
  const handleWorkflowSaved = async (e: IWorkflow<typeof event>): Promise<void> => {
    setOpen(false);
  };

  /**
   * the capture workflow has multiple exit points that chain to other workflows
   * this is a separate handler because we do not want to save the form until the
   * @param nextWorkflow is completed
   */
  // const handleWorkflowChain = async (e: CaptureEvent, nextWorkflow: WorkflowType): Promise<void> => {
  //   if (e.event_type !== 'capture') {
  //     return;
  //   }
  //   let newwf;
  //   if (nextWorkflow === 'mortality') {
  //     newwf = new MortalityEvent(undefined, e);
  //   } else if (nextWorkflow === 'release') {
  //     newwf = new ReleaseEvent(e);
  //   }
  //   if (!newwf) {
  //     return;
  //   }
  //   // there are only animal-related fields in capture workflows
  //   const next = editObjectToEvent(e.getAnimal(), newwf, []);
  //   await updateEvent(next);
  //   await setOpen((o) => !o);
  // };

  return (
    <>
      {event?.event_type === workflow ? (
        <WorkflowWrapper
          open={open}
          event={event}
          handleClose={(): void => setOpen(false)}
          onEventSaved={handleWorkflowSaved}
          //onEventChain={handleWorkflowChain}
        />
      ) : null}
    </>
  );
};
