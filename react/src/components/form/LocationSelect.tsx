import { Box, Paper, TextField, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { AllGeoJSON } from '@turf/helpers';
import simplify from '@turf/simplify';
import { baseInputProps, baseInputStyle } from 'components/component_constants';
import { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { initMap } from 'pages/map/map_init';
import { useEffect, useRef, useState } from 'react';
import shpjs from 'shpjs';
import FileInput from './FileInput';

type ILocationSelectProps = {
  handleDrawShape: (features: L.FeatureGroup) => void;
  height?: string;
};

const locationStyles = makeStyles((theme) => ({
  paper: {
    padding: '30px'
  },
  mapContainerBox: {
    marginTop: theme.spacing(2)
  },
  mapContainerDiv: {
    flex: '1 1 auto',
    position: 'relative'
  },
  button: {
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
export default function LocationSelect(props: ILocationSelectProps): JSX.Element {
  const theme = useTheme();
  const { handleDrawShape, height } = props;
  const styles = locationStyles();

  const mapRef = useRef<L.Map>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(null);
  const manualLayerRef = useRef<L.Rectangle>(null);

  const [boundingBox, setBoundingBox] = useState(['', '', '', '']);
  const Labels = ['Min Latitude', 'Max Latitude', 'Min Longitude', 'Max Longitude'];
  /*
   * 0 - Min Lat, 1 -  Max Lat,  2 - Min Lon, 3-  Max Lon
   */

  useEffect(() => {
    console.log(boundingBox);
  }, [boundingBox]);

  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        if (drawnItemsRef.current == null) {
          drawnItemsRef.current = new L.FeatureGroup();
        }
        const drawOptions: L.Control.DrawOptions = {
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false
        };
        initMap(
          mapRef,
          drawnItemsRef.current,
          new L.GeoJSON(),
          () => handleDrawShape(drawnItemsRef.current),
          () => {},
          () => {},
          handleDeleteLayers,
          drawOptions
        );
      }
    };
    updateComponent();
  });

  const onFileUpload = (field: string, files: FileList) => {
    const file = files[0];
    file.arrayBuffer().then((buff) => {
      shpjs.parseZip(buff).then((geo) => {
        const simplified = simplify(geo as AllGeoJSON, { tolerance: 0.01, highQuality: true });
        const geoLayerGroup = L.geoJSON(simplified as FeatureCollection);
        geoLayerGroup.eachLayer((o) => o.addTo(drawnItemsRef.current));
        handleDrawShape(drawnItemsRef.current);
      });
    });
  };

  // const isValidInput = (str: string): boolean => {
  //   if (str.trim() === '') {
  //     return true;
  //   }
  //   return !Number.isNaN(Number(str));
  // };

  const handleDeleteLayers = (layers: L.LayerGroup) => {
    layers.eachLayer((l) => {
      if (l === manualLayerRef.current) {
        setBoundingBox(['', '', '', '']);
      }
    });
  };

  const handleBoundingBox = (idx: number, val: string) => {
    if (val !== undefined) {
      const newArr = [...boundingBox.slice(0, idx), val, ...boundingBox.slice(idx + 1)];
      let shouldUpdateState = true;
      const bb = [];
      for (const b of newArr) {
        const n = b === '' ? NaN : Number(b);

        if (b.trim().length > 0 && Number.isNaN(n)) {
          shouldUpdateState = false;
        }
        bb.push(n);
      }
      setBoundingBox(newArr);

      if (shouldUpdateState && bb.some((n) => !Number.isNaN(n))) {
        let [minlat, maxlat, minlon, maxlon] = bb;
        minlat = Number.isNaN(minlat) || minlat < -90 ? -90 : minlat;
        maxlat = Number.isNaN(maxlat) || maxlat > 90 ? 90 : maxlat;
        minlon = Number.isNaN(minlon) || minlon < -180 ? -180 : minlon;
        maxlon = Number.isNaN(maxlon) || maxlon > 180 ? 180 : maxlon;
        const a = new L.Rectangle([
          [minlat, minlon],
          [maxlat, maxlon]
        ]);

        if (manualLayerRef.current == null || mapRef.current.hasLayer(manualLayerRef.current) == false) {
          manualLayerRef.current = a.addTo(drawnItemsRef.current);
        }
        manualLayerRef.current.setBounds([
          [minlat, minlon],
          [maxlat, maxlon]
        ]);
      } else if (mapRef.current.hasLayer(manualLayerRef.current) == true) {
        drawnItemsRef.current.removeLayer(manualLayerRef.current);
      }

      handleDrawShape(drawnItemsRef.current);
    }
  };

  return (
    <Paper className={styles.paper} variant='outlined'>
      <Box display='flex'>
        <FileInput buttonText='Upload Shapefile' buttonVariant='outlined' accept={'.zip'} onFileChosen={onFileUpload} />
        <Box pl={1} />
        {Labels.map((label, idx) => (
          <TextField
            {...baseInputProps}
            style={{ ...baseInputStyle }}
            value={boundingBox[idx]}
            className={styles.button}
            label={label}
            error={Number.isNaN(Number(boundingBox[idx]))}
            onChange={(o) => {
              handleBoundingBox(idx, o.target.value);
            }}
            defaultValue={'' + boundingBox[idx]}
          />
        ))}
      </Box>
      <Box className={styles.mapContainerBox} height={height ?? '500px'}>
        <div className={styles.mapContainerDiv}>
          <div style={{ height: height ?? '500px' }} id='map'></div>
        </div>
      </Box>
    </Paper>
  );
}
