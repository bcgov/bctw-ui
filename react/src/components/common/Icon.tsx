import {
  mdiFileMultiple,
  mdiClose,
  mdiAlarmOff,
  mdiAccountSupervisor,
  mdiPaw,
  mdiRouterWireless,
  mdiArrowUpBold,
  mdiViewDashboard,
  mdiCheck,
  mdiPencil,
  mdiAlertCircle,
  mdiMinus,
  mdiAccount,
  mdiAccountPlus,
  mdiAlarmSnooze,
  mdiAlert,
  mdiHome,
  mdiKey,
  mdiPlus,
  mdiReplay,
  mdiShare,
  mdiHelpCircle,
  mdiArrowLeft,
  mdiArrowRight,
  mdiPageFirst,
  mdiTrashCanOutline,
  mdiChartTimelineVariant,
  mdiMapMarker,
  mdiPageLast,
  mdiDatabase,
  mdiLock,
  mdiLockOpenCheck,
  mdiMagnify,
  mdiFilterOutline,
  mdiBrush,
  mdiCancel,
  mdiCircle,
  mdiAlertRhombus,
  mdiSleep,
  mdiBell,
  mdiChevronDown,
  mdiChevronUp,
  mdiEye,
  mdiEyePlus,
  mdiDotsHorizontal,
  mdiCheckCircle
} from '@mdi/js';
import Icon from '@mdi/react';

type IconProps = {
  icon: string;
  htmlColor?: string;
};

const getIconPath = (path: string): string => {
  path = path.toLowerCase();
  switch (path) {
    //Use lowercase for cases.
    case 'admin':
      return mdiAccountSupervisor;
    case 'animals':
      return mdiPaw;
    case 'arrow-up':
      return mdiArrowUpBold;
    case 'cannotSnooze':
      return mdiAlarmOff;
    case 'back':
      return mdiArrowLeft;
    case 'next':
      return mdiArrowRight;
    case 'down':
      return mdiChevronDown;
    case 'up':
      return mdiChevronUp;
    case 'last':
      return mdiPageLast;
    case 'close':
      return mdiClose;
    case 'copy':
      return mdiFileMultiple;
    case 'data':
      return mdiViewDashboard;
    case 'delete':
      return mdiTrashCanOutline;
    case 'devices':
      return mdiRouterWireless;
    case 'done':
      return mdiCheck;
    case 'edit':
      return mdiPencil;
    case 'error':
      return mdiAlertCircle;
    case 'first':
      return mdiPageFirst;
    case 'forward':
      return mdiArrowRight;
    case 'help':
      return mdiHelpCircle;
    case 'home':
      return mdiHome;
    case 'key':
      return mdiKey;
    case 'location':
      return mdiMapMarker;
    //case 'person':
    case 'profile':
      return mdiAccount;
    case 'personadd':
      return mdiAccountPlus;
    case 'plus':
      return mdiPlus;
    case 'remove':
      return mdiMinus;
    case 'reset':
      return mdiReplay;
    case 'share':
      return mdiShare;
    case 'snooze':
      return mdiAlarmSnooze;
    case 'timeline':
      return mdiChartTimelineVariant;
    case 'warning':
      return mdiAlert;
    case 'database':
      return mdiDatabase;
    case 'lock':
      return mdiLock;
    case 'unlocked':
      return mdiLockOpenCheck;
    case 'search':
      return mdiMagnify;
    case 'filter':
      return mdiFilterOutline;
    case 'symbolize':
      return mdiBrush;
    case 'cancel':
      return mdiCancel;
    case 'circle':
      return mdiCircle;
    case 'alert':
      return mdiAlertRhombus;
    case 'zzz':
      return mdiSleep;
    case 'bell':
      return mdiBell;
    case 'eye':
      return mdiEye;
    case 'eyeplus':
      return mdiEyePlus;
    case 'dots':
      return mdiDotsHorizontal;
    case 'check':
      return mdiCheckCircle;
  }
};

export default function BCTWIcon({ icon, htmlColor }: IconProps): JSX.Element {
  return <Icon path={getIconPath(icon)} color={htmlColor} className={'icon'} size={1} />;
}
