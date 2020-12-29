import React, { useContext, useEffect, useState } from 'react';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';

/**
 * test pouch upsert and find
 */
const SamplePouchCall = async () => {
  const db = useContext(DatabaseContext);
  const critter = { id: 2, nickname: 'sparky' };
  // pouch requires all json objects to have _id
  const o = { _id: `critter:${critter.id}`, ...critter };
  // db puts and the upsert plugin return callbacks
  const response = await db.database.putIfNotExists(o);
  console.log(JSON.stringify(response));
  // find critter just inserted using pouch find plugin
  const found = await db.database.find({ selector: { _id: `critter:${critter.id}` }, fields: ['_id', 'nickname'] });
  console.log(found.docs);
};

const SampleComponentUsingChangesHook: React.FC = (props) => {
  const db = useContext(DatabaseContext);
  const dbChanges = useContext(DatabaseChangesContext);
  const [critter, setCritter] = useState(null);

  const getCritter = async () => {
    // a previously saved document
    const docs = await db.database.find({ selector: { _id: 'critter:151' } });
    if (!docs || !docs.docs.length) {
      return;
    }
    // update state to the found critter
    setCritter(docs.docs[0]);
  };

  // use useEffect hook to update this component with dbchanges context
  useEffect(() => {
    const updateComponent = () => {
      getCritter();
    };
    updateComponent();
  }, [dbChanges]);

  return (
    <>
      {critter ? (
        <div>
          <h4>critter found!</h4>
          <p>critters id is: {critter.id}</p>
          <p>critter's nickname is: {critter.nickname}</p>
          <p>critter's species is: {critter.species}</p>
        </div>
      ) : (
        <div>no critter</div>
      )}
    </>
  );
};

export {
  SamplePouchCall,
  SampleComponentUsingChangesHook
};
