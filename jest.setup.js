import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiSubset from 'chai-subset';

global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;

chai.use(sinonChai);
chai.use(chaiSubset);

delete global.window.location;
global.window.location = { href: '' };
