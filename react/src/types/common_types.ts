
type BCTW = {
  formatPropAsHeader?: (str: string) => string;
}

interface T extends BCTW {}

export type {
  BCTW,
  T
}