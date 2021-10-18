import { Theme, Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { removeProps } from 'utils/common_helpers';

const ttProps: Pick<TooltipProps, 'enterDelay' | 'placement'> = {
  enterDelay: 750,
  placement: 'right-start'
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      fontSize: 16
    }
  })
);

type TooltipProps = MuiTooltipProps & {
  nestedClass?: string;
  inline?: boolean;
};

/**
 * note: wrapping tooltip child in div fixes the forward refs error
 * @param inline - whether or not the div should be inline / block
 * @param nestedClass - alternatively, pass a classname for the div
 * the tooltip props will default to the @var ttProps
 */
export default function Tooltip(props: TooltipProps): JSX.Element {
  const classes = useStyles();
  return (
    <MuiTooltip className={classes.tooltip} {...ttProps} {...removeProps(props, ['inline'])}>
      <div style={{ display: props.inline ? 'inline' : 'block' }}
        className={props.nestedClass}>
        {props.children}
      </div>
    </MuiTooltip>
  );
}
