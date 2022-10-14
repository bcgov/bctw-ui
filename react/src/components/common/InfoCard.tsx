import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
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
          width: size == 'large' ? '24rem' : '12rem',
          p: 3,
          boxShadow: 3
        }}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box pr={3}>{element}</Box>
          {body}
        </Box>
        {subTitle && <Typography color='text.secondary'>{subTitle}</Typography>}
      </Card>
    </Box>
  );
};
