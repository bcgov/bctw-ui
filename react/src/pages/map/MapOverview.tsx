import { ModalBaseProps } from 'components/component_interfaces';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ModifyCritterWrapper from 'pages/data/animals/ModifyCritterWrapper';
import EditCollar from 'pages/data/collars/EditCollar';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';
import { useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWType } from 'types/common_types';
import { ITelemetryDetail } from 'types/map';
import { permissionCanModify } from 'types/permission';

type CritterOverViewProps = ModalBaseProps & {
  type: BCTWType;
  detail: ITelemetryDetail;
};

export default function MapOverview({ type, detail, open, handleClose }: CritterOverViewProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | Collar>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const { critter_id, collar_id } = detail;

  const { data, error, isError, status, remove } =
    type === 'animal'
      ? bctwApi.useType<Animal>('animal', critter_id)
      : bctwApi.useType<Collar>('device', collar_id);

  useEffect(() => {
    if (status === 'success') {
      const canModify = permissionCanModify(data.permission_type);
      setCanEdit(canModify);
      if (type === 'animal') {
        data.device_id = detail.device_id;
        setEditObj(data as Animal);
      } else if (type === 'device') {
        setEditObj(data as Collar);
      }
    }
  }, [status]);

  /**
   * fixme: when a new detail is selected, the old editobj is still in the query cache,
   * invalidating it doesn't seem to work. remove it instead.
   */
  useDidMountEffect(() => {
    const update = (): void => {
      remove();
    }
    update();
  }, [detail]);

  useDidMountEffect(() => {
    const update = (): void => {
      // note: force re-render of child edit components when data is fetched
    }
    update();
  }, [editObj]);

  if (isError) {
    return <div>{error}</div>;
  }

  // props to pass to edit modal
  // fixme: casting detail
  const editProps = { editing: editObj ?? (detail as any), handleClose, open, onSave: null, isEdit: canEdit };

  if (type === 'animal') {
    return (
      <ModifyCritterWrapper editing={(editObj as Animal) ?? (detail as any)}>
        <EditCritter {...editProps} />
      </ModifyCritterWrapper>
    );
  } else {
    return (
      <ModifyCollarWrapper editing={(editObj as Collar) ?? (detail as any)}>
        <EditCollar {...editProps} />
      </ModifyCollarWrapper>
    );
  }
}
