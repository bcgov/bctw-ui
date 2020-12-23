const CritterStrings = {
  importTitle: 'Bulk Import Animals',
  importText: 'Use this feature to add multiple new animals. Animals cannot be updated from this feature',
  exportTitle: 'Bulk Export Animal Data',
  exportText: '',
  editableProps: ['nickname', 'animal_id', 'wlh_id', 'species', 'region', 'population_unit', 'animal_status', 'calf_at_heel'],
  requiredProps: ['animal_id', 'wlh_id', 'species', 'region'],
  collarAssignmentTitle: 'Assign a collar',
  assignCollarBtnText: 'assign selected collar',
  assignedTableTitle: 'Assigned Animals',
  unassignedTableTitle: 'Unassigned Animals',
  collarRemovalTitle: 'Confirm collar unassignment',
  collarRemovalText: 'Are you sure you wish to unassign this collar?',

}

const CollarStrings = {
  assignedCollarsTableTitle: 'Assigned Collars',
  availableCollarsTableTitle: 'Unassigned Collars',
  editableProps: ['device_id', 'radio_frequency', 'collar_make', 'model', 'satellite_network', 'collar_status', 'collar_type'],
  selectableProps: ['collar_make', 'satellite_network', 'collar_status', 'collar_type'],
  requiredProps: ['device_id', 'make', 'radio_frequency'],
  exportTitle: 'Bulk Export Collar Data',
  exportText: '',
}

export {
  CritterStrings,
  CollarStrings,
}