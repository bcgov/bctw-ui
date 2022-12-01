import { Checkbox } from "@mui/material";


type WarningPromptsProps = {
    prompts: string[];
    onAllChecked?: () => void;
    onNotAllChecked?: () => void;
}

export default function WarningPrompts (props: WarningPromptsProps): JSX.Element {
    const { prompts, onAllChecked, onNotAllChecked } = props;
    return (
        <>
        <table id='warning-prompt-table'>
            <thead>
                <tr>
                    <td><b>Warning Prompt</b></td>
                    <td><b>Confirm</b></td>
                </tr>
            </thead>
            <tbody id='warning-prompt-body'>
            {
                prompts.map((str, idx) => 
                <tr id={`row${str}${idx}`}>
                    <td id={`cell${str}${idx}`}>{str}</td>
                    <td><Checkbox onChange={() => {}} /></td></tr>)
            }
            </tbody>
        </table>
        </>
    )
}