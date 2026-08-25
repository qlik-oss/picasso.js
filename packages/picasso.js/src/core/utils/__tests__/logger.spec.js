import loggerFn from '../logger';

describe('logger', () => {
  let logger;
  function log() {
    logger.log(0, 'a', 'aa');
    logger.log(1, 'b', 'bb');
    logger.log(2, 'c', 'cc');
    logger.log(3, 'd', 'dd');
    logger.log(4, 'e', 'ee');
  }

  let pipe = {
    log: () => {},
    warn: () => {},
    info: () => {},
    error: () => {},
  };

  let spyLog;
  let spyWarn;
  let spyInfo;
  let spyError;

  beforeEach(() => {
    logger = loggerFn({ pipe });
    spyLog = sinon.spy(pipe, 'log');
    spyWarn = sinon.spy(pipe, 'warn');
    spyInfo = sinon.spy(pipe, 'info');
    spyError = sinon.spy(pipe, 'error');
  });
  afterEach(() => {
    spyLog.restore();
    spyWarn.restore();
    spyInfo.restore();
    spyError.restore();
  });

  it('at level = DEBUG should log everything', () => {
    logger.level(logger.LOG_LEVEL.DEBUG);
    log();
    expect(spyError.getCall(0).args).to.eql(['b', 'bb']);
    expect(spyWarn.getCall(0).args).to.eql(['c', 'cc']);
    expect(spyInfo.getCall(0).args).to.eql(['d', 'dd']);
    expect(spyLog.getCall(0).args).to.eql(['e', 'ee']);
  });

  it('at level = INFO', () => {
    logger.level(logger.LOG_LEVEL.INFO);
    log();
    expect(spyError.getCall(0).args).to.eql(['b', 'bb']);
    expect(spyWarn.getCall(0).args).to.eql(['c', 'cc']);
    expect(spyInfo.getCall(0).args).to.eql(['d', 'dd']);
    expect(spyLog.callCount).to.eql(0);
  });

  it('at level = WARN', () => {
    logger.level(logger.LOG_LEVEL.WARN);
    log();
    expect(spyError.getCall(0).args).to.eql(['b', 'bb']);
    expect(spyWarn.getCall(0).args).to.eql(['c', 'cc']);
    expect(spyInfo.callCount).to.eql(0);
    expect(spyLog.callCount).to.eql(0);
  });

  it('at level = ERROR', () => {
    logger.level(logger.LOG_LEVEL.ERROR);
    log();
    expect(spyError.getCall(0).args).to.eql(['b', 'bb']);
    expect(spyWarn.callCount).to.eql(0);
    expect(spyInfo.callCount).to.eql(0);
    expect(spyLog.callCount).to.eql(0);
  });

  it('at level = OFF should not log anything', () => {
    logger.level(logger.LOG_LEVEL.OFF);
    log();
    expect(spyError.callCount).to.equal(0);
    expect(spyWarn.callCount).to.equal(0);
    expect(spyInfo.callCount).to.equal(0);
    expect(spyLog.callCount).to.equal(0);
  });

  it('should log error', () => {
    logger.level(logger.LOG_LEVEL.ERROR);
    logger.error('err', 'errr');
    expect(spyError.getCall(0).args).to.eql(['err', 'errr']);
  });

  it('should log warn', () => {
    logger.level(logger.LOG_LEVEL.WARN);
    logger.warn('w', 'wa');
    expect(spyWarn.getCall(0).args).to.eql(['w', 'wa']);
  });

  it('should log info', () => {
    logger.level(logger.LOG_LEVEL.INFO);
    logger.info('i', 'info');
    expect(spyInfo.getCall(0).args).to.eql(['i', 'info']);
  });

  it('should log debug', () => {
    logger.level(logger.LOG_LEVEL.DEBUG);
    logger.debug('d', 'deb');
    expect(spyLog.getCall(0).args).to.eql(['d', 'deb']);
  });
});
