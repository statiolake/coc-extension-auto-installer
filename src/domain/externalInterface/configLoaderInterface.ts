import { Config } from '../logic/config';

export type ConfigLoaderInterface = {
  load: () => Config;
};
