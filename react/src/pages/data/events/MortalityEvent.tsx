import { Paper } from '@material-ui/core';
import { ModalBaseProps } from 'components/component_interfaces';
import { MakeEditField } from 'components/form/create_form_components';
import { getInputTypesOfT } from 'components/form/form_helpers';
import { UserAlertStrings } from 'constants/strings';
import { TelemetryAlert } from 'types/alert';
import { FormFieldObject } from 'types/common_types';
import EditModal from '../common/EditModal';
import LocationEventForm from './LocationEvent';

type MortEventProps = ModalBaseProps & {
  alert: TelemetryAlert;
};

export default function MortalityEvent({ alert, open, handleClose }: MortEventProps): JSX.Element {
  // const bctwApi = useTelemetryApi();
  // const [showLocationEventModal, setShowLocationEventModal] = useState<boolean>(false);
  // const { data: critter, error: critterError, status: critterStatus } = bctwApi.useType<Animal>('animal', critter_id);
  // const { data: device, error: deviceError, status: deviceStatus } = bctwApi.useType<Collar>('device', critter_id);
  const fields: FormFieldObject[] = [
    { prop: 'vendor_activation_status' },
    { prop: 'device_deployment_status', isCode: true },
    { prop: 'retrieval_date' },
    { prop: 'retrieved' },
    { prop: 'device_status', isCode: true }
  ];
  const justProps = fields.map((f) => f.prop);
  const codeProps = fields.filter((f) => f.isCode).map((x) => x.prop);
  const inputs = getInputTypesOfT<TelemetryAlert>(alert, justProps, codeProps);

  const handleChangeForm = (o: Record<string, number | string>): void => {
    console.log(o);
  };

  return (
    <EditModal<TelemetryAlert>
      showInFullScreen={false}
      handleClose={handleClose}
      onSave={null}
      editing={alert}
      open={open}
      newT={new TelemetryAlert()}
      isEdit={true}
      hideHistory={true}>
      <form className='rootEditInput' autoComplete='off'>
        <Paper className={'dlg-full-title'} elevation={3}>
          <h1>{UserAlertStrings.mortalityFormTitle} </h1>
          <div className={'dlg-full-sub'}>
            <span className='span'>WLH ID: {alert.wlh_id}</span>
            {alert.animal_id ? (
              <>
                <span className='span'>|</span>
                <span className='span'>Animal ID: {alert.animal_id}</span>
              </>
            ) : null}
            <span className='span'>|</span>
            <span className='span'>Device: {alert.device_id}</span>
          </div>
        </Paper>
        <Paper elevation={0} className={'dlg-full-body'}>
          <h2 className={'dlg-full-body-subtitle'}></h2>
          <Paper elevation={3} className={'dlg-full-body-details'}>
            <div className={'dlg-details-section'}>
              <h3>Device Details</h3>
              {inputs.map((i) => {
                return MakeEditField({
                  formType: i,
                  handleChange: (v) => {
                    // todo:
                    console.log(v);
                  },
                  required: true,
                  errorMessage: ''
                });
              })}
            </div>
            <div className={'dlg-details-section'}>
              <h3>Event Details</h3>
              <LocationEventForm eventType={'mortality'} handleChange={handleChangeForm} />
            </div>
          </Paper>
        </Paper>
      </form>
    </EditModal>
  );
}
