import { Box, Paper, TextField, useTheme } from '@mui/material';
import { baseInputProps, baseInputStyle } from 'components/component_constants';
import * as L from 'leaflet';
import { initMap } from 'pages/map/map_init';
import { useEffect, useRef, useState } from 'react';
import { locationStyles } from './LocationSelect';

type ILocationInputMapProps = {
  handleSelectLocation: (lat: number, lon: number, uncertainty: number) => void;
  height?: string;
};

/*
 *Description
 */
export default function LocationInputMap(props: ILocationInputMapProps): JSX.Element {
  const theme = useTheme();
  const { handleSelectLocation, height } = props;
  const styles = locationStyles();

  const mapRef = useRef<L.Map>(null);
  const markerRef = useRef<L.FeatureGroup>(null);
  const draggingRef = useRef<boolean>(false);

  const [location, setLocation] = useState(['', '']);
  const [radius, setRadius] = useState<number>(10000);
  const Labels = ['Latitude', 'Longitude', 'Uncertainty'];

  //Fix me: clicking to make new circle is broken after resizing a circle
  const updateMarker = (coords: L.LatLng) => {
    if (markerRef.current) {
      markerRef.current.clearLayers(); // remove old marker
    }

    const circle = new L.Circle(coords, { radius });
    circle.addTo(markerRef.current); // add new marker

    //let isDragging = false;
    let dragStartPoint: L.LatLng | null = null;

    circle.on('mousedown', (event: L.LeafletEvent | any) => {
      console.log('mousedown');
      //isDragging = true;
      draggingRef.current = true;
      dragStartPoint = event.latlng;
      mapRef.current?.dragging.disable(); // disable map dragging while dragging circle
      L.DomEvent.stopPropagation(event); // stop event propagation to prevent map click
      mapRef.current.on('mousemove', function (e: any) {
        const distance = circle.getLatLng().distanceTo(e.latlng);
        setRadius(distance);
        circle.setRadius(distance);
      });
    });

    mapRef.current.on('mouseup', function (e) {
      mapRef.current.removeEventListener('mousemove');
      mapRef.current?.dragging.enable(); // re-enable map dragging after dragging circle
      dragStartPoint = null;
    });

    // circle.on('mousemove', (event: L.LeafletEvent | any) => {
    //   console.log('mousemove');
    //   if (draggingRef.current && dragStartPoint) {
    //     const distance = 1.2 * circle.getLatLng().distanceTo(event.latlng);
    //     setRadius(distance);
    //     circle.setRadius(distance);
    //   }
    // });

    // circle.on('mouseup', () => {
    //   console.log('mouseup');
    //   // isDragging = false;
    //   draggingRef.current = false;
    //   dragStartPoint = null;
    //   mapRef.current?.dragging.enable(); // re-enable map dragging after dragging circle
    // });
  };

  const handleMapClick = (event: L.LeafletEvent | any) => {
    if (!draggingRef.current) {
      console.log('mapClick');
      setLocation([event.latlng.lat, event.latlng.lng]);
      updateMarker(event.latlng);
    }
  };

  useEffect(() => {
    console.log(location);
  }, [location]);

  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        if (markerRef.current == null) {
          markerRef.current = new L.FeatureGroup();
        }
        const drawOptions: L.Control.DrawOptions = {
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false
        };
        initMap(
          mapRef,
          markerRef.current,
          new L.GeoJSON(),
          () => {},
          () => {},
          () => {},
          () => {},
          drawOptions,
          true
        );
        mapRef.current.on('click', (e) => {
          handleMapClick(e);
        });
      }
    };
    updateComponent();
  });

  return (
    <Paper className={styles.paper} variant='outlined'>
      <Box className={styles.mapContainerBox} height={height ?? '500px'}>
        <div className={styles.mapContainerDiv}>
          <div style={{ height: height ?? '500px' }} id='map'></div>
        </div>
      </Box>
      <Box display='flex' pt={1}>
        <Box pl={1} />
        {Labels.map((label, idx) => (
          <TextField
            {...baseInputProps}
            style={{ ...baseInputStyle }}
            value={idx === 2 ? radius : location[idx]}
            className={styles.button}
            label={label}
            onChange={(o) => {}}
            defaultValue={'' + location[idx]}
          />
        ))}
      </Box>
    </Paper>
  );
}
