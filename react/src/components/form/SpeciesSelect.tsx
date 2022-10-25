import { IconButton } from '@mui/material';
import { CritterStrings } from 'constants/strings';
import { useEffect, useRef, useState } from 'react';
import { InboundObj } from 'types/form_types';

import { Icon, Tooltip } from 'components/common';
import { useUISpecies, useUpdateSpecies, useSpecies } from 'contexts/SpeciesContext';
import { SPECIES_STR } from 'utils/species';
import ConfirmModal from 'components/modal/ConfirmModal';
import { speciesModalMessage } from 'constants/formatted_string_components';
import SelectCode from './SelectCode';

interface SpeciesSelectProps {
  handleChange: (v: InboundObj) => void;
  value: string;
  useLock?: boolean;
  useModal?: boolean;
}

export const SpeciesSelect = ({ handleChange, value, useLock, useModal }: SpeciesSelectProps): JSX.Element => {
  const inputRef = useRef(null);
  const myRef = useRef(null);

  const updateSpecies = useUpdateSpecies();
  const species = useSpecies();
  const allSpecies = useUISpecies();

  const [lockSpecies, setLockSpecies] = useState(useLock);
  const [showModal, setShowModal] = useState(false);

  const selection = inputRef.current?.value;

  const handleClose = (): void => {
    setShowModal(false);
    setLockSpecies(useLock);
    myRef?.current?.setValue(species?.name);
  };

  const handleConfirm = (): void => {
    handleChangeSpecies();
    setShowModal(false);
    setLockSpecies(useLock);
  };

  const handleChangeSpecies = (): void => {
    const found = allSpecies.find((s) => s.name === (selection ?? value));
    if (found) {
      updateSpecies(found);
      setLockSpecies(useLock);
    }
  };

  const handleStates = (): void => {
    const canShowModal = useModal && species && selection && species?.name !== selection;
    canShowModal ? setShowModal(true) : handleChangeSpecies();
  };

  useEffect(() => {
    handleStates();
  }, [selection]);

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
        ref={myRef}
        inputRef={inputRef}
        propName={SPECIES_STR}
        isSpeciesSelect={true}
      />
      {useLock && (
        <IconButton key='udf-icon' onClick={(): void => setLockSpecies((l) => !l)}>
          {lockSpecies ? (
            <Tooltip children={<Icon icon='lock' />} title={CritterStrings.lockedSpeciesTooltip} />
          ) : (
            <Tooltip children={<Icon icon='unlocked' />} title={CritterStrings.unlockedSpeciesTooltip} />
          )}
        </IconButton>
      )}
      {/* Used for debugging */}
      {/* {
        <p>{`Species: ${species?.name} 
      Lock: ${lockSpecies} 
      ShowModal: ${showModal}
      Selection: ${selection}
      `}</p>
      } */}
      {useModal && (
        <ConfirmModal
          open={showModal}
          handleClose={handleClose}
          message={speciesModalMessage(species?.name, selection)}
          handleClickYes={handleConfirm}
        />
      )}
    </>
  );
};
