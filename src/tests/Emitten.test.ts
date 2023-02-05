import {describe, it, expect, vi} from 'vitest';
import {Emitten} from '../Emitten';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type MockEventMap = {
  foo: (value: string) => void;
  bar: (value?: number) => void;
  baz: (...values: boolean[]) => void;
  qux: (required: string, ...optional: string[]) => void;
};

describe('Emitten full public members', () => {
  describe('Typed instance', () => {
    const mockTyped = new Emitten<MockEventMap>();
    const handleFoo: MockEventMap['foo'] = vi.fn((value) => value);

    it('has no initial events', () => {
      expect(mockTyped.activeEvents).toHaveLength(0);
    });

    it('registers a listener on a specified event', () => {
      const mockEmitFoo1 = 'value-1';
      const mockEmitFoo2 = 'value-2';

      mockTyped.on('foo', handleFoo);

      mockTyped.emit('foo', mockEmitFoo1);
      mockTyped.emit('foo', mockEmitFoo2);

      expect(mockTyped.activeEvents).toStrictEqual(['foo']);

      expect(handleFoo).toHaveBeenCalledTimes(2);
      expect(handleFoo).toHaveBeenCalledWith(mockEmitFoo1);
      expect(handleFoo).toHaveBeenCalledWith(mockEmitFoo2);
    });

    it('captures the dispose function from the .on() method', () => {
      const handleFooDispose: MockEventMap['foo'] = vi.fn((value) => value);

      const mockEmitDispose1 = 'before dispose';
      const mockEmitDispose2 = 'after dispose';

      const dispose = mockTyped.on('foo', handleFooDispose);

      mockTyped.emit('foo', mockEmitDispose1);
      dispose();
      mockTyped.emit('foo', mockEmitDispose2);

      expect(handleFooDispose).toHaveBeenCalledTimes(1);
      expect(handleFooDispose).toHaveBeenCalledWith(mockEmitDispose1);
      expect(handleFooDispose).not.toHaveBeenCalledWith(mockEmitDispose2);
    });

    it('will not add duplicate listeners', () => {
      const handleFooUnique: MockEventMap['foo'] = vi.fn((value) => value);

      const mockEmitUnique = 'unqiue';

      mockTyped.on('foo', handleFooUnique);
      mockTyped.on('foo', handleFooUnique);
      mockTyped.on('foo', handleFooUnique);

      mockTyped.emit('foo', mockEmitUnique);
      mockTyped.off('foo', handleFooUnique);

      expect(handleFooUnique).toHaveBeenCalledTimes(1);
      expect(handleFooUnique).toHaveBeenCalledWith(mockEmitUnique);
      expect(handleFooUnique).not.toHaveBeenCalledTimes(3);
      expect(mockTyped.activeEvents).toStrictEqual(['foo']);
    });

    it('removes the exact listener specified', () => {
      const handleFooOther: MockEventMap['foo'] = vi.fn((value) => value);

      const mockEmitFooOther1 = 'other-value-1';
      const mockEmitFooOther2 = 'other-value-2';
      const mockEmitFooRetained = 'retained listener';

      mockTyped.on('foo', handleFooOther);
      mockTyped.emit('foo', mockEmitFooOther1);

      expect(mockTyped.activeEvents).toStrictEqual(['foo']);

      expect(handleFooOther).toHaveBeenCalledTimes(1);
      expect(handleFooOther).toHaveBeenCalledWith(mockEmitFooOther1);

      mockTyped.off('foo', handleFooOther);
      mockTyped.emit('foo', mockEmitFooOther2);

      expect(handleFooOther).not.toHaveBeenCalledTimes(2);
      expect(handleFooOther).not.toHaveBeenCalledWith(mockEmitFooOther2);

      expect(mockTyped.activeEvents).toStrictEqual(['foo']);

      mockTyped.emit('foo', mockEmitFooRetained);
      expect(handleFoo).toHaveBeenCalledWith(mockEmitFooRetained);
    });

    it('registers a listener only once', () => {
      const handleBar: MockEventMap['bar'] = vi.fn((value) => value);

      const mockEmitBar1 = 123;
      const mockEmitBar2 = 456;

      mockTyped.once('bar', handleBar);
      mockTyped.emit('bar', mockEmitBar1);
      mockTyped.emit('bar', mockEmitBar2);

      expect(handleBar).toHaveBeenCalledTimes(1);
      expect(handleBar).toHaveBeenCalledWith(mockEmitBar1);
      expect(handleBar).not.toHaveBeenCalledWith(mockEmitBar2);
    });

    it('accepts variadic arguments', () => {
      const handleBaz: MockEventMap['baz'] = vi.fn((value) => value);
      const mockEmitBazArgs = [true, false, !true, !false];

      mockTyped.on('baz', handleBaz);
      mockTyped.emit('baz', ...mockEmitBazArgs);

      expect(handleBaz).toHaveBeenCalledTimes(1);
      expect(handleBaz).toHaveBeenCalledWith(...mockEmitBazArgs);
    });

    it('accepts positional variadic arguments', () => {
      const handleQux: MockEventMap['qux'] = vi.fn((value) => value);

      const mockEmitQuxRequired1 = 'first required';
      const mockEmitQuxRequired2 = 'second required';
      const mockEmitQuxOptional = ['optional', 'variadic', 'args'];

      mockTyped.on('qux', handleQux);
      mockTyped.emit('qux', mockEmitQuxRequired1);
      mockTyped.emit('qux', mockEmitQuxRequired2, ...mockEmitQuxOptional);

      expect(handleQux).toHaveBeenCalledTimes(2);
      expect(handleQux).toHaveBeenCalledWith(mockEmitQuxRequired1);
      expect(handleQux).toHaveBeenCalledWith(
        mockEmitQuxRequired2,
        ...mockEmitQuxOptional,
      );
    });

    it('empties out all registered events', () => {
      expect(mockTyped.activeEvents).toHaveLength(3);
      mockTyped.empty();
      expect(mockTyped.activeEvents).toHaveLength(0);
    });
  });

  describe('Un-typed instance', () => {
    const mockDefault = new Emitten();
    const handleSomething = vi.fn((anything?: any) => anything);

    it('accepts any event and listener signature', () => {
      const mockEmitValues1 = ['one'];
      const mockEmitValues2 = ['two', 2];
      const mockEmitValues3 = ['three', 3, [true, false, null]];

      mockDefault.on('something', handleSomething);

      mockDefault.emit('something', ...mockEmitValues1);
      mockDefault.emit('something', ...mockEmitValues2);
      mockDefault.emit('something', ...mockEmitValues3);

      expect(handleSomething).toHaveBeenCalledWith(...mockEmitValues1);
      expect(handleSomething).toHaveBeenCalledWith(...mockEmitValues2);
      expect(handleSomething).toHaveBeenCalledWith(...mockEmitValues3);

      expect(handleSomething).toHaveBeenCalledTimes(3);
    });

    it('removes a registered listener', () => {
      const mockEmitValues1 = ['anything'];

      mockDefault.off('something', handleSomething);
      mockDefault.emit('something', ...mockEmitValues1);

      expect(handleSomething).not.toHaveBeenCalledWith(...mockEmitValues1);
      expect(mockDefault.activeEvents).not.toContain('something');
    });

    it('registers a listener only once', () => {
      const handleOther = vi.fn((someArg: string) => someArg);

      const mockEmitValues1 = [1];
      const mockEmitValues2 = [2, 'two'];

      mockDefault.once('other', handleOther);

      // While our listener's argument is typed as `string`,
      // an "un-typed instance" of Emitten will not provide
      // type-safety over argument values.
      mockDefault.emit('other', ...mockEmitValues1);
      mockDefault.emit('other', ...mockEmitValues2);

      expect(handleOther).toHaveBeenCalledWith(...mockEmitValues1);
      expect(handleOther).toHaveBeenCalledTimes(1);

      expect(handleOther).not.toHaveBeenCalledWith(...mockEmitValues2);
      expect(handleOther).not.toHaveBeenCalledTimes(2);
    });

    it('does not emit events that are not registered', () => {
      mockDefault.emit('nothing');
      mockDefault.emit('nothing', 'void');

      expect(mockDefault.activeEvents).not.toContain('nothing');
    });

    it('retains a list of all active events', () => {
      mockDefault.on('one', () => {});
      mockDefault.on('two', () => {});
      mockDefault.on('three', () => {});
      mockDefault.on('four', () => {});

      expect(mockDefault.activeEvents).toStrictEqual([
        'one',
        'two',
        'three',
        'four',
      ]);
    });

    it('empties out all registered events', () => {
      expect(mockDefault.activeEvents).toHaveLength(4);
      mockDefault.empty();
      expect(mockDefault.activeEvents).toHaveLength(0);
    });
  });
});
