import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBUpsert from 'pouchdb-upsert';
import React, { useEffect, useState } from 'react';

const DB_SCHEMA = process.env.REACT_APP_DB_SCHEMA || 'bctw';

export type IDatabaseContext = {
  database: PouchDB.Database<any>;
  resetDatabase: () => void;
};

export const DatabaseContext = React.createContext<IDatabaseContext>({ database: null, resetDatabase: () => { /* do nothing */ } });

/**
 * Provides access to the database and to related functions to manipulate the database instance.
 *
 * @param {*} props
 */
export const DatabaseContextProvider: React.FC = (props) => {
  const [databaseContext, setDatabaseContext] = useState<IDatabaseContext>({ database: null, resetDatabase: () => { /* do nothing */ } });

  /**
   * Create the database using standard (non-mobile) plugins/settings.
   */
  const createDatabase = (): PouchDB.Database<any> => {
    const db = new PouchDB(DB_SCHEMA);
    return db;
  };

  /**
   * Create the database.
   */
  const setupDatabase = async (): Promise<void> => {
    let db = databaseContext.database;

    if (db) {
      return;
    }

    PouchDB.plugin(PouchDBFind); // adds find query support
    PouchDB.plugin(PouchDBUpsert); // adds upsert query support

    db = createDatabase();

    setDatabaseContext({ database: db, resetDatabase: () => resetDatabase(db) });
  };

  /**
   * Destroy and re-create the database.
   */
  const resetDatabase = async (db): Promise<void> => {
    if (!db) {
      return;
    }

    await db.destroy();
    await setupDatabase();
  };

  /**
   * Close the database.
   *
   * Note: This only closes any active connections/listeners, and does not destory the actual database or its content.
   */
  const cleanupDatabase = async (): Promise<() => void> => {
    const db = databaseContext.database;

    if (!db) {
      return;
    }

    await db.close();
  };

  useEffect(() => {
    setupDatabase();

    return async (): Promise<void> => {
      await cleanupDatabase();
    };
  }, []);

  return <DatabaseContext.Provider value={databaseContext}>{props.children}</DatabaseContext.Provider>;
};
