import * as migration_20260213_082936_init_collections from './20260213_082936_init_collections';

export const migrations = [
  {
    up: migration_20260213_082936_init_collections.up,
    down: migration_20260213_082936_init_collections.down,
    name: '20260213_082936_init_collections'
  },
];
