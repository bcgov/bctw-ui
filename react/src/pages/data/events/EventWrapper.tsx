// import { useState } from 'react';

type EventWrapperProps = {
  children: React.ReactNode;
};

/**
 * wraps all of the event pages.
 * handles saving
 */
export default function EventWrapper({ children }: EventWrapperProps): React.ReactNode {
  return <>{children}</>;
}
