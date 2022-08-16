import { IconButton } from '@mui/material';
import { CritterStrings } from 'constants/strings';
import { useRef, useState } from 'react';
import { InboundObj } from 'types/form_types';
import SelectCode from './SelectCode';
import { Icon, Tooltip } from 'components/common';
interface SpeciesSelectProps {
  handleChange: (v: InboundObj) => void;
  value: string;
  useLock?: boolean;
}

export const SpeciesSelect = ({ handleChange, value, useLock }: SpeciesSelectProps): JSX.Element => {
  const SPECIES_STR = 'species';
  const [lockSpecies, setLockSpecies] = useState(useLock);
  const inputRef = useRef(null);
  console.log(inputRef.current?.value);
  return (
    <>
      <SelectCode
        //style={style}
        //key={`${label}-select`}
        //label={label}
        disabled={lockSpecies}
        codeHeader={SPECIES_STR}
        defaultValue={typeof value === 'string' ? value : ''}
        changeHandler={handleChange}
        required={false}
        //error={'Test error'}
        inputRef={inputRef}
        propName={SPECIES_STR}
      />
      {useLock && 
      <IconButton key='udf-icon' onClick={() => setLockSpecies((l) => !l)}>
        {lockSpecies ? (
          <Tooltip children={<Icon icon='lock' />} title={CritterStrings.lockedSpeciesTooltip} />
        ) : (
          <Tooltip children={<Icon icon='unlocked' />} title={CritterStrings.unlockedSpeciesTooltip} />
        )}
      </IconButton>
      }

    </>
  );
};
