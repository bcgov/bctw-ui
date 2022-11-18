import { useTheme } from '@mui/styles';
import Icon from 'components/common/Icon';
import { TelemetryAlert } from 'types/alert';

interface AlertIconProps {
  alert: TelemetryAlert;
}
/**
 * @param alert TelemetryAlert
 * Generates the correct icon for an alert
 */
export const AlertIcon = ({ alert }: AlertIconProps): JSX.Element => {
  const theme = useTheme();
  const defaultStyle = { icon: 'warning', htmlColor: theme.palette.warning.main };
  const StyleMap = {
    mortality: {
      icon: 'error',
      htmlColor: theme.palette.error.main
    },
    malfunction: {
      ...defaultStyle
    },
    battery: {
      icon: 'low-battery',
      htmlColor: theme.palette.warning.main
    }
  };
  const obj = StyleMap[alert.alert_type] ?? { ...defaultStyle };
  return <Icon {...obj} />;
};
