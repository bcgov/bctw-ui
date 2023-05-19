import { Button, Typography } from '@mui/material';
import { Icon, Modal } from 'components/common';
import { CreateFormField, getInputFnFromType } from 'components/form/create_form_components';
import OkayModal from 'components/modal/OkayModal';
import { cbInputValue } from 'critterbase/constants';
import { isCbVal } from 'critterbase/helper_functions';
import useFormHasError from 'hooks/useFormHasError';
import { FormSection, editEventBtnProps } from 'pages/data/common/EditModalComponents';
import { useEffect, useState } from 'react';
import { Critter, IMarking, markingFormFields } from 'types/animal';
import { uuid } from 'types/common_types';
import { FormChangeEvent, InboundObj, parseFormChangeResult } from 'types/form_types';
import { columnToHeader } from 'utils/common_helpers';
type CbMarkingSharedProps = {
  taxon_id: uuid;
};

type CbMarkingInputProps = {
  marking?: IMarking;
  handleChange: (v: InboundObj, idx?: number) => void;
  index?: number;
} & CbMarkingSharedProps;

export const CbMarkingInput = ({ taxon_id, marking, handleChange, index = 0 }: CbMarkingInputProps): JSX.Element => {
  const { markingFields } = markingFormFields;
  const [showFrequency, setShowFrequency] = useState(false);
  const props = {
    attached_timestamp: {
      label: 'Attached Date'
    },
    removed_timestamp: {
      label: 'Removed Date'
    },
    body_location: {
      query: `taxon_id=${taxon_id}`
    }
  };

  const onChange = (v: InboundObj): void => {
    if (v?.marking_type) {
      const isPitTag = isCbVal(v.marking_type, cbInputValue.pitTag);
      setShowFrequency(isPitTag);
    }
    handleChange(v, index);
  };

  const render = markingFields.map((f, i) => {
    const customProps = props?.[f.prop];
    if (['frequency', 'frequency_unit'].includes(f.prop) && !showFrequency) {
      return;
    }
    return getInputFnFromType(f.type)({
      ...f,
      value: marking?.[f.prop],
      handleChange: onChange,
      label: columnToHeader(f.prop),
      ...customProps
    });
  });

  return <>{render}</>;
};

type CbMarkingsProps = {
  markings?: IMarking[];
} & CbMarkingSharedProps;

export const CbMarkings = (props: CbMarkingsProps): JSX.Element => {
  const { markings } = props;
  const [hasErr, checkHasErr, resetErrs] = useFormHasError();
  console.log({ hasErr });
  const [markingsData, setMarkingsData] = useState<Array<IMarking | null>>(markings ?? []);
  const [openModal, setOpenModal] = useState(false);
  const [markingId, setMarkingId] = useState<string | undefined>();

  const lastMarking = markingsData[markingsData.length - 1];
  const canAddMarking = (lastMarking || markingsData.length === 0) && !hasErr;

  const onChange = (v: InboundObj, idx: number): void => {
    const [key, value, label] = parseFormChangeResult<IMarking>(v);
    checkHasErr(v);
    const updatedMarking = value
      ? { ...markingsData[idx], [key]: value }
      : markingsData[idx]
      ? { ...markingsData[idx] }
      : markingsData[idx];
    markingsData[idx] = updatedMarking;
    setMarkingsData([...markingsData]);
  };

  const handleAddMarking = (): void => {
    setMarkingsData((old) => [...old, undefined]);
  };

  const removeMarking = (idx: number): void => {
    setMarkingsData((old) => {
      old.splice(idx, 1);
      return [...old];
    });
  };

  const handleDeleteNewMarking = (idx: number): void => {
    const marking = markingsData[idx];
    //const markingIsEmpty = Object.keys(marking).length === 0;
    const isNewMarking = !marking?.marking_id;
    if (isNewMarking) {
      removeMarking(idx);
    } else {
      setMarkingId(marking.marking_id);
      setOpenModal(true);
    }
  };

  const handlePermDeleteMarking = (): void => {
    const idx = markingsData.findIndex((o) => o.marking_id === markingId);
    console.log('make critterbase request here');
    removeMarking(idx);
    setOpenModal(false);
  };
  return (
    <div>
      {markingsData.map((m, i) => {
        if (m === null) return;
        return (
          <FormSection
            id={`marking-${i}`}
            header={`Marking ${i + 1}`}
            key={`marking-${i}-${m}`}
            flex
            btn={
              <Button
                {...editEventBtnProps}
                onClick={() => handleDeleteNewMarking(i)}
                startIcon={<Icon icon={'close'} />}>
                Delete Marking
              </Button>
            }>
            <CbMarkingInput {...props} handleChange={onChange} index={i} marking={m} />
          </FormSection>
        );
      })}
      {canAddMarking ? (
        <Button {...editEventBtnProps} onClick={handleAddMarking} startIcon={<Icon icon={'plus'} />}>
          Add Marking
        </Button>
      ) : null}

      <OkayModal
        open={openModal}
        handleClose={setOpenModal}
        handleOkay={handlePermDeleteMarking}
        title={'Delete Marking'}
        children={'This action will permanetly delete this marking'}
      />
      {/* <Modal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        title='This action will permantely delete this marking. Are you sure?'>
        <Button>Yes</Button>
        <Button>No</Button>
      </Modal> */}
    </div>
  );
};
