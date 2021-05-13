import { Paper } from '@material-ui/core';
import ChangeContext from 'contexts/InputChangeContext';
import { ModalBaseProps } from 'components/component_interfaces';
import { CreateEditCheckboxField, CreateEditDateField, MakeEditField } from 'components/form/create_form_components';
import { getInputTypesOfT, objHasErrors } from 'components/form/form_helpers';
import { UserAlertStrings } from 'constants/strings';
import { TelemetryAlert } from 'types/alert';
import { LocationEvent } from 'types/location_event';
import EditModal from '../common/EditModal';
import { useState } from 'react';
import LocationEventForm from './LocationEventForm';
import { removeProps } from 'utils/common';
import MortalityEvent from 'types/mortality_event';
import { IUpsertPayload } from 'api/api_interfaces';
import { Collar } from 'types/collar';
import { Animal } from 'types/animal';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatLabel } from 'types/common_helpers';
import MultiSelect from 'components/form/MultiSelect';
import { LightTooltip } from 'components/modal/Tooltip';

type MortEventProps = ModalBaseProps & {
  alert: TelemetryAlert;
  handleSave: (animal: Animal, collar: Collar) => void;
};

// temporary: for UAT2 workshop
const pcodPredatorSpeciesValues = [
  { id: 0, value: 'Coyote' },
  { id: 1, value: 'Unknown Canid' },
  { id: 2, value: 'Bobcat' }
]

// temporary: for UAT2 workshop
const pcodValues = [
  { id: 0, value: 'predation_location', displayLabel: 'Predation: Location known' },
  { id: 1, value: 'predation_no_location', displayLabel: 'Predation: Location unknown' },
  { id: 2, value: 'predation_probable', displayLabel: 'Predation: Suspected' },
  { id: 3, value: 'hunting_unlicenced', displayLabel: 'Hunting: Unlicensed' },
  { id: 4, value: 'hunting_licenced', displayLabel: 'Hunting: Licensed' },
  { id: 5, value: 'accident_collision', displayLabel: 'Accident: Vehicular collision' },
  { id: 6, value: 'accident_natural', displayLabel: 'Accident: Natural' },
  { id: 7, value: 'accident_capture', displayLabel: 'Accident: Capture-related injury' },
  { id: 8, value: 'health_related', displayLabel: 'Health-related' },
  { id: 9, value: 'health_starvation', displayLabel: 'Health-related: Starvation' },
  { id: 10, value: 'unknown', displayLabel: 'Unknown' },
  { id: 11, value: 'other', displayLabel: 'Other' },
  { id: 12, value: 'natural', displayLabel: 'Natual' },
  { id: 13, value: 'removal', displayLabel: 'Removal' },
  { id: 14, value: 'trapping', displayLabel: 'Trapping' }
]

