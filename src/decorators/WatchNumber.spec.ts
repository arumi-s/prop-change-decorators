import { WatchNumber } from './WatchNumber';
import { Dispatcher } from './Dispatcher';
import { Change } from '../internals/Change';
import { ChangeDispatcher } from '../internals/ChangeDispatcher';

class Entity {
	@Dispatcher()
	readonly change$: ChangeDispatcher<Entity>;

	@WatchNumber({ name: 'numberValue' })
	private __numberValue__ = 0;
	numberValue: number;

	@WatchNumber({ name: 'otherNumberValue' })
	private __otherNumberValue__ = -100;
	otherNumberValue: number;
}

class EntityWithoutChangeDispatcher {
	@WatchNumber({ name: 'numberValue' })
	__numberValue__ = 0;
	numberValue: number;
}

describe('@WatchNumber', () => {
	let entity: Entity;

	beforeEach(() => {
		entity = new Entity();
	});

	it('should provide prop accessor', () => {
		expect(entity.numberValue).toStrictEqual(0);
		entity.numberValue = 5;
		expect(entity.numberValue).toStrictEqual(5);
		entity.numberValue = Number.MAX_SAFE_INTEGER;
		expect(entity.numberValue).toStrictEqual(Number.MAX_SAFE_INTEGER);
	});

	it('should watch prop change', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);

		entity.numberValue = 100;
		expect(entity.numberValue).toStrictEqual(100);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 100) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.numberValue = 25.678;
		expect(entity.numberValue).toStrictEqual(25.678);
		expect(subscriber).toHaveBeenNthCalledWith(2, { numberValue: new Change(100, 25.678) });
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should not fire when prop value is the same', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);

		entity.numberValue = 0;
		expect(entity.numberValue).toStrictEqual(0);

		expect(subscriber).toHaveBeenCalledTimes(0);

		entity.numberValue = 50;
		expect(entity.numberValue).toStrictEqual(50);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 50) });
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	it('should cast value to Number', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = '1.234' as any;
		expect(entity.numberValue).toStrictEqual(1.234);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 1.234) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = 'x' as any;
		expect(entity.numberValue).toBeNaN();
		expect(subscriber).toHaveBeenNthCalledWith(2, { numberValue: new Change(1.234, NaN) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = '0' as any;
		expect(entity.numberValue).toStrictEqual(0);
		expect(subscriber).toHaveBeenNthCalledWith(3, { numberValue: new Change(NaN, 0) });
		expect(subscriber).toHaveBeenCalledTimes(3);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = null as any;
		expect(entity.numberValue).toStrictEqual(0);
		expect(subscriber).toHaveBeenCalledTimes(3);
	});

	it('should handle multiple props', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);
		expect(entity.otherNumberValue).toStrictEqual(-100);

		entity.numberValue = 12.34;
		expect(entity.numberValue).toStrictEqual(12.34);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 12.34) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.otherNumberValue = 50;
		expect(entity.otherNumberValue).toStrictEqual(50);
		expect(subscriber).toHaveBeenNthCalledWith(2, { otherNumberValue: new Change(-100, 50) });
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should catch when ChangeDispatcher is not set', () => {
		const entity = new EntityWithoutChangeDispatcher();
		entity.numberValue = 100;
		expect(entity.numberValue).toStrictEqual(100);
	});
});
