import { Banner, BannerProps } from 'components/alerts/Banner';
import WarningPrompts, { WarningPromptsProps } from './WarningPrompts';

type WarningPromptsBannerProps = WarningPromptsProps &
  Pick<BannerProps, 'text'> & {
    allClearText: string;
    allChecked: boolean;
    unspecifiedCritterRows: number[]; 
  };
/**
 *
 */
export default function WarningPromptsBanner(props: WarningPromptsBannerProps): JSX.Element {
  const { allClearText, text, prompts, setWarningChecked, allChecked, unspecifiedCritterRows } = props;
  return (
      unspecifiedCritterRows.length ? 
      (<Banner 
        variant={'warning'} 
        text={
        `It was not possible to determine whether some rows were existing critters or not. 
        Please manually choose the correct critter for row${unspecifiedCritterRows.length ? 's' : ''}
        ${unspecifiedCritterRows.join(', ')}. 
        If none of the options appear correct, just choose New Critter.`} 
      />) : 
      (<Banner
        variant={allChecked ? 'success' : 'warning'}
        text={allChecked ? allClearText : text}
        action={prompts.length > 0 ? 'collapse' : null}
        hiddenContent={[<WarningPrompts prompts={prompts} setWarningChecked={setWarningChecked} />]}
      />)
  );
}
