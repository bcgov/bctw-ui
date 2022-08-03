import { speciesModalMessage } from 'constants/formatted_string_components';
import { useSpecies, useUpdateSpecies } from 'contexts/SpeciesContext';
import { useEffect, useState } from 'react';
import { ICode } from 'types/code';
import { formatCodeToSpecies } from 'utils/species';
import ConfirmModal from './ConfirmModal';

interface SpeciesModalProps {
  codeHeader: string;
  value: string;
  codes: ICode[];
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setCanFetch: React.Dispatch<React.SetStateAction<boolean>>;
}
export const SpeciesModal = ({ 
  codeHeader, 
  value, 
  codes, 
  setValue, 
  setCanFetch }: SpeciesModalProps): JSX.Element => {
  const species = useSpecies();
  const updateSpecies = useUpdateSpecies();

  const [showModal, setShowModal] = useState(false);
  const SPECIES_STR = 'species';

  const handleSpeciesModalConfirm = (): void => {
    const s = formatCodeToSpecies(codes.find((c) => c?.description === value));
    // setAttributes([]);
    updateSpecies(s);
    setShowModal(false);
    
  };

  const handleSpeciesModalDecline = (): void => {
    setValue(species?.name);
    setShowModal(false);
  };

  useEffect(() => {
    const handleModals = () => {
      if (codeHeader !== SPECIES_STR || !codes.length) return;
      if (species) {
        //Show the modal on all changes to the species from within the edit critter page
        if (value !== species?.name) {
          setShowModal(true);
        }
      } else {
        //Only show the modal in add animal page after the second species selection
        handleSpeciesModalConfirm();
      }
      setCanFetch(false);
    }
    handleModals();
  },[value]);

 
  return (
      <ConfirmModal
      open={showModal}
      handleClose={handleSpeciesModalDecline}
      message={speciesModalMessage(value)}
      handleClickYes={handleSpeciesModalConfirm}
    />
  );
};
