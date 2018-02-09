import registry from '../utils/registry';
import native from '../../web/interactions/native';

const reg = registry();

reg('native', native);

export default reg;
