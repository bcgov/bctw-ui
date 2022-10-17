import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface InfoCardProps {
  element: JSX.Element;
  body?: string;
  subTitle?: string;
  size?: 'small' | 'large';
}
export const InfoCard = ({ element, body, subTitle, size }: InfoCardProps) => {
  return (
    <Box mt={2}>
      <Card
        sx={{
          width: size === 'small' ? '16rem' : '26rem',
          height: '8rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          p: 3,
          boxShadow: 3
        }}>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {element}
            <Box pl={1.5}>{body}</Box>
          </Box>
          <Box>{subTitle ? <Typography color='text.secondary'>{subTitle}</Typography> : null}</Box>
        </Box>
      </Card>
    </Box>
  );
};
