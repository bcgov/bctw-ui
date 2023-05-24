import { Box, Button, Dialog, Grid, IconButton } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import modalStyles from 'components/modal/modal_styles';
import { ModalProps } from 'components/component_interfaces';
import { Icon } from 'components/common';
import { removeProps } from 'utils/common_helpers';

export default function Modal(props: ModalProps): JSX.Element {
  const { disableBackdropClick, open, title, handleClose, children, useButton, onEnteredCallback, headercomp } = props;
  const propsToPass = removeProps(props, ['handleClose', 'disableBackdropClick', 'useButton']);
  const classes = modalStyles();
  return (
    <Dialog
      className={'dialog-modal'}
      open={open}
      onClose={() => handleClose(false)}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      {...propsToPass}>
      <Fade
        in={open}
        onEntered={() => {
          onEnteredCallback?.();
        }}>
        <div className={classes.paper}>
          <Grid container alignItems='center' justifyContent='space-between'>
            <Grid item>{headercomp ? headercomp : <h3>{title}</h3>}</Grid>
            <Grid item>
              {/* if this prop was passed, dont show the close button */}
              {/* <div className={classes.headerBox}> */}
              {disableBackdropClick ? null : useButton ? (
                <Button variant='outlined' onClick={(): void => handleClose(false)} size='small'>
                  Close
                </Button>
              ) : (
                <IconButton onClick={(): void => handleClose(false)}>
                  <Icon icon='close' />
                </IconButton>
              )}
            </Grid>
          </Grid>
          <div>{children}</div>
        </div>
      </Fade>
    </Dialog>
  );
}
