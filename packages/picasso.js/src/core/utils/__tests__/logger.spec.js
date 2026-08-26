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
    spyLog = vi.spyOn(pipe, 'log');
    spyWarn = vi.spyOn(pipe, 'warn');
    spyInfo = vi.spyOn(pipe, 'info');
    spyError = vi.spyOn(pipe, 'error');
  });
  afterEach(() => {
    spyLog.mockRestore();
    spyWarn.mockRestore();
    spyInfo.mockRestore();
    spyError.mockRestore();
  });

  it('at level = DEBUG should log everything', () => {
    logger.level(logger.LOG_LEVEL.DEBUG);
    log();
    expect(spyError.mock.calls[0]).to.eql(['b', 'bb']);
    expect(spyWarn.mock.calls[0]).to.eql(['c', 'cc']);
    expect(spyInfo.mock.calls[0]).to.eql(['d', 'dd']);
    expect(spyLog.mock.calls[0]).to.eql(['e', 'ee']);
  });

  it('at level = INFO', () => {
    logger.level(logger.LOG_LEVEL.INFO);
    log();
    expect(spyError.mock.calls[0]).to.eql(['b', 'bb']);
    expect(spyWarn.mock.calls[0]).to.eql(['c', 'cc']);
    expect(spyInfo.mock.calls[0]).to.eql(['d', 'dd']);
    expect(spyLog.mock.calls.length).to.eql(0);
  });

  it('at level = WARN', () => {
    logger.level(logger.LOG_LEVEL.WARN);
    log();
    expect(spyError.mock.calls[0]).to.eql(['b', 'bb']);
    expect(spyWarn.mock.calls[0]).to.eql(['c', 'cc']);
    expect(spyInfo.mock.calls.length).to.eql(0);
    expect(spyLog.mock.calls.length).to.eql(0);
  });

  it('at level = ERROR', () => {
    logger.level(logger.LOG_LEVEL.ERROR);
    log();
    expect(spyError.mock.calls[0]).to.eql(['b', 'bb']);
    expect(spyWarn.mock.calls.length).to.eql(0);
    expect(spyInfo.mock.calls.length).to.eql(0);
    expect(spyLog.mock.calls.length).to.eql(0);
  });

  it('at level = OFF should not log anything', () => {
    logger.level(logger.LOG_LEVEL.OFF);
    log();
    expect(spyError.mock.calls.length).to.equal(0);
    expect(spyWarn.mock.calls.length).to.equal(0);
    expect(spyInfo.mock.calls.length).to.equal(0);
    expect(spyLog.mock.calls.length).to.equal(0);
  });

  it('should log error', () => {
    logger.level(logger.LOG_LEVEL.ERROR);
    logger.error('err', 'errr');
    expect(spyError.mock.calls[0]).to.eql(['err', 'errr']);
  });

  it('should log warn', () => {
    logger.level(logger.LOG_LEVEL.WARN);
    logger.warn('w', 'wa');
    expect(spyWarn.mock.calls[0]).to.eql(['w', 'wa']);
  });

  it('should log info', () => {
    logger.level(logger.LOG_LEVEL.INFO);
    logger.info('i', 'info');
    expect(spyInfo.mock.calls[0]).to.eql(['i', 'info']);
  });

  it('should log debug', () => {
    logger.level(logger.LOG_LEVEL.DEBUG);
    logger.debug('d', 'deb');
    expect(spyLog.mock.calls[0]).to.eql(['d', 'deb']);
  });
});
