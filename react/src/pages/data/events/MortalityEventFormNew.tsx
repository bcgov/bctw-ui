import { Box, ButtonProps, Grid } from '@mui/material';
import MortalityEvent from 'types/events/mortality_event';
import { FormSection } from '../common/EditModalComponents';
import { CreateSpeciesFormField } from 'components/form/create_form_components';
import { CreateFormField } from 'components/form/create_form_components';
import { useState } from 'react';
import { wfFields, WorkflowFormProps } from 'types/events/event';
import { Button, Icon } from 'components/common';
import dayjs, { Dayjs } from 'dayjs';
import { Alert } from '@mui/material';
import { LocationEvent } from 'types/events/location_event';
import LocationEventForm from './LocationEventForm';
import { boxSpreadRowProps } from './EventComponents';
import { PageTabs } from 'components/common/partials/PageTabs';
import MapOverview from 'pages/map/MapOverview';
import MapDetails from 'pages/map/details/MapDetails';
import MapModal from 'components/modal/MapModal';
import LocationSelect from 'components/form/LocationSelect';
import { FeatureCollection } from 'geojson';
import LocationInputMap from 'components/form/LocationInputMap';

type MortEventProps = WorkflowFormProps<MortalityEvent> & {
  event: MortalityEvent;
};

export default function MortalityEventForm({
  event,
  handleFormChange,
  handleExitEarly
}: MortEventProps | any): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);

  const onChange = (): void => {};

  const EditDetails = (): JSX.Element => {
    const [editAnimalDetails, setEditAnimalDetails] = useState<boolean>(false);
    const [editDeviceDetails, setEditDeviceDetails] = useState<boolean>(false);

    const handleEditAnimal = () => {
      setEditAnimalDetails(true);
    };

    const handleEditDevice = () => {
      setEditDeviceDetails(true);
    };

    return (
      <Box mt={2} mb={2}>
        <Box style={{ backgroundColor: '#f7f8fa' }}>
          <FormSection
            id='animal-details'
            header='Animal'
            btn={
              <Button variant='text' onClick={handleEditAnimal}>
                Edit
              </Button>
            }
            disabled={!editAnimalDetails}>
            {CreateFormField(mortality, wfFields.get('animal_id'), onChange)}
            {CreateFormField(mortality, wfFields.get('wlh_id'), onChange)}
            {CreateFormField(mortality, wfFields.get('species'), onChange)}
            {CreateFormField(mortality, wfFields.get('region'), onChange)}
          </FormSection>
          <FormSection
            id='device-details'
            header='Device'
            btn={
              <Button variant='text' onClick={handleEditDevice}>
                Edit
              </Button>
            }
            disabled={!editDeviceDetails}>
            {CreateFormField(mortality, wfFields.get('device_id'), onChange)}
            {CreateFormField(mortality, wfFields.get('device_make'), onChange)}
            {/* Need a field for deployment date. Could be capture date? */}
            {CreateFormField(mortality, wfFields.get('retrieval_date'), onChange) /*these are placeholders for now*/}
          </FormSection>
        </Box>
      </Box>
    );
  };

  const ExistingMortNotice = (): JSX.Element => {
    const mortality_date = dayjs().toDate().toDateString();
    const contact_link = 'mailto:admin@example.com';

    return (
      <Alert severity='warning'>
        <strong>That animal has already been reported as deceased</strong>
        <br />
        That animal is reported to have died on <strong>{mortality_date}</strong>, and an animal can only have one
        mortality event.
        <br />
        If you are trying to correct the existing mortality record, please{' '}
        <a href={contact_link}>contact a data administrator</a>.
      </Alert>
    );
  };

  const QuestionBlock = ({ question, subheading }): JSX.Element => {
    return (
      <>
        <h4>{question}</h4>
        <p>{subheading}</p>
      </>
    );
  };

  const LocationInputTabs = (): JSX.Element => {
    const TABS = ['Text', 'Map'];

    return (
      <>
        <QuestionBlock
          question='Where did the animal die?'
          subheading='If this is unknown, select a general location on the map with a large buffer area to represent uncertainty in the location.'
        />
        <PageTabs tabLabels={TABS}>
          {
            <>
              <p>Choose the format of the mortality coordinates</p>
              <LocationEventForm event={mortality.location_event} notifyChange={onChange} showComment={false} />
            </>
          }
          {
            <>
              <p>Tab 2</p>
              <LocationInputMap handleSelectLocation={null} height={'300px'}/>
            </>
          }
        </PageTabs>
      </>
    );
  };

  const mortality_status = false;

  return (
    <>
      <EditDetails />
      {mortality_status ? ExistingMortNotice() : <LocationInputTabs />}
    </>
  );
}
