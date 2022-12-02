import { Box, Checkbox, Tooltip, Typography } from "@mui/material";
import { Icon } from "components/common";
import { useState } from "react";


export type WarningPromptsProps = {
    prompts: string[];
    onAllChecked: () => void;
    onNotAllChecked: () => void;
}

export default function WarningPrompts (props: WarningPromptsProps): JSX.Element {
    const { prompts, onAllChecked, onNotAllChecked } = props;
    const [checks, setChecks] = useState(new Array(prompts.length).fill(false));

    const handleCheck = (checked: boolean, idx: number) => {
        const temp = checks.slice();
        temp[idx] = checked;
        setChecks(temp);
        if(temp.every(o => o == true)) {
            onAllChecked();
        }
        else {
            onNotAllChecked();
        }
    }

    return (
        <>
            {
                prompts.map((str, idx) => 

                        <Box gap={'10px'} alignItems={'center'} display={'inline-flex'}>
                            <Checkbox onChange={(e, b) => handleCheck(b, idx)} />
                            <p>{str}</p>
                            <Tooltip arrow placement="top"  title={'Placeholder text paragraph where we would instruct the user that they are being warned big time about the bad things that they might be doing to our Caribou database full of critters.'}>
                                <div><Icon icon='help' /></div>
                            </Tooltip>
                            
                        </Box>
                    )
            }
        </>
    )
}

/*
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
                    <td id={`cell${str}${idx}`}>
                        <Box gap={'10px'} alignItems={'center'} display={'inline-flex'}>
                            <p>{str}</p>
                            <Tooltip title={'Placeholder text paragraph where we would instruct the user that they are being warned big time about the bad things that they might be doing to our Caribou database full of critters.'}>
                                <div><Icon icon='help' /></div>
                            </Tooltip>
                            
                        </Box>
                    </td>
                    <td>
                        <Checkbox onChange={(e, b) => handleCheck(b, idx)} />
                    </td>
                </tr>)
            }
            </tbody>
        </table>
        </>
        */