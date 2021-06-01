export enum eCritterPermission {
  view = 'view',
  change = 'change',
  none = 'none',
  owner = 'owner', // the user created this object
  subowner = 'subowner', // 
  admin = 'admin' // 
}

/* permission-related helpers */
const permissionCanModify = (p: eCritterPermission): boolean => {
  return (
    p === eCritterPermission.admin ||
    p === eCritterPermission.change ||
    p === eCritterPermission.subowner ||
    p === eCritterPermission.owner
  );
};

const canRemoveDeviceFromAnimal = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.owner || p === eCritterPermission.change || p === eCritterPermission.admin;
};

export {
  permissionCanModify, canRemoveDeviceFromAnimal,
}