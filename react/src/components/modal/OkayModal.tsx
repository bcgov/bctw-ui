import { Button, Modal } from 'components/common';
import { ModalProps } from 'components/component_interfaces';
import { Box } from '@mui/material';
import { removeProps } from 'utils/common_helpers';

export default function OkayModal(props: ModalProps & { handleOkay?: () => void }): JSX.Element {
  const { handleClose, open, children, handleOkay } = props;
  return (
    <Modal handleClose={handleClose} open={open} {...removeProps(props, ['handleOkay'])}>
      <Box mb={3}>{children}</Box>
      <Box display='flex' justifyContent='center'>
        <Button
          variant='contained'
          onClick={(): void => {
            handleOkay?.();
            handleClose(false);
          }}>
          Ok
        </Button>
      </Box>
    </Modal>
  );
}
