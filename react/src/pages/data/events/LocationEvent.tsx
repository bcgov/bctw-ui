import { ModalBaseProps } from 'components/component_interfaces';
import { useState } from 'react';
import { MakeEditFields } from 'components/form/create_form_components';
import Modal from 'components/modal/Modal';
import { EventBaseProps, generateFieldTypes, generateLocationEventProps, LocationEvent, LocationEventType } from 'types/event';

type LocationEventProps = /*EventBaseProps*/ & ModalBaseProps & {
  eventType: LocationEventType;
  handleSave?: () => void;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const [event, setEvent] = useState({});
  const { eventType } = props;
  const eventProps = generateLocationEventProps(eventType);
  const fieldTypes = generateFieldTypes(eventProps);
  const onChange = (v): void => {
    const n = Object.assign(event, v);
    setEvent(n);
    // console.log('changed in location event', n)
  };

  return (
    <Modal {...props}>
      <div>
        {fieldTypes.map((f) => {
          return MakeEditFields<any>({
            formType: f,
            editing: new LocationEvent(),
            handleChange: onChange,
            errorMessage: '',
            isEdit: true,
            isError: false,
            isRequired: true
          });
        })}
      </div>
    </Modal>
  );
}
