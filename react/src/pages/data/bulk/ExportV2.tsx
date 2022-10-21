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
import { headerToColumn } from 'utils/common_helpers';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import { Button  } from 'components/common';
import Checkbox from 'components/form/Checkbox';
import { Grid, Tab, Tabs, Button as MUIButton } from '@mui/material';
import ExportDownloadModal from './ExportDownloadModal';
import { InfoBanner } from 'components/common/Banner';
import ContainerLayout from 'pages/layouts/ContainerLayout';
import QueryBuilder, { IFormRowEntry, ValidQueryColumn, ValidQueryOperator } from 'components/form/QueryBuilder';
import makeStyles from '@mui/styles/makeStyles';
import { FeatureCollection } from 'geojson';
import LocationSelect from 'components/form/LocationSelect';

export interface DateRange {
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
}

export enum TabNames {
    quick = 'Quick Export',
    advanced = 'Advanced Export'
}

export const exportPageStyles = makeStyles((theme) => ({
    section : {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2)
    },
    innerSection: {
        marginBottom: theme.spacing(4)
    },
    queryRegionBox: {
        marginBottom: theme.spacing(4),
        width: '800px'
    }
}));

/*
* The Export page is for downloading bulk telemtry points in either CSV or KML format.
* The Quick tab of this page lets you select telemetry by critter, while the advanced tab lets you bulk
* export data using the QueryBuilder and LocationSelect components. See those for more details.
*/

export default function ExportPageV2 (): JSX.Element {
    const api = useTelemetryApi();
    const styles =  exportPageStyles();

    const operators: ValidQueryOperator[] = ['Equals','Not Equals'];
    const columns: ValidQueryColumn[] = ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency'];
    const [start, setStart] = useState(dayjs().subtract(3, 'month'));
    const [end, setEnd] = useState(dayjs());
    const [builtRows, setBuiltRows] = useState<IFormRowEntry[]>([]);
    const [tab, setTab] = useState<TabNames>(TabNames.quick);
    const [formsFilled, setFormsFilled] = useState(false);
    const [collarIDs, setCollarIDs] = useState([]);
    const [critterIDs, setCritterIDs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLifetime, setSelectedLifetime] = useState(false);
    const [currentGeometry, setCurrentGeometry] = useState<string[]>([]);

    const handleDrawShape = (features: L.FeatureGroup): void => {
        const clipper = features.toGeoJSON() as FeatureCollection;
        if(clipper?.features?.length) {
            const arr = [];
            clipper.features.forEach(o => {
                if(o.geometry.type == 'Polygon') {
                    const pointsInPostGISformat = o.geometry.coordinates[0].map(o => o.join(' ')).join(', ');
                    arr.push(`POLYGON ((${pointsInPostGISformat}))`);
                }
            })
            console.log(JSON.stringify(arr));
            setCurrentGeometry(arr);
        }
    }

    const {data: crittersData, isSuccess: critterSuccess} = api.useAssignedCritters(0);

    const isTab = (tabName: TabNames): boolean => tabName === tab;

    const handleChangeDate = (v: InboundObj): void => {
        const [key, value] = parseFormChangeResult(v);
        key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
    };

    useEffect(() => {
        areFieldsFilled();
    }, [builtRows]);

    const areFieldsFilled = (): void => {
        if(builtRows.some(o => o.operator == '' || o.value.length < 1)) {
            setFormsFilled(false);
        }
        else {
            setFormsFilled(true);
        }
    }


    const handleDataTableSelect = (selected: AttachedAnimal[]): void => {
        const ids = selected.map(v => v.collar_id);
        const critters = selected.map(v => v.critter_id);
        setCollarIDs(ids); //<-- To remove, we probably do not want to do these queries by collar id anymore.
        setCritterIDs(critters);
    }

    const handleChangeTab = (event: SyntheticEvent<Element>, newVal: TabNames): void => {
        setTab(newVal);
    }

    return(
    <ManageLayout>
        <h1>Export My Animal Telemetry</h1>
        <Box className={styles.section} /*marginTop={'15px'}*/>
            <InfoBanner text={ExportStrings.infoBannerMesgs} />
        </Box>
        <ContainerLayout>
            <Tabs value={tab} className='tabs' onChange={handleChangeTab}>
                <Tab label={"Quick Export"} value={TabNames.quick}/>
                <Tab label={"Advanced Export"} value={TabNames.advanced} />
            </Tabs>
            <Box className={styles.innerSection}>
                <h2>Specify Date Range</h2>   
                <Grid container spacing={2}>
                    <Grid item sm={2}>
                        <DateInput
                        fullWidth
                        propName='tstart'
                        disabled={selectedLifetime}
                        label={MapStrings.startDateLabel}
                        defaultValue={dayjs(start)}
                        changeHandler={handleChangeDate}
                        />
                    </Grid>
                    <Grid item sm={2}>
                        <DateInput
                        fullWidth
                        disabled={selectedLifetime}
                        propName='tend'
                        label={MapStrings.endDateLabel}
                        defaultValue={dayjs(end)}
                        changeHandler={handleChangeDate}
                        />
                    </Grid>
                    <Grid item sm={2}>
                        <Checkbox
                        propName={"animalLifetime"}
                        label={"All Telemetry"}
                        initialValue={selectedLifetime}
                        changeHandler={() => setSelectedLifetime((o) => !o)}
                        />
                    </Grid>
                </Grid>
            </Box>
            {isTab(TabNames.quick) && (
                <>
                <Box className={styles.innerSection}>
                    <h2>Select Animals</h2>
                    <DataTable
                    headers={AttachedAnimal.attachedCritterDisplayProps}
                    title={CS.assignedTableTitle}
                    onSelectMultiple={ handleDataTableSelect }
                    queryProps={{ query: api.useAssignedCritters }}
                    isMultiSelect
                    />
                </Box>
                <Button    
                    className='form-buttons' 
                    disabled={!collarIDs.length}
                    onClick={() => {setShowModal(true)}}>
                        Export
                </Button>
                </>
                )
            }
            {isTab(TabNames.advanced) && (
            <>
            <h2>Build Query</h2>
            <Box className={styles.queryRegionBox}>
                <QueryBuilder
                    operators={operators}
                    columns={columns}
                    data={crittersData}
                    handleRowsUpdate={(r) => setBuiltRows(r)}
                />
            </Box>
            <Box className={styles.innerSection}>
                <h2>Select Location</h2>
                <LocationSelect handleDrawShape={handleDrawShape}/>
            </Box>
            <Button
                disabled={!formsFilled} 
                onClick={() => setShowModal(true)}>
                Export
            </Button>
            </>
            )}

            <ExportDownloadModal 
                exportType={tab} 
                open={showModal} 
                handleClose={() => {setShowModal(false)} } 
                rowEntries={builtRows} 
                critterIDs={critterIDs}
                collarIDs={collarIDs}
                postGISstrings={currentGeometry}
                range={{
                    start: selectedLifetime ? dayjs('1970-01-01') : start,
                    end: selectedLifetime ? dayjs() : end
                }}>
            </ExportDownloadModal>
        </ContainerLayout>
    </ManageLayout>
    )
}