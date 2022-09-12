import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { useContext, createContext, useState } from 'react';

const ShowMapContext = createContext<boolean>(false);
const ShowMapUpdateContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);

export const useShowMap = (): boolean => useContext(ShowMapContext);

export const useUpdateShowMap = (): Dispatch<SetStateAction<boolean>> => useContext(ShowMapUpdateContext);

export const MapDisplayProvider = (props: { children: ReactNode }): JSX.Element => {
  const [showMap, setShowMap] = useState(false);
  return (
    <ShowMapContext.Provider value={showMap}>
      <ShowMapUpdateContext.Provider value={setShowMap}>{props.children}</ShowMapUpdateContext.Provider>
    </ShowMapContext.Provider>
  );
};
