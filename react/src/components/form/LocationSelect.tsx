import * as L from 'leaflet';
import { Box, Paper, TextField } from '@mui/material';
//import TextField from 'components/form/TextInput';
import {inputPropsToRemove} from 'components/form/TextInput'
import { InboundObj } from 'types/form_types';
import FileInput from './FileInput';
import makeStyles from '@mui/styles/makeStyles';
import { initMap } from 'pages/map/map_init';
import shpjs from 'shpjs';
import { FeatureCollection } from 'geojson';
import { AllGeoJSON } from '@turf/helpers';
import simplify from '@turf/simplify';
import { useEffect, useRef, useState } from 'react';
import { baseInputProps, baseInputStyle } from 'components/component_constants';
import { removeProps } from 'utils/common_helpers';

type ILocationSelectProps = {
    handleDrawShape: (features: L.FeatureGroup) => void;
    height?: string;
}

export const locationStyles = makeStyles((theme) => ({
    paper: {
        padding: '30px',
    },
    mapContainerBox: {
        marginTop: theme.spacing(2)
    },
    mapContainerDiv: {
        flex: '1 1 auto', 
        position: 'relative'
    },
    button : {
        marginLeft: 'auto'
    }
}));

/*
* LocationSelect, originally for use with the Export page.
* This component displays a Leaflet map, with fields for manual lat/lon entry and a upload button for shapefiles.
* You can draw shapes by either using the Leaflet menus, entering at least one field value, or uploading a shapefile.
* All shapes can be managed with leaflet controls, and shapes drawn with all three methods may coexist simultaneously.
* Pass a handleDrawShape function that will be called every time a new shape is drawn on the map, regardless of drawing method.
*/
export default function LocationSelect (props: ILocationSelectProps) : JSX.Element {
    const { handleDrawShape, height} = props;
    const styles = locationStyles();

    const mapRef = useRef<L.Map>(null);
    const drawnItemsRef = useRef<L.FeatureGroup>(null);
    const manualLayerRef = useRef<L.Rectangle>(null);

    const [boundingBox, setBoundingBox] = useState(['','','','']);
    /*
    * 0 - Min Lat, 1 -  Max Lat,  2 - Min Lon, 3-  Max Lon
    */

    useEffect(() => {
        console.log(boundingBox);
    }, [boundingBox])

    useEffect(() => {
        const updateComponent = (): void => {
            if(!mapRef.current) {
                if(drawnItemsRef.current == null) {
                    drawnItemsRef.current = new L.FeatureGroup();
                }
                const drawOptions: L.Control.DrawOptions = {
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false
                }
                initMap(mapRef, drawnItemsRef.current, new L.GeoJSON, () => handleDrawShape(drawnItemsRef.current), () => {}, () => {}, handleDeleteLayers, drawOptions);
            }
        };
        updateComponent();
    })

    const onFileUpload = (field: string, files: FileList) => {
        const file = files[0];
        file.arrayBuffer().then((buff) => {
            shpjs.parseZip(buff).then((geo) => {
                const simplified = simplify(geo as AllGeoJSON, {tolerance: 0.01, highQuality: true});
                const geoLayerGroup = L.geoJSON(simplified as FeatureCollection);
                geoLayerGroup.eachLayer(o => o.addTo(drawnItemsRef.current));
                handleDrawShape(drawnItemsRef.current);
            });
        }); 
    }

    const isValidInput = (str: string): boolean => {
        if(str.trim() === '') {
            return true;
        }
        return !Number.isNaN(Number(str));
    }

    const handleDeleteLayers = (layers: L.LayerGroup) => {
        layers.eachLayer((l) => {
            if(l === manualLayerRef.current) {
                setBoundingBox(['','','','']);
            }
        })
    }

    const handleBoundingBox = (idx: number, val: string) => {

        if(val !== undefined) {
            const newArr = [...boundingBox.slice(0, idx), val, ...boundingBox.slice(idx+1)];
            let shouldUpdateState = true;
            //const bb = newArr.map(o => o === '' ? NaN : Number(o));
            const bb = [];
            for(const b of newArr) {
                const n = b === '' ? NaN : Number(b);

                if(b.trim().length > 0 && Number.isNaN(n)) {
                    shouldUpdateState = false;
                }
                bb.push(n);
            }
            setBoundingBox(newArr);
            
            if(shouldUpdateState && bb.some(n => !Number.isNaN(n))) {
                let [ minlat, maxlat, minlon, maxlon ] = bb;
                minlat = (Number.isNaN(minlat) || minlat < -90)     ? -90 : minlat;
                maxlat = (Number.isNaN(maxlat) || maxlat > 90)      ?  90 : maxlat;
                minlon = (Number.isNaN(minlon) || minlon < -180)    ? -180: minlon;
                maxlon = (Number.isNaN(maxlon) || maxlon > 180)     ?  180: maxlon;
                const a = new L.Rectangle([[minlat, minlon], [maxlat, maxlon]]);

                if (manualLayerRef.current == null || mapRef.current.hasLayer(manualLayerRef.current) == false) {
                    manualLayerRef.current = a.addTo(drawnItemsRef.current);
                }
                manualLayerRef.current.setBounds([[minlat, minlon], [maxlat, maxlon]]);
            }
            else if (mapRef.current.hasLayer(manualLayerRef.current) == true) {
                drawnItemsRef.current.removeLayer(manualLayerRef.current);
            }

            handleDrawShape(drawnItemsRef.current);
        }
    }

    return (
        <Paper className={styles.paper} elevation={3}>
            <Box display='flex'>
                <FileInput buttonText='Upload Shapefile' buttonVariant='outlined' accept={'.zip'} onFileChosen={onFileUpload}/>
                <TextField {...baseInputProps} style={{...baseInputStyle}} value={boundingBox[0]} className={styles.button} label={'Min Latitude'} error={Number.isNaN(Number(boundingBox[0]))} onChange={(o) => { handleBoundingBox(0, o.target.value) }} defaultValue={''+boundingBox[0]}/>
                <TextField {...baseInputProps} style={{...baseInputStyle}} value={boundingBox[1]} label={'Max Latitude'} error={Number.isNaN(Number(boundingBox[1]))} onChange={(o) => { handleBoundingBox(1, o.target.value)}}  defaultValue={''+boundingBox[1]} />
                <TextField {...baseInputProps} style={{...baseInputStyle}} value={boundingBox[2]} label={'Min Longitude'} error={Number.isNaN(Number(boundingBox[2]))} onChange={(o) => { handleBoundingBox(2, o.target.value)}}  defaultValue={''+boundingBox[2]} />
                <TextField {...baseInputProps} style={{...baseInputStyle}} value={boundingBox[3]} label={'Max Longitude'} error={Number.isNaN(Number(boundingBox[3]))} onChange={(o) => { handleBoundingBox(3, o.target.value)}}  defaultValue={''+boundingBox[3]} />
            </Box>
            <Box className={styles.mapContainerBox} height={height ?? '500px'}>
                <div className={styles.mapContainerDiv}>
                    <div style={{height: height ?? '500px'}} id = 'map'></div>
                </div>
            </Box>
        </Paper>
    );
}
