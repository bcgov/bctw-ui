import { IconButton } from '@mui/material';
import { CritterStrings } from 'constants/strings';
import { useEffect, useRef, useState } from 'react';
import { InboundObj } from 'types/form_types';

import { Icon, Tooltip } from 'components/common';
import { useTaxon, useUITaxon, useUpdateTaxon } from 'contexts/TaxonContext';
import { TAXON_STR } from 'utils/taxon';
import ConfirmModal from 'components/modal/ConfirmModal';
import { taxonModalMessage } from 'constants/formatted_string_components';
import SelectCode from './SelectCode';

interface TaxonSelectProps {
  handleChange: (v: InboundObj) => void;
  value: string;
  useLock?: boolean;
  useModal?: boolean;
}

export const TaxonSelect = ({ handleChange, value, useLock, useModal }: TaxonSelectProps): JSX.Element => {
  const inputRef = useRef(null);
  const myRef = useRef(null);

  const updateTaxon = useUpdateTaxon();
  const taxon = useTaxon();
  const allTaxon = useUITaxon();

  const [lockTaxon, setLockTaxon] = useState(useLock);
  const [showModal, setShowModal] = useState(false);

  const selection = inputRef.current?.value;

  const handleClose = (): void => {
    setShowModal(false);
    setLockTaxon(useLock);
    myRef?.current?.setValue(taxon?.name);
  };

  const handleConfirm = (): void => {
    handleChangeTaxon();
    setShowModal(false);
    setLockTaxon(useLock);
  };

  const handleChangeTaxon = (): void => {
    const found = allTaxon.find((s) => s.name === (selection ?? value));
    if (found) {
      updateTaxon(found);
      setLockTaxon(useLock);
    }
  };

  const handleStates = (): void => {
    const canShowModal = useModal && taxon && selection && taxon?.name !== selection;
    canShowModal ? setShowModal(true) : handleChangeTaxon();
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
        disabled={lockTaxon}
        codeHeader={TAXON_STR}
        defaultValue={typeof value === 'string' ? value : ''}
        changeHandler={handleChange}
        required={false}
        //error={'Test error'}
        ref={myRef}
        inputRef={inputRef}
        propName={TAXON_STR}
        istaxonSelect={true}
      />
      {useLock && (
        <IconButton key='udf-icon' onClick={(): void => setLockTaxon((l) => !l)}>
          {lockTaxon ? (
            <Tooltip children={<Icon icon='lock' />} title={CritterStrings.lockedtaxonTooltip} />
          ) : (
            <Tooltip children={<Icon icon='unlocked' />} title={CritterStrings.unlockedtaxonTooltip} />
          )}
        </IconButton>
      )}
      {/* Used for debugging */}
      {/* {
        <p>{`taxon: ${taxon?.name} 
      Lock: ${locktaxon} 
      ShowModal: ${showModal}
      Selection: ${selection}
      `}</p>
      } */}
      {useModal && (
        <ConfirmModal
          open={showModal}
          handleClose={handleClose}
          message={taxonModalMessage(taxon?.name, selection)}
          handleClickYes={handleConfirm}
        />
      )}
    </>
  );
};
