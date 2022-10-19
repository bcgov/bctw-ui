import * as L from 'leaflet';
import { FeatureLayer } from 'esri-leaflet';
import LabeledMarker from 'leaflet-labeled-circle';
import { Box, Paper } from '@mui/material';
import TextField from 'components/form/TextInput';
import { InboundObj } from 'types/form_types';
import FileInput from './FileInput';
import makeStyles from '@mui/styles/makeStyles';
import { initMap } from 'pages/map/map_init';

type ILocationSelectProps = {
    defaultValues: string[];
    map: React.MutableRefObject<L.Map>;
    drawnItems: L.FeatureGroup;
    handleDrawShape: () => void;
    handleChange: (index: number, formObj: InboundObj) => void;
    handleFile: (fieldName: string, files: FileList) => void;
}

export const exportPageStyles = makeStyles(() => ({
    containerDiv: {
        height: '100px',
        width: '100px'
    }
}));

export default function LocationSelect (props: ILocationSelectProps) : JSX.Element {
    const {handleChange, handleFile, defaultValues, map, drawnItems, handleDrawShape} = props;

    const updateComponent = (): void => {
        const drawOptions: L.Control.DrawOptions = {
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false
        }
        initMap(map, drawnItems, new L.GeoJSON, handleDrawShape, () => {}, () => {}, drawOptions);
    };

    updateComponent();

    return (
        <Paper style={{padding: '30px', marginBottom:'1rem'}} elevation={3}>
            <Box display='flex'>
                <FileInput buttonText='Upload Shapefile' buttonVariant='outlined' accept={'.zip'} onFileChosen={handleFile}/>
                <TextField style={{marginLeft: 'auto'}} label={'Min Latitude'} changeHandler={(o) => { handleChange(0, o) }} propName={'coord'} defaultValue={''+defaultValues[0]}/>
                <TextField label={'Max Latitude'} changeHandler={(o) => { handleChange(1, o)}} propName={'coord'} defaultValue={''+defaultValues[1]} />
                <TextField label={'Min Longitude'} changeHandler={(o) => { handleChange(2, o)}} propName={'coord'} defaultValue={''+defaultValues[2]} />
                <TextField label={'Max Longitude'} changeHandler={(o) => { handleChange(3, o)}} propName={'coord'} defaultValue={''+defaultValues[3]} />
            </Box>
            <Box marginTop={'1rem'} height={'500px'}>
                <div style={{flex: '1 1 auto', position: 'relative'}}>
                    <div style={{height: '500px'}} id = 'map'></div>
                </div>
            </Box>
        </Paper>
    );
}
