import { Box, Grid, Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { DetailedStatusCard } from 'components/common/DetailedCard';
import { SubHeader } from 'components/common/partials/SubHeader';
import SimpleMap from 'components/common/SimpleMap';
import { AttachedCritter } from 'types/animal';

const useStyles = makeStyles((theme) => ({
  topHeader: {
    marginBottom: theme.spacing(1),
    marginLeft: '6px'
  },
  paper: {
    padding: '12px'
  },
  gridContainer: {
    marginTop: theme.spacing(4)
  }
}));

interface DetailedAnimalViewProps {
  detailAnimal: AttachedCritter;
  height: string;
}

export default function DetailedAnimalView({ detailAnimal, height }: DetailedAnimalViewProps) {
  const styles = useStyles();

  const headerOverrides = {
    attachment_start: 'Deployment Date',
    attachment_end: 'Retrieval Date',
    last_fetch_date: 'Last Data Retrieval',
    capture_comment: 'Deployment Comment'
  };

  return (
    <Grid className={styles.gridContainer} container spacing={4}>
      <Grid item md={12} lg={6}>
        <Box className={styles.topHeader}>
          <SubHeader size='small' text='Critter Details' />
        </Box>
        <DetailedStatusCard
          displayObject={detailAnimal}
          displayKeysInGrid={[
            'taxon',
            'critter_status',
            'wlh_id',
            'animal_id',
            'collection_unit',
            'sex'
            // 'capture_date',
            // 'mortality_date'
          ]}
          displayKeysInBox={['critter_comment']}
          headerOverride={headerOverrides}
        />
      </Grid>
      <Grid item md={12} lg={6}>
        <Box className={styles.topHeader}>
          <SubHeader size='small' text='Deployment Details' />
        </Box>
        <DetailedStatusCard
          displayObject={detailAnimal}
          displayKeysInGrid={[
            'device_id',
            'device_status',
            'device_type',
            'last_fetch_date',
            'device_make',
            'frequency',
            'attachment_start',
            'attachment_end'
          ]}
          displayKeysInBox={[]}
          headerOverride={headerOverrides}
        />
      </Grid>
      <Grid item xs={12}>
        <Box className={styles.topHeader}>
          <SubHeader size='small' text='Movement Details' />
        </Box>
        <Paper className={styles.paper}>
          <SimpleMap
            divID={'detailAnimalViewMap'}
            height={height}
            critter_id={detailAnimal.critter_id}
            startDate={detailAnimal ? detailAnimal.attachment_start : null}
            endDate={detailAnimal ? detailAnimal.attachment_end : null}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
