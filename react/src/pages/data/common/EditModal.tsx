import { IUpsertPayload } from 'api/api_interfaces';
import { EditModalBaseProps, ModalBaseProps } from 'components/component_interfaces';
import ChangeContext from 'contexts/InputChangeContext';
import { ReactNode, useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { omitNull } from 'utils/common_helpers';
import { IHistoryPageProps } from 'pages/data/common/HistoryPage';
import { EditTabPanel, a11yProps } from 'pages/data/common/EditModalComponents';

import HistoryPage from './HistoryPage';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { Button, Modal } from 'components/common';
import useDidMountEffect from 'hooks/useDidMountEffect';

import { Box, Container, Divider, Paper, Tabs, Tab } from '@mui/material';
import { BCTWBase } from 'types/common_types';
import useFormHasError from 'hooks/useFormHasError';
import { InboundObj } from 'types/form_types';
import { buttonProps } from 'components/component_constants';
import { Typography } from '@mui/material';
import { User } from 'types/user';

export type IEditModalProps<T> = EditModalBaseProps<T> & {
  children: ReactNode;
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
/**
 * note: don't need to pass the object being edited to Editmodal, it only needs
 * an instance of T with the identifier (ex. critter_id)
 * to preserve the class methods when save is called
 * see EditCritter
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

  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr, resetErrs] = useFormHasError();
  // an empty object to assign changed properties of T to
  const [newObj, setNewObj] = useState<T>({} as T);
  // history-related & tab state
  const [showHistory, setShowHistory] = useState(false);
  const [historyParams, setHistoryParams] = useState<IHistoryPageProps<T>>();
  const [currentTabID, setCurrentTabID] = useState(0);
  const [openFullScreen, setOpenFullScreen] = useState(false);
  // state handler for when the history / current properties tab is selected
  const handleSwitchTab = (newValue: number): void => {
    setCurrentTabID(newValue);
  };

  // set the history query status
  useDidMountEffect(() => {
    const params: Pick<IHistoryPageProps<T>, 'param' | 'propsToDisplay'> = {
      param: editing[editing.identifier],
      propsToDisplay: editing.displayProps,
    };
    if (editing instanceof Animal) {
      params.propsToDisplay = editing.historyDisplayProps();
      setHistoryParams({ query: api.useCritterHistory, ...params });
    } else if (editing instanceof Collar) {
      params.propsToDisplay = editing.historyDisplayProps();
      setHistoryParams({ query: api.useCollarHistory, ...params });
    }
  }, [editing]);
  
  // when the modal opens, disable save
  useDidMountEffect(() => {
    console.log(open);
    if (open) {
      setCanSave(!hasErr);
      setOpenFullScreen(true);
    }
  }, [open]);

  // if the error state changes, update the save status
  useDidMountEffect(() => {
    setCanSave(!hasErr);
  }, [hasErr]);

  useDidMountEffect(() => {
    setCanSave(!hasErr);
  }, [newObj]);

  //useEffect(()=>{console.log('editing')},[editing]);

  const handleSave = async (): Promise<void> => {
    // use Object.assign to preserve class methods
    const body = omitNull(Object.assign(editing, newObj));
    const toSave: IUpsertPayload<T> = { body };
    await onSave(toSave);
    // todo: when to close the modal?
    onClose();
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
    setNewObj({} as T);
    resetErrs();
    setShowHistory(false);
    setCanSave(false);
    if (typeof onReset === 'function') {
      onReset();
    }
  };

  const onClose = () => {
    reset();
    handleClose(false);
    if(showInFullScreen){
      setOpenFullScreen(false);
    }
  }

  const Children = (
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
                  onChange={(e, v): void => handleSwitchTab(v)}
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
                  <Box display='flex' alignItems={'center'} justifyContent='flex-end' className='form-buttons'>
                    {hideSave ? null : (
                      <>
                        {hasErr ? <Typography mr={1}>Fields marked with * are required</Typography> : null}
                        <Button {...buttonProps} onClick={handleSave} disabled={!canSave}>
                          Save
                        </Button>
                      </>
                    )}
                    <Button {...buttonProps} variant='outlined' onClick={(): void => onClose()}>
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

  const modalProps: ModalBaseProps = { open, handleClose: onClose, title };
  return showInFullScreen ? (
    <FullScreenDialog open={openFullScreen} handleClose={onClose} title={title}>{Children}</FullScreenDialog>
  ) : (
    <Modal open={open} handleClose={onClose} title={title}>{Children}</Modal>
  );
}
