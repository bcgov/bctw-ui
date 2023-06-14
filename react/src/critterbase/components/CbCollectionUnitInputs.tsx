import { ICbSelect } from 'critterbase/types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICollectionUnit } from 'types/animal';
import { uuid } from 'types/common_types';
import { FormChangeEvent, InboundObj, parseFormChangeResult } from 'types/form_types';
import { CbSelect } from './CbSelect';
import { useEffect, useState } from 'react';

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
  const [internalLookup, setInternalLookup] = useState<Partial<ICollectionUnit>[]>(collection_units ? collection_units.map(a => {return {...a}}) : []);

  useEffect(() => {
    setInternalLookup(collection_units ? collection_units.map(a => {return {...a}}) : []);
  }, [collection_units])

  const onChange = (v: InboundObj, category_id: string): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [key, value] = parseFormChangeResult(v); //Easier to just disable for this line so we can still use the array destructuring
    if(!value) {
      return;
    }
    const existing = internalLookup.findIndex(a => a.collection_category_id === category_id);
    if(existing > -1) {
      internalLookup[existing].collection_unit_id = value as string;
    }
    else {
      internalLookup.push({
        collection_unit_id: value as string,
        collection_category_id: category_id
      })
    }
    handleChange({collection_units: internalLookup});
  }

  return (
    <>
      {isSuccess
        ? (data as ICbSelect[]).map((s) => (
            <CbSelect
              key={s.id}
              value={collection_units?.find((c) => c.collection_category_id === s.id)?.collection_unit_id ?? ''}
              prop={'collection_units'}
              handleChange={(v) => onChange(v, s.id)}
              cbRouteKey={'collection_units'}
              query={`category_id=${s.id}`}
              label={s.value}
            />
          ))
        : null}
    </>
  );
};
