import { IUpsertPayload } from 'api/api_interfaces';
import { EditModalBaseProps, ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import React, { useEffect, useState } from 'react';
import { Animal, critterFormFields } from 'types/animal';
import { Collar } from 'types/collar';
import { omitNull } from 'utils/common_helpers';
import { IHistoryPageProps } from 'pages/data/common/HistoryPage';
import { CollarStrings } from 'constants/strings';

import HistoryPage from './HistoryPage';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import Modal from 'components/modal/Modal';
import useDidMountEffect from 'hooks/useDidMountEffect';

import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { classicNameResolver } from 'typescript';


interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export type IEditModalProps<T> = EditModalBaseProps<T> & {
  children: React.ReactNode;
  hideSave?: boolean;
  disableHistory?: boolean;
  showInFullScreen?: boolean;
  onReset?: () => void;
  headerComponent?: JSX.Element;
};

/**
 * a component that wraps a form and handles:
 * - opening/closing of the modal.
 * - whether the form can be saved
 *
 * - uses the ChangeContext provider to force child form components to pass their changeHandlers to this component so that [canSave] can be determined
 * @param children child form component
 * @param isCreatingNew true when 'Add' is selected from data management
 * @param hideSave optionally hide save button
 * @param hideHIstory optionally hide the 'show history' button
 * @param showInFullScreen render as a modal or fullscreen dialog?
 * @param onReset a close handler since default handler is overwritten in AddEditViewer
 * @param onSave the parent handler called when the save button is clicked
 * @param headerComponent 
 */
export default function EditModal<T>(props: IEditModalProps<T>): JSX.Element {
  const bctwApi = useTelemetryApi();
  const {
    children,
    title,
    open,
    handleClose,
    editing,
    onSave,
    onReset,
    headerComponent,
    disableHistory = false,
    hideSave = false,
    showInFullScreen = true,
  } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(Object.assign({}, editing));
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyParams, setHistoryParams] = useState<IHistoryPageProps<T>>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>(Object.assign({}));
  
  const [value, setValue] = React.useState(0);
  const handleSwitch = (event: React.ChangeEvent<{1}>, newValue: number) => {
    setValue(newValue);
  };

  // set the history query status
  useEffect(() => {
    const updateParams = (): void => {
      if (editing instanceof Animal) {
        setHistoryParams({
          query: bctwApi.useCritterHistory,
          param: editing.critter_id,
          propsToDisplay: Object.keys(editing) // critterFormFields.historyProps.map((p) => p.prop)
        });
      } else if (editing instanceof Collar) {
        setHistoryParams({
          query: bctwApi.useCollarHistory,
          param: editing.collar_id,
          propsToDisplay: Object.keys(editing) // [...CollarStrings.editableProps, ...['valid_from', 'valid_to']]
        });
      }
    };
    updateParams();
  }, [editing]);

  // when the modal opens, disable save
  useDidMountEffect(() => {
    if (open) {
      setCanSave(false);
    }
  }, [open]);

  // if the error state changes, update the save status
  useDidMountEffect(() => {
    const update = (): void => {
      const cs = Object.values(errors).filter(e => !!e);
      setCanSave(cs.length === 0)
    }
    update();
  }, [errors])

  const displayHistory = (): void => setShowHistory((o) => !o);

  const handleSave = (): void => {
    // use Object.assign to preserve class methods
    const body = omitNull(Object.assign(editing, newObj));
    // console.log(JSON.stringify(body, null, 2));
    const toSave: IUpsertPayload<T> = { body };
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: Record<string, unknown>): void => {
    // console.log(newProp);
    // update the error state
    const key: string = Object.keys(newProp)[0];
    const newErrors = Object.assign(errors, {[key]: newProp.error});
    setErrors({...newErrors});
    // update the editing state
    const modified = { ...newObj, ...newProp };
    setNewObj(modified);
    // todo: determine if object has actually changed from original
    // const og = { [key]: editing[key] ?? '' };
    // const isSame = objectCompare(newProp, og);
    // setCanSave(isChange && !isSame);
  };

  const reset = (): void => {
    setShowHistory(false);
    setCanSave(false);
    if (typeof onReset === 'function') {
      onReset();
    }
  };

  const onClose = (): void => {
    reset();
    handleClose(false);
  };

  const modalProps: ModalBaseProps = { open, handleClose: onClose, title };
  const childrenComponents = (
    /**
     * wrap children in the change context provider so they have
     * access to this components handleChange form handler
     */
    <ChangeContext.Provider value={handleChange}>
      {/* the history modal */}
      {showHistory ? (
        <Modal open={showHistory} handleClose={(): void => setShowHistory(false)}>
          <HistoryPage {...historyParams} />
        </Modal>
      ) : null}

      <form className={'rootEditInput'} autoComplete={'off'}>

        {headerComponent}

        <Container maxWidth="xl">
          <Box py={3}>

            <Box mb={4}>
              <Tabs value={value} onChange={handleSwitch} aria-label="simple tabs example"
                indicatorColor="primary"
                textColor="primary">
                <Tab label="Details" {...a11yProps(0)} />
                <Tab label="History" {...a11yProps(1)} />
              </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
              <Paper>
                {children}

                <Box my={1} mx={3}>
                  <Divider></Divider>
                </Box>

                <Box p={3}>
                  <Box display="flex" justifyContent="flex-end" className='form-buttons'>
                    {/* show history button */}
                    {/* {disableHistory ? null : (
                      <Button onClick={displayHistory}>{`${showHistory ? 'hide' : 'show'} history`}</Button>
                    )} */}
                    {/* save button */}
                    {hideSave ? null : (
                      <Button size="large" color="primary" onClick={handleSave} disabled={!canSave}>
                        Save
                      </Button>
                    )}
                    <Button size="large" variant="outlined" color="primary">
                      Cancel and Exit
                    </Button>
                  </Box>
                </Box>
              </Paper>

            </TabPanel>

            <TabPanel value={value} index={1}>
              <HistoryPage {...historyParams} />
            </TabPanel>

          </Box>
        </Container>

      </form>

    </ChangeContext.Provider>
  );

  return showInFullScreen ? (
    <FullScreenDialog {...modalProps}>{childrenComponents}</FullScreenDialog>
  ) : (
    <Modal {...modalProps}>{childrenComponents}</Modal>
  );
}
