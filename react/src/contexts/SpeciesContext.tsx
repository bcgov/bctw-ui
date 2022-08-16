import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { useContext, createContext, useState, useEffect } from 'react';
import { ISpecies } from 'types/animal';
import { ICode } from 'types/code';

const SpeciesContext = createContext<ISpecies | null>(null);
const SpeciesUpdateContext = createContext<Dispatch<SetStateAction<ISpecies>> | null>(null);
const UISpeciesContext = createContext<ICode[] | null>(null);

const SpeciesLockContext = createContext(false);
const SpeciesLockUpdateContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);

export const useSpecies = (): ISpecies => useContext(SpeciesContext);

export const useUISpecies = (): ICode[] => useContext(UISpeciesContext);

export const useUpdateSpecies = (): Dispatch<SetStateAction<ISpecies>> => useContext(SpeciesUpdateContext);

export const useLockSpecies = (): boolean => useContext(SpeciesLockContext);

export const useUpdateLockSpecies = ():Dispatch<SetStateAction<boolean>> => useContext(SpeciesLockUpdateContext);

export const SpeciesProvider = (props: { children: ReactNode }): JSX.Element => {
  const api = useTelemetryApi();
  const SPECIES_STR = 'species';
  // load the species from the db
  const { data, error, isFetching, isError, isLoading, isSuccess } = api.useCodes(0, SPECIES_STR);

  const [species, setSpecies] = useState<ISpecies | null>(null);
  const [lockSpecies, setLockSpecies] = useState(false);

  return (
    <UISpeciesContext.Provider value={data}>
      <SpeciesContext.Provider value={species}>
        <SpeciesUpdateContext.Provider value={setSpecies}>
          <SpeciesLockContext.Provider value={lockSpecies}>
            <SpeciesLockUpdateContext.Provider value={setLockSpecies}>
              {props.children}
            </SpeciesLockUpdateContext.Provider>
          </SpeciesLockContext.Provider>
        </SpeciesUpdateContext.Provider>
      </SpeciesContext.Provider>
    </UISpeciesContext.Provider>
  );
};
