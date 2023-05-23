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
import { columnToHeader, removeProps } from 'utils/common_helpers';
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
  handleMarkings: (markings: IMarking[]) => void;
} & CbMarkingSharedProps;

export const CbMarkings = (props: CbMarkingsProps): JSX.Element => {
  const { markings, handleMarkings } = props;
  const [hasErr, checkHasErr, resetErrs] = useFormHasError();
  const [markingsData, setMarkingsData] = useState<Array<IMarking & { _updated?: boolean }>>(markings ?? []);
  const [openModal, setOpenModal] = useState(false);
  const [markingId, setMarkingId] = useState<string | undefined>();

  const lastMarking = markingsData[markingsData.length - 1];
  const canAddMarking = (lastMarking || markingsData.length === 0) && !hasErr;

  useEffect(() => {
    //Strip undefined
    //Needs to check if error exists before notifying markings handler
    if (!hasErr) {
      const markings = markingsData.filter((m) => {
        delete m?._updated;
        return m;
      });
      handleMarkings(markings);
    }
  }, [JSON.stringify(markingsData)]);

  const onChange = (v: InboundObj, idx: number): void => {
    const [key, value, label] = parseFormChangeResult<IMarking>(v);
    checkHasErr(v);
    const updatedMarking = value
      ? { ...markingsData[idx], [key]: value, _updated: true }
      : markingsData[idx]
      ? { ...markingsData[idx] }
      : markingsData[idx];
    markingsData[idx] = updatedMarking;
    // console.log(markingsData);
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
      <OkayModal
        open={openModal}
        handleClose={setOpenModal}
        handleOkay={handlePermDeleteMarking}
        title={'Delete Marking'}
        children={'This action will permanetly delete this marking'}
      />
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
            <CbMarkingInput {...removeProps(props, ['handleMarkings'])} handleChange={onChange} index={i} marking={m} />
          </FormSection>
        );
      })}
      {canAddMarking ? (
        <Button {...editEventBtnProps} onClick={handleAddMarking} startIcon={<Icon icon={'plus'} />}>
          Add Marking
        </Button>
      ) : null}
    </div>
  );
};
