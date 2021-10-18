import { Modal } from 'components/common';
import { ModalProps } from 'components/component_interfaces';
import { Box, Button } from '@mui/material';

export default function OkayModal(props: ModalProps): JSX.Element {
  const { handleClose, open, children } = props;
//   const bProps = { display: 'flex', justifyContent: 'center'}
  return (
    <Modal// `disableBackdropClick` is removed by codemod.
// You can find more details about this breaking change in [the migration guide](https://mui.com/guides/migration-v4/#modal)
 handleClose={handleClose} open={open}>
      <Box mb={3}>{children}</Box>
      <Box display='flex' justifyContent='center'>
        <Button size='large' color='primary' variant='contained' onClick={(e): void => handleClose(false)}>
          Ok
        </Button>
      </Box>
    </Modal>
  );
}
