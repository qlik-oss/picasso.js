import contextFactory from '../../../../src/core/scene-graph/context';

describe('Context', () => {
  it('should handle inheritance correctly', () => {
    const session = contextFactory(['inherited']);

    let context = session();

    // First level
    context.inherited = true;
    context.notInherited = 2;

    // Save
    context = session.save();

    // Second level
    context.onlyOnSecondLevel = 1337;

    // inherited should be true on both levels
    expect(context.inherited).to.be.equal(true);
    expect(context.notInherited).to.be.equal(undefined);
    expect(context.onlyOnSecondLevel).to.be.equal(1337);

    // First level again
    session.restore();
    context = session();

    expect(context.inherited).to.be.equal(true);
    expect(context.notInherited).to.be.equal(2);
    expect(context.onlyOnSecondLevel).to.be.equal(undefined);
  });

  it('should handle inheritance with pre-made item correctly', () => {
    const session = contextFactory(['inherited']);

    let context = session();

    // First level
    context = session.save({ inherited: true, notInherited: 2 });

    // Second level
    context = session.save({ onlyOnSecondLevel: 1337 });

    // inherited should be true on both levels
    expect(context.inherited).to.be.equal(true);
    expect(context.notInherited).to.be.equal(undefined);
    expect(context.onlyOnSecondLevel).to.be.equal(1337);

    // First level again
    session.restore();
    context = session();

    expect(context.inherited).to.be.equal(true);
    expect(context.notInherited).to.be.equal(2);
    expect(context.onlyOnSecondLevel).to.be.equal(undefined);
  });

  it('should handle overwriting values correctly', () => {
    const session = contextFactory(['inherited', 'inheritedTwo']);

    let context = session();

    // First level
    context = session.save({ inherited: true, inheritedTwo: 2 });

    // Second level
    context = session.save({ inherited: 'test123' });

    // inherited should be overwritten while inheritedTwo should remain the same
    expect(context.inherited).to.be.equal('test123');
    expect(context.inheritedTwo).to.be.equal(2);
  });
});
