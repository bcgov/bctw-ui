import { cloneElement, useState } from 'react';

type IResizableProps = {
  children: JSX.Element;
  direction: 'vertical' | 'horizontal';
  baseHeight: number;
  baseWidth?: number;
}
/**
 * todo: should replace the resizable feature in @file {MapPage.tsx} 
 * @param props 
 * @returns 
 */
export default function Resizable(props: IResizableProps): JSX.Element {
  const {direction, baseHeight} = props;
  const [height, setHeight] = useState<number>(baseHeight);
  // const [width, setWidth] = useState<number>(baseHeight);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const onMove = (e: React.MouseEvent): void => {
    if (isDragging && direction === 'horizontal') {
      const mpv = document.getElementById('map-view');
      const offset = (mpv?.offsetHeight ?? 0)-e.clientY;
      setHeight(offset);
    }
  }

  const onDown = (): void => {
    setIsDragging(true);
  }

  const onUp = (): void => {
    if (isDragging) {
      setIsDragging(false);
    }
  }
  const childProps = {
    onmousedown: onDown,
    onmouseup: onUp,
    onmousemove: onMove,
    style: {height: height},
  }

  return (
    cloneElement(props.children, childProps)
  )
}
