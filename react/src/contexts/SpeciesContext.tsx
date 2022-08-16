import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { useContext, createContext, useState, useEffect } from 'react';
import { ISpecies } from 'types/animal';
import { ICode } from 'types/code';

const SpeciesContext = createContext<ISpecies | null>(null);
const SpeciesUpdateContext = createContext<Dispatch<SetStateAction<ISpecies>> | null>(null);
const UISpeciesContext = createContext<ISpecies[] | null>(null);

export const useSpecies = (): ISpecies => useContext(SpeciesContext);

export const useUISpecies = (): ISpecies[] => useContext(UISpeciesContext);

export const useUpdateSpecies = (): Dispatch<SetStateAction<ISpecies>> => useContext(SpeciesUpdateContext);

export const SpeciesProvider = (props: { children: ReactNode }): JSX.Element => {
  const api = useTelemetryApi();
  const SPECIES_STR = 'species';
  // load the UI species from the db
  const { data } = api.useCodes(0, SPECIES_STR);
  const [species, setSpecies] = useState<ISpecies | null>(null);
  const [allSpecies, setAllSpecies] = useState<ISpecies[]>([])

  if(data && !allSpecies?.length){
    const all = data.map(d => {
      return {
        id: d.code,
        name: d.description,
      }
    });
    setAllSpecies(all);
  }
  return (
    <UISpeciesContext.Provider value={allSpecies}>
      <SpeciesContext.Provider value={species}>
        <SpeciesUpdateContext.Provider value={setSpecies}>
            {props.children}
        </SpeciesUpdateContext.Provider>
      </SpeciesContext.Provider>
    </UISpeciesContext.Provider>
  );
};
