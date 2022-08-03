import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { useContext, createContext, useState, useEffect } from 'react';
import { ISpecies } from 'types/animal';

const SpeciesContext = createContext<ISpecies | null>(null);
const SpeciesUpdateContext = createContext<Dispatch<SetStateAction<ISpecies>> | null>(null);

const SpeciesLockContext = createContext(false);
const SpeciesLockUpdateContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);

export const useSpecies = (): ISpecies => useContext(SpeciesContext);

export const useUpdateSpecies = (): Dispatch<SetStateAction<ISpecies>> => useContext(SpeciesUpdateContext);

export const useLockSpecies = (): boolean => useContext(SpeciesLockContext);

export const useUpdateLockSpecies = ():Dispatch<SetStateAction<boolean>> => useContext(SpeciesLockUpdateContext);

export const SpeciesProvider = (props: { children: ReactNode }): JSX.Element => {
  const [species, setSpecies] = useState<ISpecies | null>(null);
  const [lockSpecies, setLockSpecies] = useState(false);

  return (
    <SpeciesContext.Provider value={species}>
      <SpeciesUpdateContext.Provider value={setSpecies}>
        <SpeciesLockContext.Provider value={lockSpecies}>
          <SpeciesLockUpdateContext.Provider value={setLockSpecies}>
            {props.children}
          </SpeciesLockUpdateContext.Provider>
        </SpeciesLockContext.Provider>
      </SpeciesUpdateContext.Provider>
    </SpeciesContext.Provider>
  );
};
