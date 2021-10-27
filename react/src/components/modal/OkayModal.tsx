import { Button, Modal } from 'components/common';
import { ModalProps } from 'components/component_interfaces';
import { Box } from '@mui/material';

export default function OkayModal(props: ModalProps): JSX.Element {
  const { handleClose, open, children } = props;
  return (
    <Modal handleClose={handleClose} open={open}>
      <Box mb={3}>{children}</Box>
      <Box display='flex' justifyContent='center'>
        <Button variant='contained' onClick={(): void => handleClose(false)}>
          Ok
        </Button>
      </Box>
    </Modal>
  );
}
