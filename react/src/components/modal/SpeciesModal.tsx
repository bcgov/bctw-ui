import { taxonModalMessage } from 'constants/formatted_string_components';
import { useTaxon, useUpdateTaxon } from 'contexts/TaxonContext';
import { useEffect, useState } from 'react';
import { ICode } from 'types/code';
import ConfirmModal from './ConfirmModal';
import { TAXON_STR, formatCodeToTaxon } from 'utils/taxon';

interface taxonModalProps {
  codeHeader: string;
  value: string;
  codes: ICode[];
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setCanFetch: React.Dispatch<React.SetStateAction<boolean>>;
}
export const taxonModal = ({ codeHeader, value, codes, setValue, setCanFetch }: taxonModalProps): JSX.Element => {
  const taxon = useTaxon();
  const updatetaxon = useUpdateTaxon();

  const [showModal, setShowModal] = useState(false);

  const handletaxonModalConfirm = (): void => {
    const s = formatCodeToTaxon(codes.find((c) => c?.description === value));
    updatetaxon(s);
    setShowModal(false);
  };

  const handletaxonModalDecline = (): void => {
    setValue(taxon?.name);
    setShowModal(false);
  };

  useEffect(() => {
    const handleModals = () => {
      if (codeHeader !== TAXON_STR || !codes.length) return;
      if (taxon) {
        //Show the modal on all changes to the taxon from within the edit critter page
        if (value !== taxon?.name) {
          setShowModal(true);
        }
      } else {
        //Only show the modal in add animal page after the second taxon selection
        handletaxonModalConfirm();
      }
      setCanFetch(false);
    };
    handleModals();
  }, [value]);

  return (
    <ConfirmModal
      open={showModal}
      handleClose={handletaxonModalDecline}
      message={taxonModalMessage(taxon?.name, value)}
      handleClickYes={handletaxonModalConfirm}
    />
  );
};
