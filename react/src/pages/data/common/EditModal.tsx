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
import { InboundObj } from 'types/form_types';
import { buttonProps } from 'components/component_constants';

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
 * @param disableHistory the 'show history' button
 * @param showInFullScreen render as a modal or fullscreen dialog?
 * @param onReset a close handler since default handler is overwritten in AddEditViewer
 * @param onSave the parent handler called when the save button is clicked
 * @param headerComponent
 */
export default function EditModal<T extends BCTWBase<T>>(props: IEditModalProps<T>): JSX.Element {
  const api = useTelemetryApi();
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
  // a copy of the object being edited.
  const [newObj, setNewObj] = useState<T>(Object.assign({}, editing));
  // history-related state
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyParams, setHistoryParams] = useState<IHistoryPageProps<T>>();

  const [currentTabID, setCurrentTabID] = React.useState(0);

  // state handler for when the history / current properties tab is selected
  const handleSwitchTab = (event: React.ChangeEvent<{ 1 }>, newValue: number): void => {
    setCurrentTabID(newValue);
  };

  // set the history query status
  useEffect(() => {
    const updateParams = (): void => {
      if (editing instanceof Animal) {
        setHistoryParams({
          query: api.useCritterHistory,
          param: editing.critter_id,
          propsToDisplay: (editing.displayProps) // show all Animal properties
        });
      } else if (editing instanceof Collar) {
        setHistoryParams({
          query: api.useCollarHistory,
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

  useDidMountEffect(() => {
    setCanSave(!hasErr);
  }, [newObj])

  const handleSave = (): void => {
    // use Object.assign to preserve class methods
    const body = omitNull(Object.assign(editing, newObj));
    const toSave: IUpsertPayload<T> = { body };
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: InboundObj): void => {
    checkHasErr(newProp);
    // todo: determine if object has changed from original
    // const [key, value] = parseFormChangeResult<typeof editing>(newProp);
    // const isSame = editing[key] === value;
    // console.log(newProp, editing[key], isSame)
    const modified = { ...newObj, ...newProp };
    setNewObj(modified);
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
                  value={currentTabID}
                  onChange={handleSwitchTab}
                  aria-label='simple tabs example'
                  indicatorColor='primary'
                  textColor='primary'>
                  <Tab label='Details' {...a11yProps(0)} />
                  {!disableHistory ? <Tab label='History' {...a11yProps(1)} /> : null}
                </Tabs>
              </Box>
            )}
            <EditTabPanel value={currentTabID} index={0}>
              <Paper>
                {children}

                <Box my={1} mx={3}>
                  <Divider></Divider>
                </Box>

                <Box p={3}>
                  <Box display='flex' justifyContent='flex-end' className='form-buttons'>
                    {hideSave ? null : (
                      <Button {...buttonProps} onClick={handleSave} disabled={!canSave}>
                        Save
                      </Button>
                    )}
                    <Button {...buttonProps} variant='outlined' onClick={(): void => handleClose(false)}>
                      Cancel and Exit
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </EditTabPanel>

            <EditTabPanel value={currentTabID} index={1}>
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
