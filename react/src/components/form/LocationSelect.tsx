import * as L from 'leaflet';
import { Box, Paper } from '@mui/material';
import TextField from 'components/form/TextInput';
import { InboundObj } from 'types/form_types';
import FileInput from './FileInput';
import makeStyles from '@mui/styles/makeStyles';
import { initMap } from 'pages/map/map_init';
import shpjs from 'shpjs';
import { FeatureCollection } from 'geojson';
import { AllGeoJSON } from '@turf/helpers';
import simplify from '@turf/simplify';
import { useEffect, useRef, useState } from 'react';

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
                initMap(mapRef, drawnItemsRef.current, new L.GeoJSON, () => handleDrawShape(drawnItemsRef.current), () => {}, () => {}, drawOptions);
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

    const handleBoundingBox = (idx: number, val: InboundObj) => {
        if(val['coord'] !== undefined) {
            const newArr = [...boundingBox.slice(0, idx), String(val['coord']) , ...boundingBox.slice(idx+1)];
            const bb = newArr.map(o => o === '' ? NaN : Number(o));
            setBoundingBox(newArr);
            
            if(bb.some(o => !Number.isNaN(o))) {
                let [ minlat, maxlat, minlon, maxlon ] = bb;
                minlat = (Number.isNaN(minlat)) ? -90 : minlat;
                maxlat = (Number.isNaN(maxlat)) ?  90 : maxlat;
                minlon = (Number.isNaN(minlon)) ? -180: minlon;
                maxlon = (Number.isNaN(maxlon)) ?  180: maxlon;
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
                <TextField className={styles.button} label={'Min Latitude'} changeHandler={(o) => { handleBoundingBox(0, o) }} propName={'coord'} defaultValue={''+boundingBox[0]}/>
                <TextField label={'Max Latitude'} changeHandler={(o) => { handleBoundingBox(1, o)}} propName={'coord'} defaultValue={''+boundingBox[1]} />
                <TextField label={'Min Longitude'} changeHandler={(o) => { handleBoundingBox(2, o)}} propName={'coord'} defaultValue={''+boundingBox[2]} />
                <TextField label={'Max Longitude'} changeHandler={(o) => { handleBoundingBox(3, o)}} propName={'coord'} defaultValue={''+boundingBox[3]} />
            </Box>
            <Box className={styles.mapContainerBox} height={height ?? '500px'}>
                <div className={styles.mapContainerDiv}>
                    <div style={{height: height ?? '500px'}} id = 'map'></div>
                </div>
            </Box>
        </Paper>
    );
}
