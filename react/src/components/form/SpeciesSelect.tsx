import { IconButton } from '@mui/material';
import { CritterStrings } from 'constants/strings';
import { useEffect, useRef, useState } from 'react';
import { InboundObj } from 'types/form_types';
import SelectCode from './SelectCode';
import { Icon, Tooltip } from 'components/common';
import { useUISpecies, useUpdateSpecies, useSpecies } from 'contexts/SpeciesContext';
import { SPECIES_STR } from 'utils/species';
import ConfirmModal from 'components/modal/ConfirmModal';
import { speciesModalMessage } from 'constants/formatted_string_components';
import useDidMountEffect from 'hooks/useDidMountEffect';
interface SpeciesSelectProps {
  handleChange: (v: InboundObj) => void;
  value: string;
  useLock?: boolean;
  useModal?: boolean;
}

export const SpeciesSelect = ({ handleChange, value, useLock, useModal }: SpeciesSelectProps): JSX.Element => {
  const inputRef = useRef(null);
  const updateSpecies = useUpdateSpecies();
  const species = useSpecies();
  const allSpecies = useUISpecies();
  
  const [lockSpecies, setLockSpecies] = useState(useLock);
  const [showModal, setShowModal] = useState(false);

  const selection = inputRef.current?.value;

  const handleClose = (): void => {
    console.log('closeCalled')
    setShowModal(false);
    setLockSpecies(useLock);
  }

  const handleConfirm = (): void => {
    setShowModal(false);
    handleChangeSpecies();
  }

  const handleChangeSpecies = (): void => {
    const found = allSpecies.find(
      s => s.name === (inputRef.current?.value ?? value));
    if(found) {
      setLockSpecies(useLock);
      updateSpecies(found)
    }
  }

  useEffect(()=> {
    useModal && selection ? setShowModal(true) : handleChangeSpecies();
  },[selection]);

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
        {lockSpecies 
        ? <Tooltip children={<Icon icon='lock' />} title={CritterStrings.lockedSpeciesTooltip} />
        : <Tooltip children={<Icon icon='unlocked' />} title={CritterStrings.unlockedSpeciesTooltip} />
        }
      </IconButton>
      }
      {<p>{
      `Species: ${species?.name} 
      Lock: ${lockSpecies} 
      ShowModal: ${showModal}
      Selection: ${selection}
      `}</p>}
    {useModal && 
    <ConfirmModal
      open={showModal}
      handleClose={handleClose}
      message={speciesModalMessage(species?.name, selection)}
      handleClickYes={handleConfirm}
    />}
    </>
  );
};
