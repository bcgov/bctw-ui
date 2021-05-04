import Add from '@material-ui/icons/Add';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import HomeIcon from '@material-ui/icons/Home';
import Remove from '@material-ui/icons/Remove';
import Grain from '@material-ui/icons/Grain';
import Terrain from '@material-ui/icons/Terrain'
import Dashboard from '@material-ui/icons/Dashboard';
import Pets from '@material-ui/icons/Pets'
import Devices from '@material-ui/icons/Devices';
import BarChart from '@material-ui/icons/BarChart';
import PersonIcon from '@material-ui/icons/Person';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import FilterListIcon from '@material-ui/icons/FilterList';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

const mappings: Record<string, JSX.Element> = {
  data: <Dashboard />,
  map: <Grain />,
  terrain: <Terrain />,
  home: <HomeIcon />,
  remove: <Remove />,
  plus: <Add />,
  critter: <Pets/>,
  collar: <Devices/>,
  code: <BarChart/>,
  'arrow-up': <ArrowUpward />,
  'arrow-down': <ArrowDownward />,
  profile: <PersonIcon />,
  admin: <SupervisorAccountIcon />,
  done: <DoneIcon />,
  close: <CloseIcon />,
  filter: <FilterListIcon />,
  error: <ErrorIcon htmlColor='orange'/>,
  edit: <EditIcon />,
  copy: <FileCopyIcon />,
};

type IconProps = {
  icon: string;
  color?: string;
};

export default function Icon ({icon, color}: IconProps): JSX.Element {
  return mappings[icon];
}