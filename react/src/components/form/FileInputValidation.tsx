import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Icon } from 'components/common';
import { DottedBorderBox } from 'components/common/partials/DottedBorderBox';
import FileInput, { FileInputProps } from './FileInput';

interface FileInputValidation extends FileInputProps {
  filename: string;
  trashIconClick: () => void;
  validationSuccess: boolean;
  isLoading?: boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    '& .MuiCircularProgress-root': {
      display: 'inline-block',
      top: '0%',
      bottom: '0%',
      left: '0%',
      position: 'relative',
      height: '36.5px !important',
      width: '36.5px !important',
      marginLeft: '0px',
      marginRight: '0px',
      marginTop: '0px'
    }
  }
}));

/**
 * @param filename
 * @param onFileChosen handler for the uploaded file
 * @param trashIconClick handler for the delete / remove of the file
 */
export default function FileInputValidation(props: FileInputValidation): JSX.Element {
  const { filename, onFileChosen, trashIconClick, validationSuccess, buttonText, buttonVariant, accept, isLoading } =
    props;
  const styles = useStyles();

  const handleFileChange = (fieldName: string, files: FileList): void => {
    onFileChosen(fieldName, files);
  };

  const handleFileRemove = () => {
    trashIconClick();
  };

  const conditionalRender = (): JSX.Element => {
    if (isLoading) {
      return <CircularProgress />;
    } else if (filename.length > 0) {
      return (
        <>
          <Typography>{filename}</Typography>
          <Icon htmlColor={validationSuccess ? 'green' : 'red'} icon={validationSuccess ? 'check' : 'error'}></Icon>
          <IconButton style={{ padding: '0px' }} onClick={() => handleFileRemove()}>
            <Icon icon='delete' />
          </IconButton>
        </>
      );
    } else {
      return (
        <FileInput
          fileName='validated-file'
          buttonText={buttonText}
          buttonVariant={buttonVariant}
          accept={accept}
          onFileChosen={handleFileChange}
        />
      );
    }
  };

  return (
    <Box className={styles.paper}>
      <DottedBorderBox>{conditionalRender()}</DottedBorderBox>
    </Box>
  );
}
