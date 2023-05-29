import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React, { Dispatch, ReactNode, SetStateAction, useEffect } from 'react';
import { useContext, createContext, useState } from 'react';
import { Itaxon } from 'types/animal';

const TaxonContext = createContext<Itaxon | null>(null);
const TaxonUpdateContext = createContext<Dispatch<SetStateAction<Itaxon>> | null>(null);
const UItaxonContext = createContext<Itaxon[] | null>(null);

export const useTaxon = (): Itaxon => useContext(TaxonContext);

export const useUITaxon = (): Itaxon[] => useContext(UItaxonContext);

export const useUpdateTaxon = (): Dispatch<SetStateAction<Itaxon>> => useContext(TaxonUpdateContext);

export const TaxonProvider = (props: { children: ReactNode }): JSX.Element => {
  const api = useTelemetryApi();
  const TAXON_STR = 'taxon';
  // load the UI taxon from the db
  const { data } = api.useCodes(0, TAXON_STR);
  const [taxon, setTaxon] = useState<Itaxon | null>(null);
  const [allTaxon, setAllTaxon] = useState<Itaxon[]>([]);

  useEffect(() => {
    if (data && !allTaxon?.length) {
      const all = data.map((d) => {
        return {
          id: d.code,
          name: d.description
        };
      });
      setAllTaxon(all);
    }
  }, [data]);

  return (
    <UItaxonContext.Provider value={allTaxon}>
      <TaxonContext.Provider value={taxon}>
        <TaxonUpdateContext.Provider value={setTaxon}>{props.children}</TaxonUpdateContext.Provider>
      </TaxonContext.Provider>
    </UItaxonContext.Provider>
  );
};
