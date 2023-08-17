import { INestiaConfig } from '@nestia/sdk';
const config: INestiaConfig = {
  input: 'src/**/*.controller.ts',
  output: './taste_dict',
  distribute: 'packages/api',
};
export default config;
