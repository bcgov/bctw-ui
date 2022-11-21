import * as L from 'leaflet'; // must be imported first
import 'leaflet.markercluster';
import 'pages/map/MapPage.scss';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';

import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings as CS, ExportStrings, MapStrings } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import { SyntheticEvent, useEffect, useState } from 'react';
import { AttachedAnimal } from 'types/animal';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import { Button } from 'components/common';
import Checkbox from 'components/form/Checkbox';
import { Tab, Tabs } from '@mui/material';
import ExportDownloadModal from './ExportDownloadModal';
import { InfoBanner } from 'components/alerts/Banner';
import ContainerLayout from 'pages/layouts/ContainerLayout';
import QueryBuilder, { IFormRowEntry, QueryBuilderColumn, QueryBuilderOperator } from 'components/form/QueryBuilder';
import makeStyles from '@mui/styles/makeStyles';
import { FeatureCollection } from 'geojson';
import LocationSelect from 'components/form/LocationSelect';
import { PageTabs } from 'components/common/partials/PageTabs';

export interface DateRange {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}
export type ExportTab = 'Quick Export' | 'Advanced Export';

export enum TabNames {
  quick,
  advanced
}

export const exportPageStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  innerSection: {
    marginBottom: theme.spacing(6)
  },
  queryRegionBox: {
    marginBottom: theme.spacing(4),
    width: '800px'
  },
  dateBoxSpacing: {
    display: 'flex',
    flexDirection: 'row'
  },
  dateBoxInnerSpacing: {
    display: 'flex',
    flexDirection: 'row',
    width: '400px'
  },
  disableSpacing: {
    padding: 0,
    margin: 0
  }
}));

/*
 * The Export page is for downloading bulk telemtry points in either CSV or KML format.
 * The Quick tab of this page lets you select telemetry by critter, while the advanced tab lets you bulk
 * export data using the QueryBuilder and LocationSelect components. See those for more details.
 */

export default function ExportPageV2(): JSX.Element {
  const api = useTelemetryApi();
  const styles = exportPageStyles();

  const operators: QueryBuilderOperator[] = ['Equals', 'Not Equals'];
  const columns: QueryBuilderColumn[] = ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency'];
  const TABS: ExportTab[] = ['Quick Export', 'Advanced Export'];
  const [start, setStart] = useState(dayjs().subtract(3, 'month'));
  const [end, setEnd] = useState(dayjs());
  const [builtRows, setBuiltRows] = useState<IFormRowEntry[]>([]);
  const [tab, setTab] = useState(0);
  const [formsFilled, setFormsFilled] = useState(false);
  const [collarIDs, setCollarIDs] = useState([]);
  const [critterIDs, setCritterIDs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLifetime, setSelectedLifetime] = useState(false);
  const [currentGeometry, setCurrentGeometry] = useState<string[]>([]);

  const handleDrawShape = (features: L.FeatureGroup): void => {
    const clipper = features.toGeoJSON() as FeatureCollection;
    if (clipper?.features?.length) {
      const arr = [];
      clipper.features.forEach((o) => {
        if (o.geometry.type == 'Polygon') {
          const pointsInPostGISformat = o.geometry.coordinates[0].map((o) => o.join(' ')).join(', ');
          arr.push(`POLYGON ((${pointsInPostGISformat}))`);
        }
      });
      console.log(JSON.stringify(arr));
      setCurrentGeometry(arr);
    }
  };

  const { data: crittersData, isSuccess: critterSuccess } = api.useAssignedCritters(0);

  const isTab = (tabName: ExportTab): boolean => TABS[tab] === tabName;

  const handleChangeDate = (v: InboundObj): void => {
    const [key, value] = parseFormChangeResult(v);
    key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
  };

  useEffect(() => {
    areFieldsFilled();
  }, [builtRows]);

  const areFieldsFilled = (): void => {
    if (builtRows.some((o) => o.operator == '' || o.value.length < 1)) {
      setFormsFilled(false);
    } else {
      setFormsFilled(true);
    }
  };

  const handleDataTableSelect = (selected: AttachedAnimal[]): void => {
    const ids = selected.map((v) => v.collar_id);
    const critters = selected.map((v) => v.critter_id);
    setCollarIDs(ids); //<-- To remove, we probably do not want to do these queries by collar id anymore.
    setCritterIDs(critters);
  };

  const handleChangeTab = (event: SyntheticEvent<Element>, newVal: TabNames): void => {
    setTab(newVal);
  };

  return (
    <ManageLayout>
      <h1>Export My Animal Telemetry</h1>
      <Box className={styles.section} /*marginTop={'15px'}*/>
        <InfoBanner text={ExportStrings.infoBannerMesgs} />
      </Box>
      <PageTabs tab={tab} handleTab={setTab} tabList={TABS}>
        <ContainerLayout>
          <Box className={styles.innerSection}>
            <h2>{ExportStrings.dateRangeHeader}</h2>
            <Box className={styles.dateBoxSpacing} columnGap={2}>
              <Box className={styles.dateBoxInnerSpacing} columnGap={1}>
                <DateInput
                  propName='tstart'
                  disabled={selectedLifetime}
                  label={MapStrings.startDateLabel}
                  defaultValue={dayjs(start)}
                  changeHandler={handleChangeDate}
                />

                <DateInput
                  disabled={selectedLifetime}
                  propName='tend'
                  label={MapStrings.endDateLabel}
                  defaultValue={dayjs(end)}
                  changeHandler={handleChangeDate}
                />
              </Box>
              <Checkbox
                propName={'animalLifetime'}
                label={ExportStrings.checkboxLabel}
                initialValue={selectedLifetime}
                changeHandler={() => setSelectedLifetime((o) => !o)}
              />
            </Box>
          </Box>
          {isTab('Quick Export') && (
            <>
              <Box>
                <h2 className={styles.disableSpacing}>{ExportStrings.animalTableHeader}</h2>
                <DataTable
                  headers={AttachedAnimal.attachedCritterDisplayProps}
                  title={CS.assignedTableTitle}
                  onSelectMultiple={handleDataTableSelect}
                  queryProps={{ query: api.useAssignedCritters }}
                  isMultiSelect
                />
              </Box>
              <Button
                className='form-buttons'
                disabled={!collarIDs.length}
                onClick={() => {
                  setShowModal(true);
                }}>
                Export
              </Button>
            </>
          )}
          {isTab('Advanced Export') && (
            <>
              <h2>{ExportStrings.queryBuilderHeader}</h2>
              <Box className={styles.queryRegionBox}>
                <QueryBuilder
                  operators={operators}
                  columns={columns}
                  data={crittersData}
                  handleRowsUpdate={(r) => setBuiltRows(r)}
                />
              </Box>
              <Box className={styles.innerSection}>
                <h2>{ExportStrings.locationSelectHeader}</h2>
                <LocationSelect handleDrawShape={handleDrawShape} />
              </Box>
              <Button disabled={!formsFilled} onClick={() => setShowModal(true)}>
                Export
              </Button>
            </>
          )}

          <ExportDownloadModal
            exportType={TABS[tab]}
            open={showModal}
            handleClose={() => {
              setShowModal(false);
            }}
            rowEntries={builtRows}
            critterIDs={critterIDs}
            collarIDs={collarIDs}
            postGISstrings={currentGeometry}
            range={{
              start: selectedLifetime ? dayjs('1970-01-01') : start,
              end: selectedLifetime ? dayjs() : end
            }}></ExportDownloadModal>
        </ContainerLayout>
      </PageTabs>
    </ManageLayout>
  );
}
