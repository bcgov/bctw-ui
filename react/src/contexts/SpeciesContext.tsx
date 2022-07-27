import React, { SetStateAction } from 'react';
import { useContext, createContext, useState, useEffect } from 'react';
import { ISpecies } from 'types/animal';

const SpeciesContext = createContext<ISpecies | null>(null);
const SpeciesUpdateContext = createContext<React.Dispatch<React.SetStateAction<ISpecies>> | null>(null);

const SpeciesLockContext = createContext(false);
const SpeciesLockUpdateContext = createContext<React.Dispatch<React.SetStateAction<boolean>> | null>(null);

export const useSpecies = () => {
  return useContext(SpeciesContext);
};
export const useUpdateSpecies = () => {
  return useContext(SpeciesUpdateContext);
};
export const useLockSpecies = () => {
  return useContext(SpeciesLockContext);
}
export const useUpdateLockSpecies = () => {
  return useContext(SpeciesLockUpdateContext);
}
export const SpeciesProvider = (props: { children: React.ReactNode }): JSX.Element => {
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
