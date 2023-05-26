import { Box, Button, Divider, Typography } from '@mui/material';
import { Icon, Modal } from 'components/common';
import { CreateFormField, CreateInputProps, getInputFnFromType } from 'components/form/create_form_components';
import OkayModal from 'components/modal/OkayModal';
import { cbInputValue } from 'critterbase/constants';
import { isCbVal } from 'critterbase/helper_functions';
import useFormHasError from 'hooks/useFormHasError';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { FormSection, editEventBtnProps } from 'pages/data/common/EditModalComponents';
import { useEffect, useState } from 'react';
import { Critter, IMarking, markingFormFields } from 'types/animal';
import { uuid } from 'types/common_types';
import { CbRouteStatusHandler, FormChangeEvent, InboundObj, parseFormChangeResult } from 'types/form_types';
import { columnToHeader, removeProps } from 'utils/common_helpers';
import { CbSelectProps } from './CbSelect';
type CbMarkingSharedProps = {
  taxon_id: uuid;
  handleRoute?: CbRouteStatusHandler;
};

type CbMarkingInputProps = {
  marking?: IMarking;
  handleChange: (v: InboundObj, idx?: number) => void;
  index?: number;
} & CbMarkingSharedProps;

type CbMarkingCustomProps = Partial<Record<keyof IMarking, Partial<CbSelectProps>>>;

export const CbMarkingInput = ({
  taxon_id,
  marking,
  handleChange,
  handleRoute,
  index = 0
}: CbMarkingInputProps): JSX.Element => {
  const { markingFields } = markingFormFields;
  const [showFrequency, setShowFrequency] = useState(false);
  const props: CbMarkingCustomProps = {
    taxon_marking_body_location_id: {
      label: 'Body Location',
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
      label: columnToHeader(f.prop).replace('ID', ''),
      handleRoute,
      ...customProps
    });
  });

  return <>{render}</>;
};

type CbMarkingsProps = {
  markings?: IMarking[];
  handleMarkings: (markings: IMarking[], error: boolean) => void;
} & CbMarkingSharedProps;

export const CbMarkings = (props: CbMarkingsProps): JSX.Element => {
  const { markings, handleMarkings, handleRoute, taxon_id } = props;
  const [hasErr, checkHasErr, resetErrs] = useFormHasError();

  const [markingsData, setMarkingsData] = useState<Array<IMarking & { _delete?: boolean }>>(markings ?? []);
  const [openModal, setOpenModal] = useState(false);
  const [markingId, setMarkingId] = useState<string | undefined>();

  const lastMarking = markingsData[markingsData.length - 1];
  const canAddMarking = markingsData.length === 0 || (lastMarking && !hasErr) || markingsData.every((m) => m?._delete);

  useEffect(() => {
    if (markings) {
      setMarkingsData(markings);
    }
  }, [markings]);

  useEffect(() => {
    //Strip undefined markings
    const markings = markingsData.filter((m) => m);
    handleMarkings(markings, hasErr);
  }, [JSON.stringify(markingsData), hasErr]);

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

  const handleDeleteMarking = (idx: number): void => {
    const marking = markingsData[idx];
    const isNewMarking = !marking?.marking_id;
    if (isNewMarking) {
      //New markings, not yet existing in critterbase can be removed from array.
      removeMarking(idx);
    } else {
      setMarkingId(marking.marking_id);
      setOpenModal(true);
    }
  };

  const handlePermDeleteMarking = async (): Promise<void> => {
    const idx = markingsData.findIndex((o) => o.marking_id === markingId);
    //Set _delete property to notify critterbase payload
    markingsData[idx] = { ...markingsData[idx], _delete: true };
    setMarkingsData([...markingsData]);
    setOpenModal(false);
  };

  return (
    <div>
      {markingsData.map((m, i) => {
        if (m?._delete) return null;
        return (
          <FormSection
            id={`marking-${i}`}
            header={`Marking ${i + 1}`}
            key={`marking-${i}-${m}`}
            btn={
              <Button {...editEventBtnProps} onClick={() => handleDeleteMarking(i)} startIcon={<Icon icon={'close'} />}>
                Delete Marking
              </Button>
            }>
            <CbMarkingInput
              handleRoute={handleRoute}
              taxon_id={taxon_id}
              handleChange={onChange}
              index={i}
              marking={m}
            />
          </FormSection>
        );
      })}

      {canAddMarking ? (
        <Box component='fieldset'>
          <Button
            {...editEventBtnProps}
            style={{ marginLeft: 0 }}
            variant='contained'
            onClick={handleAddMarking}
            startIcon={<Icon icon={'plus'} />}>
            Add Marking
          </Button>
        </Box>
      ) : null}

      <OkayModal
        open={openModal}
        handleClose={setOpenModal}
        handleOkay={handlePermDeleteMarking}
        title={'Deleting Marking'}
        children={'This action will permanetly delete this marking'}
      />
    </div>
  );
};
