import { Box } from '@mui/material';
import React from 'react';

interface DottedBorderBoxProps {
  children?: JSX.Element;
}

export const DottedBorderBox = (props: DottedBorderBoxProps) => {
  const { children } = props;
  return (
    <Box
      sx={{
        border: '3px dashed grey',
        minWidth: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '4rem'
      }}>
      {children}
    </Box>
  );
};
