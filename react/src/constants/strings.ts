const CritterStrings = {

  importTitle: 'Bulk Import Animals',
  importText: 'Use this feature to add multiple new animals. Animals cannot be updated from this feature',
  exportTitle: 'Bulk Export Animals',
  exportText: '',
  editableProps: [
    'nickname',
    'animal_id',
    'wlh_id',
    'species',
    'region',
    'population_unit',
    'animal_status',
    'calf_at_heel'
  ],
  collarAssignmentTitle: 'Assign a collar',
  assignCollarBtnText: 'assign selected collar',
  assignedTableTitle: 'Assigned Animals',
  unassignedTableTitle: 'Unassigned Animals',
  collarRemovalTitle: 'Confirm collar unassignment',
  collarRemovalText: 'Are you sure you wish to unassign this collar?',

}

const CollarStrings = {
  assignedCollarsTableTitle: 'Assigned Collars',
  availableCollarsTableTitle: 'Unassigned Collars'
}

export {
  CritterStrings,
  CollarStrings,
}