import React, { useEffect, useState } from 'react';
import { AttachedCritter, Critter, ICollectionUnit, IMarking } from 'types/animal';
import { CbSelect } from './CbSelect';
import { Box } from '@mui/material';
import { query } from 'esri-leaflet';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CbRoutes } from 'critterbase/routes';
import { uuid } from 'types/common_types';
import { ICbRoutes, ICbSelect } from 'critterbase/types';
import { CommonProps } from '@mui/material/OverridableComponent';
import { FormChangeEvent } from 'types/form_types';

type CbCollectionUnitInputsProps = {
  taxon_id: uuid;
  collection_units?: ICollectionUnit[];
  handleChange: FormChangeEvent;
};
export const CbCollectionUnitInputs = ({
  taxon_id,
  collection_units,
  handleChange
}: CbCollectionUnitInputsProps): JSX.Element => {
  const cbApi = useTelemetryApi();
  const { data, isSuccess } = cbApi.useCritterbaseSelectOptions('taxon_collection_categories', `taxon_id=${taxon_id}`);

  return (
    <>
      {isSuccess
        ? (data as ICbSelect[]).map((s) => (
            <CbSelect
              key={s.id}
              value={collection_units.find((c) => c.collection_category_id === s.id)?.collection_unit_id ?? ''}
              prop={s.value}
              handleChange={handleChange}
              cbRouteKey={'collection_units'}
              query={`category_id=${s.id}`}
              label={s.value}
            />
          ))
        : null}
    </>
  );
};
