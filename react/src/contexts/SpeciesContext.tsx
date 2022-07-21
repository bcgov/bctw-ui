import React, { SetStateAction } from 'react';
import { useContext, createContext, useState, useEffect } from 'react';

const SpeciesContext = createContext<string | null>(null);
const SpeciesUpdateContext = createContext<React.Dispatch<React.SetStateAction<string>> | null>(null);

export const useSpecies = () => {
  return useContext(SpeciesContext);
};
export const useUpdateSpecies = () => {
  return useContext(SpeciesUpdateContext);
};

export const SpeciesProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const [species, setSpecies] = useState<string | null>(null);

  return (
    <SpeciesContext.Provider value={species}>
      <SpeciesUpdateContext.Provider value={setSpecies}>
        {props.children}
      </SpeciesUpdateContext.Provider>
    </SpeciesContext.Provider>
  );
};
