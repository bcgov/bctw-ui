import React from 'react';
import { Button, StandardTextFieldProps } from '@mui/material';

export interface FileInputProps extends StandardTextFieldProps {
  buttonText?: string;
  multiple?: boolean;
  fileName?: string;
  buttonVariant?: 'contained' | 'outlined' | 'text';
  accept: '.keyx' | '.csv' | '.zip' | '.xlsx';
  onFileChosen: (fieldName: string, files: FileList) => void;
}

export default function FileInput(props: FileInputProps): JSX.Element {
  const { buttonText, onFileChosen, multiple, fileName, accept, disabled, buttonVariant } = props;

  const change = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const field = event.target.name;
    const files = event.target.files;
    onFileChosen(field, files);
  };

  return (
    // for some reason this label needs to be here to show the choose file modal
    <label>
      <input
        accept={accept}
        multiple={multiple ?? false}
        style={{ display: 'none' }}
        name={fileName ?? 'csv'} // note file name, server will look for this file
        type='file'
        onChange={change}
        disabled={disabled}
      />
      <Button disabled={disabled} color='primary' variant={buttonVariant ?? 'contained'} component='span'>
        {buttonText ?? 'Upload'}
      </Button>
    </label>
  );
}
