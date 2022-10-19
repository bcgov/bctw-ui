import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/styles';
import { useState } from 'react';

interface InfoCardProps {
  element: JSX.Element;
  body?: string;
  subTitle?: string;
  size?: 'small' | 'large';
  noRightMargin?: boolean;
  hoverRaise?: boolean;
}
export const InfoCard = ({ element, body, subTitle, size, noRightMargin, hoverRaise }: InfoCardProps) => {
  const theme = useTheme();
  const [raised, setRaised] = useState(false);
  return (
    <Box>
      <Card
        onMouseOver={() => setRaised(true)}
        onMouseOut={() => setRaised(false)}
        raised={hoverRaise ? raised : false}
        sx={{
          width: size === 'small' ? '12rem' : '26rem',
          height: '8rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          p: 3,
          mr: noRightMargin ? 0 : theme.spacing(4),
          boxShadow: hoverRaise ? null : 3,
          marginTop: theme.spacing(2)
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
