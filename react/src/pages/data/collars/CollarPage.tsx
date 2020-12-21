import { useState } from 'react';
import Table from 'components/table/Table';
import { useDataStyles } from 'pages/data/common/data_styles';
import { assignedCollarProps, availableCollarProps, Collar } from 'types/collar';
import { CollarStrings as S } from 'constants/strings'
import { eCollarType } from 'api/api_interfaces';

export default function CollarPage() {
  const classes = useDataStyles();
  const [editObj, setEditObj] = useState<Collar>(new Collar());
  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);
  const rowId = 'device_id';
  const handleSelect = (row: Collar) => setEditObj(row);

  return (
    <div className={classes.container}>
      <Table
        headers={assignedCollarProps}
        title={S.assignedCollarsTableTitle}
        queryProps={{ query: 'useCollarType', queryParam: eCollarType.Assigned, onNewData: (d: Collar[]) => setCollarsA(d) }}
        onSelect={handleSelect}
        rowIdentifier={rowId}
      />
      <Table
        headers={availableCollarProps}
        title={S.availableCollarsTableTitle}
        queryProps={{ query: 'useCollarType', queryParam: eCollarType.Available, onNewData: (d: Collar[]) => setCollarsU(d) }}
        onSelect={handleSelect}
        rowIdentifier={rowId}
      />
    </div>
  )
}