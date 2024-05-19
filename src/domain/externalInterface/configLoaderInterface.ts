import { Config } from '../logic/entity/config';

export type ConfigLoaderInterface = {
  load: () => Config;
};