export default function MortalityEventForm({ alert, open, handleClose, handleSave }: MortEventProps): JSX.Element {
  const [errors, setErrors] = useState({});
  const [mortalityEvent, setMortalityEvent] = useState<MortalityEvent>(new MortalityEvent(alert.critter_id, alert.collar_id, alert.device_id))
  const [locationEvent, setLocationEvent] = useState<LocationEvent>(new LocationEvent('mortality', alert.valid_from));

  const formFields = getInputTypesOfT<MortalityEvent>(mortalityEvent, mortalityEvent.editableProps.map(c => ({prop: c})), mortalityEvent.propsThatAreCodes);
  const required = true;

  const deviceUnassignedField = formFields.find(f => f.key === 'shouldUnattachDevice');
  const retrievedField = formFields.find(f => f.key === 'retrieved');
  const retrievedDateField = formFields.find(f => f.key === 'retrieval_date');
  const animalStatusField = formFields.find(f => f.key === 'animal_status');
  const pcodConfidenceValueField = formFields.find(f => f.key === 'pcod_confidence_value');
  const vasField = formFields.find(f => f.key === 'vendor_activation_status');
  const deviceStatusFields = formFields.filter(f => ['device_status', 'device_deployment_status'].includes(f.key))

  /**
   * break the MortalityEvent into collar/critter specific properties 
   * before passing to the parent save handler
   * @param payload the save payload passed from the {EditModal}
   */
  const onSave = async (payload: IUpsertPayload<MortalityEvent>): Promise<void> => {
    const { body } = payload;
    body.location_event = locationEvent;
    const a = body.getCritter;
    const c = body.getCollar;
    await handleSave(a, c);
    handleClose(false);
  }

  useDidMountEffect(() => {
    setMortalityEvent(new MortalityEvent(alert.critter_id, alert.collar_id, alert.device_id))
    setLocationEvent(new LocationEvent('mortality', alert.valid_from))
  }, [alert]);

  return (
    <EditModal<MortalityEvent>
      showInFullScreen={false}
      handleClose={handleClose}
      onSave={onSave}
      editing={mortalityEvent}
      hasErrors={():boolean => objHasErrors(errors)}
      open={open}
      // the instance that the editmodal will save changed fields to
      newT={Object.assign({}, mortalityEvent)}
      isEdit={true}
      hideHistory={true}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v, modifyCanSave);
          };

          const onChangeLocationProp = (v: Record<string, unknown>): void => {
            // when switching coordinate types...dont make form savable
            if (Object.values(v).includes(undefined)) {
              return;
            }
            // the property name will be the 'key' of the first key in Object.values
            const justProp = {[Object.keys(v)[0]]: v.error};
            const newErrors = Object.assign(errors, justProp)
            setErrors(newErrors)

            const l = Object.assign(locationEvent, v)
            setLocationEvent(l)
            handlerFromContext(l, true);
          }

          return (
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
              {/* form body */}
              <Paper elevation={0}>
                <Paper elevation={3} className={'dlg-full-body-details'}>
                  <div className={'dlg-details-section'}>
                    <h3>Update Assignment Details</h3>
                    <LightTooltip title={
                      <p>If you unassign the device, no new telemetry from this device will be connected to this animal.</p>
                    } placement='right' enterDelay={750}>
                    <div>
                      {CreateEditCheckboxField({formType: deviceUnassignedField, label: formatLabel(mortalityEvent, deviceUnassignedField.key), handleChange: onChange})}
                    </div>
                    </LightTooltip>
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Update Device Details</h3>
                    <LightTooltip title={
                      <p>If <strong>checked</strong>, <i>Device Deployment Status</i> will be automatically set to <em>"Not Deployed"</em>.</p>
                    } placement='right' enterDelay={750}>
                      <div>
                        {CreateEditCheckboxField({formType: retrievedField, label: formatLabel(mortalityEvent, retrievedField.key), handleChange: onChange})}
                      </div>
                    </LightTooltip>
                    <LightTooltip title={
                      <p>TODO: If <strong>checked</strong>then...</p>
                    } placement='right' enterDelay={750}>
                      <div>
                        {CreateEditDateField({formType: retrievedDateField, label: formatLabel(mortalityEvent, retrievedDateField.key), handleChange: onChange, disabled: !mortalityEvent.retrieved})}
                      </div>
                    </LightTooltip>
                    <LightTooltip title={
                      <p>TODO: If <strong>checked</strong>then...</p>
                    } placement='right' enterDelay={750}>
                      <div style={{marginBottom: '10px'}}>
                        {CreateEditCheckboxField({formType: vasField, label: formatLabel(mortalityEvent, vasField.key), handleChange: onChange})}
                      </div>
                    </LightTooltip>
                    { /* deviceStatusFields.map((formType) => {
                      return MakeEditField({
                        formType,
                        handleChange: onChange,
                        required,
                        errorMessage: !!errors[formType.key] && (errors[formType.key]),
                      });
                    }) */ }
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Update Animal Details</h3>
                    {MakeEditField({formType: animalStatusField, handleChange: onChange, required, errorMessage: ''})}
                    { /* temporary: for UAT2 workshop */ }
                    <div style={{marginBottom: '18px'}}>
                      <MultiSelect label="Proximate Cause of Death" changeHandler={() => ""} data={pcodValues} />
                    </div>
                    <div style={{marginBottom: '18px'}}>
                      <MultiSelect label="Predator Species" changeHandler={() => ""} data={pcodPredatorSpeciesValues} />
                    </div>
                    <div style={{marginBottom: '6px'}}>
                      {MakeEditField({formType: pcodConfidenceValueField, label: "Confidence", handleChange: onChange, errorMessage: ''})}
                    </div>
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Mortality Event Details &amp; Comment</h3>
                    <LocationEventForm event={locationEvent} handleChange={onChangeLocationProp} />
                  </div>
                </Paper>
              </Paper>
            </form>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
