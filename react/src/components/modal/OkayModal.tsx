import { Modal } from 'components/common';
import { ModalProps } from 'components/component_interfaces';
import { Box, Button } from '@material-ui/core';

export default function OkayModal(props: ModalProps): JSX.Element {
  const { handleClose, open, children } = props;
//   const bProps = { display: 'flex', justifyContent: 'center'}
  return (
    <Modal disableBackdropClick={true} handleClose={handleClose} open={open}>
      <Box mb={3}>{children}</Box>
      <Box display='flex' justifyContent='center'>
        <Button size='large' color='primary' variant='contained' onClick={(e): void => handleClose(false)}>
          Ok
        </Button>
      </Box>
    </Modal>
  );
}
