import React from 'react';
import { Button, StandardTextFieldProps } from '@material-ui/core';

interface FileInputProps extends StandardTextFieldProps {
  buttonText?: string
  onFileChosen: (fieldName: string, files: FileList) => void;
}

export default function FileInput1(props: FileInputProps) {
  const { id, buttonText, onFileChosen } = props;

  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name;
    const files = event.target.files;
    onFileChosen(field, files);
  }

  return (
    // <label htmlFor={id}>
    <label >
      <input
        accept='*.csv'
        multiple={false}
        style={{ display: 'none' }}
        // id={id}
        name='csv'
        type='file'
        onChange={change}
      />
      <Button color='secondary' variant='contained' component='span'>
        {buttonText ?? 'Upload'}
      </Button>
    </label>
  );
}
