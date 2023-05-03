import { ModalBaseProps } from 'components/component_interfaces';
import EditCritter from 'pages/data/animals/EditCritter';
import ModifyCritterWrapper from 'pages/data/animals/ModifyCritterWrapper';
import EditCollar from 'pages/data/collars/EditCollar';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';
import { Critter } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWType } from 'types/common_types';
import { ITelemetryDetail } from 'types/map';
import { doNothingAsync } from 'utils/common_helpers';

type CritterOverViewProps = ModalBaseProps & {
  type: BCTWType;
  detail: ITelemetryDetail;
};

export default function MapOverview({ type, detail, open, handleClose }: CritterOverViewProps): JSX.Element {
  const editObj: Critter | Collar = Object.assign(type === 'animal' ? new Critter() : new Collar(), detail);
  const editProps = { handleClose, open, onSave: doNothingAsync };
  if (type === 'animal') {
    return (
      <ModifyCritterWrapper editing={editObj as Critter}>
        <EditCritter {...editProps} editing={editObj as Critter} />
      </ModifyCritterWrapper>
    );
  } else {
    return (
      <ModifyCollarWrapper editing={editObj as Collar}>
        <EditCollar {...editProps} editing={editObj as Collar} />
      </ModifyCollarWrapper>
    );
  }
}
