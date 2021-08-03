import AccessibilityIcon from '@material-ui/icons/Accessibility';
import Add from '@material-ui/icons/Add';
import AlarmOffIcon from '@material-ui/icons/AlarmOff';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import CloseIcon from '@material-ui/icons/Close';
import CodeIcon from '@material-ui/icons/Code';
import Dashboard from '@material-ui/icons/Dashboard';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import ErrorIcon from '@material-ui/icons/Error';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import HomeIcon from '@material-ui/icons/Home';
import PersonIcon from '@material-ui/icons/Person';
import Pets from '@material-ui/icons/Pets'
import Remove from '@material-ui/icons/Remove';
import RouterIcon from '@material-ui/icons/Router';
import ReplayIcon from '@material-ui/icons/Replay';
import ShareIcon from '@material-ui/icons/Share';
import SnoozeIcon from '@material-ui/icons/Snooze';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import WarningIcon from '@material-ui/icons/Warning';
import { cloneElement } from 'react';

const mappings: Record<string, JSX.Element> = {
  'arrow-down': <ArrowDownward />,
  'arrow-up': <ArrowUpward />,
  admin: <SupervisorAccountIcon />,
  animals: <Pets />,
  cannotSnooze: <AlarmOffIcon />,
  close: <CloseIcon />,
  code: <CodeIcon />,
  devices: <RouterIcon />,
  copy: <FileCopyIcon />,
  data: <Dashboard />,
  done: <DoneIcon />,
  edit: <EditIcon />,
  error: <ErrorIcon htmlColor='orange' />,
  home: <HomeIcon />,
  person: <AccessibilityIcon />,
  plus: <Add />,
  profile: <PersonIcon />,
  remove: <Remove />,
  reset: <ReplayIcon />,
  share: <ShareIcon />,
  snooze: <SnoozeIcon />,
  warning: <WarningIcon htmlColor='orange' />,
};

type IconProps = {
  icon: string;
  htmlColor?: string;
};

export default function Icon({ icon, htmlColor }: IconProps): JSX.Element {
  return cloneElement(mappings[icon], { htmlColor })
}