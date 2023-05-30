import { ICbSelect } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICollectionUnit } from 'types/animal';
import { uuid } from 'types/common_types';
import { FormChangeEvent } from 'types/form_types';
import { CbSelect } from './CbSelect';

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
