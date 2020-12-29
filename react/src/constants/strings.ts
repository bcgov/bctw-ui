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
  addCollarTypeTitle: 'Select Collar Type',
  addCollarTypeText: 'What type of collar would you like to add?',
  addCollarVect: 'Vectronics Collar',
  addCollarVHF: 'VHF Collar',
  importTitle: 'Bulk Import VHF Collars',
  importText: 'Use this feature to add multiple new collars.'
}

const CodeStrings = {
  importTitle: 'Bulk Import Codes',
  importText: 'Use this feature to add multiple codes. Codes cannot be edited here. The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional.',
}

export {
  CodeStrings,
  CollarStrings,
  CritterStrings,
}