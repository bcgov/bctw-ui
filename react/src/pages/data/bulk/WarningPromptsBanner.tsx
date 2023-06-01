import { Banner, BannerProps } from 'components/alerts/Banner';
import WarningPrompts, { WarningPromptsProps } from './WarningPrompts';

type WarningPromptsBannerProps = WarningPromptsProps &
  Pick<BannerProps, 'text'> & {
    allClearText: string;
    allChecked: boolean;
  };
/**
 *
 */
export default function WarningPromptsBanner(props: WarningPromptsBannerProps): JSX.Element {
  const { allClearText, text, prompts, setWarningChecked, allChecked } = props;
  return (
    <Banner
      variant={allChecked ? 'success' : 'warning'}
      text={allChecked ? allClearText : text}
      action={prompts.length > 0 ? 'collapse' : null}
      hiddenContent={[<WarningPrompts prompts={prompts} setWarningChecked={setWarningChecked} />]}
    />
  );
}
