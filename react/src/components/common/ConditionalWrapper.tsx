import React from 'react';

type ConditionalWrapper = {
  children: React.ReactElement;
  condition: boolean;
  wrapper: (children: React.ReactElement) => JSX.Element;
};
export const ConditionalWrapper: React.FC<ConditionalWrapper> = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;
