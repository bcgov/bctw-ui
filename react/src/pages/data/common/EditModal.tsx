import { IUpsertPayload } from 'api/api_interfaces';
import { EditModalBaseProps, ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import React, { useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { omitNull } from 'utils/common_helpers';
import { IHistoryPageProps } from 'pages/data/common/HistoryPage';
import { EditTabPanel, a11yProps } from 'pages/data/common/EditModalComponents';

import HistoryPage from './HistoryPage';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import Modal from 'components/modal/Modal';
import useDidMountEffect from 'hooks/useDidMountEffect';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { BCTWBase } from 'types/common_types';
import useFormHasError from 'hooks/useFormHasError';

export type IEditModalProps<T> = EditModalBaseProps<T> & {
  children: React.ReactNode;
  hideSave?: boolean;
  disableTabs?: boolean;
  disableHistory?: boolean;
  showInFullScreen?: boolean;
  onReset?: () => void;
  headerComponent?: JSX.Element;
};

/**
 * Component that wraps a form and handles:
 * - opening/closing of the modal.
 * - whether the form can be saved
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
export default function EditModal<T extends BCTWBase<T>>(props: IEditModalProps<T>): JSX.Element {
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
    disableTabs = false,
    showInFullScreen = true
  } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [hasErr, checkHasErr] = useFormHasError();
  const [newObj, setNewObj] = useState<T>(Object.assign({}, editing));
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyParams, setHistoryParams] = useState<IHistoryPageProps<T>>();

  const [value, setValue] = React.useState(0);
  const handleSwitch = (event: React.ChangeEvent<{ 1 }>, newValue: number): void => {
    setValue(newValue);
  };

  // set the history query status
  useEffect(() => {
    const updateParams = (): void => {
      if (editing instanceof Animal) {
        setHistoryParams({
          query: bctwApi.useCritterHistory,
          param: editing.critter_id,
          propsToDisplay: (editing.displayProps) // show all Animal properties
        });
      } else if (editing instanceof Collar) {
        setHistoryParams({
          query: bctwApi.useCollarHistory,
          param: editing.collar_id,
          propsToDisplay: (editing.displayProps) // show all Device properties
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
    setCanSave(!hasErr);
  }, [hasErr]);

  const handleSave = (): void => {
    // use Object.assign to preserve class methods
    const body = omitNull(Object.assign(editing, newObj));
    const toSave: IUpsertPayload<T> = { body };
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: Record<string, unknown>): void => {
    checkHasErr(newProp);
    const modified = { ...newObj, ...newProp };
    setNewObj(modified);
    // todo: determine if object has changed from original
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
      {!disableHistory && showHistory ? (
        <Modal open={showHistory} handleClose={(): void => setShowHistory(false)}>
          <HistoryPage {...historyParams} />
        </Modal>
      ) : null}

      <form autoComplete={'off'}>
        {headerComponent}

        <Container maxWidth='xl'>
          <Box py={3}>
            {disableTabs ? null : (
              <Box mb={4}>
                <Tabs
                  value={value}
                  onChange={handleSwitch}
                  aria-label='simple tabs example'
                  indicatorColor='primary'
                  textColor='primary'>
                  <Tab label='Details' {...a11yProps(0)} />
                  {!disableHistory ? <Tab label='History' {...a11yProps(1)} /> : null}
                </Tabs>
              </Box>
            )}
            <EditTabPanel value={value} index={0}>
              <Paper>
                {children}

                <Box my={1} mx={3}>
                  <Divider></Divider>
                </Box>

                <Box p={3}>
                  <Box display='flex' justifyContent='flex-end' className='form-buttons'>
                    {/* save button */}
                    {hideSave ? null : (
                      <Button size='large' color='primary' onClick={handleSave} disabled={!canSave}>
                        Save
                      </Button>
                    )}
                    <Button size='large' variant='outlined' color='primary' onClick={(): void => handleClose(false)}>
                      Cancel and Exit
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </EditTabPanel>

            <EditTabPanel value={value} index={1}>
              <HistoryPage {...historyParams} />
            </EditTabPanel>
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
