import { Animal, AttachedAnimal } from 'types/animal';
import { useEffect, useState } from 'react';
import { editObjectToEvent, IBCTWWorkflow, WorkflowType, wfFields } from 'types/events/event';
import WorkflowWrapper from '../events/WorkflowWrapper';
import MortalityEvent from 'types/events/mortality_event';
import CaptureEvent from 'types/events/capture_event';
import ReleaseEvent from 'types/events/release_event';

type CritterWorkflowProps = {
  editing: Animal | AttachedAnimal;
  workflow: WorkflowType;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const CritterWorkflow = ({ editing, workflow, open, setOpen }: CritterWorkflowProps): JSX.Element => {
  // const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState<CaptureEvent | ReleaseEvent | MortalityEvent>(new MortalityEvent());
  /**
   * when a workflow button is clicked, update the event type
   * binding all properties of the @var editing to the event
   */
  const createEvent = (wfType: WorkflowType): CaptureEvent | ReleaseEvent | MortalityEvent => {
    if (wfType === 'capture') {
      return editObjectToEvent(editing, new CaptureEvent(), [
        'species',
        'translocation_ind',
        'recapture_ind',
        'region',
        'population_unit'
      ]);
    } else if (wfType === 'release') {
      return editObjectToEvent(editing, new ReleaseEvent(), ['region', 'population_unit']);
    } else if (wfType === 'mortality') {
      return editObjectToEvent(editing, new MortalityEvent(), ['animal_status']);
    }
  };

  // /**
  //  * if a workflow button is clicked and the event type is the same, open or close the workflow modal.
  //  * otherwise, update the workflow type which will trigger the modal state
  //  */
  // const handleOpenWorkflow = (e: WorkflowType): void => {
  //   updateEvent(createEvent(e));
  //   setShowWorkflowForm((o) => !o);
  // };

  useEffect(() => {
    if (workflow) {
      updateEvent(createEvent(workflow));
    }
  }, [workflow]);
  /**
   * when a capture workflow is saved, always show the release workflow unless a translocation_ind is underway
   * todo: is this still needed?
   */
  const handleWorkflowSaved = async (e: IBCTWWorkflow): Promise<void> => {
    setOpen(false);
    if (e.event_type === 'capture' && e instanceof CaptureEvent) {
      if (e.translocation_ind && !e.isTranslocationComplete) {
        // do nothing
      } else {
        // show the release form, populating the location and date fields
        const rwf = editObjectToEvent(e, new ReleaseEvent(e), ['region', 'population_unit']);
        // set the new event directly, triggering the display of the release form
        updateEvent(rwf);
        setOpen((o) => !o);
      }
    }
  };

  /**
   * the capture workflow has multiple exit points that chain to other workflows
   * this is a separate handler because we do not want to save the form until the
   * @param nextWorkflow is completed
   */
  const handleWorkflowChain = async (e: CaptureEvent, nextWorkflow: WorkflowType): Promise<void> => {
    if (e.event_type !== 'capture') {
      return;
    }
    let newwf;
    if (nextWorkflow === 'mortality') {
      newwf = new MortalityEvent(undefined, e);
    } else if (nextWorkflow === 'release') {
      newwf = new ReleaseEvent(e);
    }
    if (!newwf) {
      return;
    }
    // there are only animal-related fields in capture workflows
    const next = editObjectToEvent(e.getAnimal(), newwf, []);
    await updateEvent(next);
    await setOpen((o) => !o);
  };

  return (
    <WorkflowWrapper
      open={open}
      event={event as any}
      handleClose={(): void => setOpen(false)}
      onEventSaved={handleWorkflowSaved}
      onEventChain={handleWorkflowChain}
    />
  );
};
