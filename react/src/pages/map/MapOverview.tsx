import { ModalBaseProps } from 'components/component_interfaces';
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
import { eCritterPermission } from 'types/user';

type CritterOverViewProps = ModalBaseProps & {
  type: BCTWType;
  detail: ITelemetryDetail;
};

export default function MapOverView({ type, detail, open, handleClose }: CritterOverViewProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | Collar>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const { critter_id, collar_id } = detail;

  const { data, error, isError, status } =
    type === 'animal'
      ? bctwApi.useType<Animal>('animal', critter_id)
      : bctwApi.useType<Collar>('device', collar_id);

  useEffect(() => {
    if (status === 'success') {
      if (type === 'animal') {
        data.device_id = detail.device_id;
        setEditObj(data as Animal);
        setCanEdit((data as Animal).permission_type === eCritterPermission.change);
      } else if (type === 'device') {
        setEditObj(data as Collar);
        setCanEdit(true);
      }
    }
  }, [status]);

  if (isError) {
    return <div>{error}</div>;
  }

  // props to pass to edit modal
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
/* 

type ISpecialEventProps = {
  type: 'malfunction' | 'capture';
  collar_id: string;
  critter_id: string;
};

function SpecialEvent({ critter_id, collar_id, type }: ISpecialEventProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const { data, status, error } =
    type === 'capture' ? bctwApi.useCritterHistory(1, critter_id) : bctwApi.useCollarHistory(1, collar_id);

  switch (status) {
    case 'loading':
      return <div>loading...</div>;
    case 'error':
      return (
        <div>
          unable to load {type === 'capture' ? 'capture' : 'malfunction'} history: {error}
        </div>
      );
    default:
      break;
  }
  const filtered =
    type === 'capture'
      ? (data as Animal[]).filter((a) => a.capture_date)
      : (data as Collar[]).filter((c) => c.malfunction_date);
  if (!filtered.length) {
    return <div>history contains no events</div>;
  }
  return (
    <Table>
      <TableHead>
        {type === 'capture' ? (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>UTM</TableCell>
          </TableRow>
        ) : (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        )}
      </TableHead>
      <TableBody>
        {type === 'capture'
          ? (filtered as Animal[]).map((f) => (
              <TableRow key={f.critter_id}>
                <TableCell>{dateObjectToDateStr(f.capture_date)}</TableCell>
                <TableCell>{f.captureCoords}</TableCell>
                <TableCell>{f.captureUTM}</TableCell>
              </TableRow>
            ))
          : (filtered as Collar[]).map((c) => (
              <TableRow key={c.collar_id}>
                <TableCell>{c.malfunction_date}</TableCell>
                <TableCell>{c.device_malfunction_type}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
*/
