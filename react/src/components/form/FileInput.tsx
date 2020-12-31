import React from 'react';
import { Button, StandardTextFieldProps } from '@material-ui/core';

interface FileInputProps extends StandardTextFieldProps {
  buttonText?: string
  onFileChosen: (fieldName: string, files: FileList) => void;
}

export default function FileInput(props: FileInputProps):JSX.Element {
  const { buttonText, onFileChosen } = props;

  const change = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const field = event.target.name;
    const files = event.target.files;
    onFileChosen(field, files);
  }

  return (
    <label >
      <input
        accept='*.csv'
        multiple={false}
        style={{ display: 'none' }}
        name='csv' // note file name, server will look for this file
        type='file'
        onChange={change}
      />
      <Button color='secondary' variant='contained' component='span'>
        {buttonText ?? 'Upload'}
      </Button>
    </label>
  );
}
