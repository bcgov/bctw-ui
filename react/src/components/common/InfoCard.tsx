import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/styles';
import { useState } from 'react';
import { Button, CardActions, CardContent } from '@mui/material';
import { Icon } from 'components/common';

interface InfoCardProps {
  element: JSX.Element;
  body?: string;
  subTitle?: string;
  size?: 'small' | 'large';
  noRightMargin?: boolean;
  hoverRaise?: boolean;
  handleDetails?: () => void;
}
export const InfoCard = ({
  element,
  body,
  subTitle,
  size,
  noRightMargin,
  hoverRaise,
  handleDetails
}: InfoCardProps) => {
  const theme = useTheme();
  const [raised, setRaised] = useState(false);
  return (
    <Card
      onMouseOver={() => hoverRaise && setRaised(true)}
      onMouseOut={() => hoverRaise && setRaised(false)}
      onClick={() => (handleDetails ? handleDetails() : null)}
      raised={hoverRaise ? raised : false}
      sx={{
        width: size === 'small' ? '12rem' : '26rem',
        height: '9rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        mr: noRightMargin ? 0 : theme.spacing(4),
        cursor: raised ? 'pointer' : 'default',
        marginTop: theme.spacing(2)
      }}>
      <>&#8205;</>
      <Box px={3}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Box>{element}</Box>
          <Box pl={1.5}>{body}</Box>
        </Box>
        {subTitle ? <Typography color='text.secondary'>{subTitle}</Typography> : null}
      </Box>
      <CardActions sx={{ py: 0 }}>
        {handleDetails && (
          <Button
            disableRipple
            sx={{ marginLeft: 'auto', pt: 0, '&:hover': { backgroundColor: 'transparent' } }}
            endIcon={<Icon icon={'next'} size={0.8} />}>
            See Details
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
