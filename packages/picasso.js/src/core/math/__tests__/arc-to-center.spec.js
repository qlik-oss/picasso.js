import arcToCenter from '../arc-to-center';

describe('Arc to center', () => {
  let rx;
  let ry;
  let rotation;
  let largeArcFlag;
  let sweepFlag;
  let endX;
  let endY;
  let startX;
  let startY;

  beforeEach(() => {
    startX = 0;
    startY = 0;
    rx = 10;
    ry = 10;
    rotation = 0;
    largeArcFlag = false;
    sweepFlag = false;
    endX = 10;
    endY = 10;
  });

  it('largeArcFlag=0, sweepFlag=0', () => {
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out).to.deep.equal({
      startAngle: Math.PI,
      sweepAngle: -(Math.PI / 2),
      cx: 10,
      cy: 0,
      rx: 10,
      ry: 10
    });
  });

  it('largeArcFlag=1, sweepFlag=0', () => {
    largeArcFlag = true;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out).to.deep.equal({
      startAngle: Math.PI * 1.5,
      sweepAngle: -(Math.PI * 1.5),
      cx: 0,
      cy: 10,
      rx: 10,
      ry: 10
    });
  });

  it('largeArcFlag=0, sweepFlag=1', () => {
    sweepFlag = true;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out).to.deep.equal({
      startAngle: Math.PI * 1.5,
      sweepAngle: Math.PI / 2,
      cx: 0,
      cy: 10,
      rx: 10,
      ry: 10
    });
  });

  it('largeArcFlag=1, sweepFlag=1', () => {
    sweepFlag = true;
    largeArcFlag = true;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out).to.deep.equal({
      startAngle: Math.PI,
      sweepAngle: Math.PI * 1.5,
      cx: 10,
      cy: 0,
      rx: 10,
      ry: 10
    });
  });

  it('given rx is less then the distance between startX and endX, then rx should be scaled up', () => {
    rx = 5;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out.startAngle).to.approximately(3.6, 0.01);
    expect(out.sweepAngle).to.approximately(-Math.PI, 0.001);
    expect(out.cx).to.approximately(5.0, 0.01);
    expect(out.cy).to.approximately(4.99, 0.01);
    expect(out.rx).to.approximately(5.59, 0.01);
    expect(out.ry).to.approximately(11.18, 0.01);
  });

  it('given ry is less then the distance between startY and endY, then ry should be scaled up', () => {
    ry = 5;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out.startAngle).to.approximately(4.248, 0.01);
    expect(out.sweepAngle).to.approximately(-Math.PI, 0.001);
    expect(out.cx).to.approximately(5.0, 0.01);
    expect(out.cy).to.approximately(4.99, 0.01);
    expect(out.rx).to.approximately(11.18, 0.01);
    expect(out.ry).to.approximately(5.59, 0.01);
  });

  it('should use absolute value of rx/ry', () => {
    rx = -10;
    ry = -10;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out).to.deep.equal({
      startAngle: Math.PI,
      sweepAngle: -(Math.PI / 2),
      cx: 10,
      cy: 0,
      rx: 10,
      ry: 10
    });
  });

  it('should handle opposite start/end positions', () => {
    endX = 0;
    endY = 0;
    startX = 10;
    startY = 10;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out).to.deep.equal({
      startAngle: 0,
      sweepAngle: -(Math.PI / 2),
      cx: 0,
      cy: 10,
      rx: 10,
      ry: 10
    });
  });

  it('vertical ellipse', () => {
    ry = 20;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out.startAngle).to.approximately(2.62, 0.01);
    expect(out.sweepAngle).to.approximately(-1.186, 0.001);
    expect(out.cx).to.approximately(8.7, 0.01);
    expect(out.cy).to.approximately(-9.83, 0.01);
    expect(out.rx).to.equal(10);
    expect(out.ry).to.equal(20);
  });

  it('horizontal ellipse', () => {
    rx = 20;
    const out = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY);

    expect(out.startAngle).to.approximately(3.27, 0.01);
    expect(out.sweepAngle).to.approximately(-1.186, 0.001);
    expect(out.cx).to.approximately(19.83, 0.01);
    expect(out.cy).to.approximately(1.29, 0.01);
    expect(out.rx).to.equal(20);
    expect(out.ry).to.equal(10);
  });
});
