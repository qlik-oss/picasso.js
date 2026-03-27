import registry from '../utils/registry';
import dataset from './dataset';

const dataRegistry = registry();

dataRegistry.default('matrix');

dataRegistry('matrix', dataset);

dataRegistry('default', dataset); // deprecated

export default dataRegistry;
