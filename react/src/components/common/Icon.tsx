import {
  mdiAccessPoint,
  mdiAccount,
  mdiAccountPlus,
  mdiAccountSupervisor,
  mdiAlarmOff,
  mdiAlarmSnooze,
  mdiAlert,
  mdiAlertCircle,
  mdiAlertRhombus,
  mdiArrowDownBold,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowUpBold,
  mdiBattery20,
  mdiBell,
  mdiBrush,
  mdiCancel,
  mdiChartTimelineVariant,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronDown,
  mdiChevronUp,
  mdiCircle,
  mdiClose,
  mdiDatabase,
  mdiDevTo,
  mdiDotsHorizontal,
  mdiExclamationThick,
  mdiEye,
  mdiEyePlus,
  mdiFileMultiple,
  mdiFilterOutline,
  mdiGraveStone,
  mdiHelpCircle,
  mdiHome,
  mdiKey,
  mdiKeyboardBackspace,
  mdiLock,
  mdiLockOpenCheck,
  mdiMagnify,
  mdiMapMarker,
  mdiMinus,
  mdiPageFirst,
  mdiPageLast,
  mdiPaw,
  mdiPencil,
  mdiPlus,
  mdiRefresh,
  mdiReplay,
  mdiRouterWireless,
  mdiSend,
  mdiShare,
  mdiSleep,
  mdiTrashCanOutline,
  mdiViewDashboard
} from '@mdi/js';
import Icon from '@mdi/react';

type IconProps = {
  icon: string;
  htmlColor?: string;
  size?: number;
  rotate?: number;
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
    case 'arrow-down':
      return mdiArrowDownBold;
    case 'cannotSnooze':
      return mdiAlarmOff;
    case 'backspace':
      return mdiKeyboardBackspace;
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
    case 'dead':
      return mdiGraveStone;
    case 'refresh':
      return mdiRefresh;
    case 'back-extended':
      return mdiKeyboardBackspace;
    case 'low-battery':
      return mdiBattery20;
    case 'dev':
      return mdiDevTo;
    case 'send':
      return mdiSend;
    case 'signal':
      return mdiAccessPoint;
    case 'exclaim':
      return mdiExclamationThick;
  }
};

export default function BCTWIcon({ icon, htmlColor, rotate, size = 1 }: IconProps): JSX.Element {
  return <Icon path={getIconPath(icon)} rotate={rotate} color={htmlColor} className={'icon'} size={size} />;
}
