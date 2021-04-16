import { useEffect, useRef } from 'react';

// like useEffect, but the effect is not triggered on the initial mount of the component
const useDidMountEffect = (handler: () => void, dependencies: unknown[]): void => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      handler();
    } else {
      didMount.current = true;
    }
  }, dependencies);
};

export default useDidMountEffect;
