import { WatchBoolean } from './WatchBoolean';
import { Dispatcher } from './Dispatcher';
import { Change } from '../internals/Change';
import { ChangeDispatcher } from '../internals/ChangeDispatcher';

class Entity {
	@Dispatcher()
	change$: ChangeDispatcher<Entity>;

	@WatchBoolean({ name: 'boolValue' })
	__boolValue__ = false;
	boolValue: boolean;
}

class EntityWithoutChangeDispatcher {
	@WatchBoolean({ name: 'boolValue' })
	__boolValue__ = false;
	boolValue: boolean;
}

describe('@WatchBoolean', () => {
	let entity: Entity;

	beforeEach(() => {
		entity = new Entity();
	});

	it('should provide prop accessor', () => {
		expect(entity.boolValue).toStrictEqual(false);
		entity.boolValue = true;
		expect(entity.boolValue).toStrictEqual(true);
		entity.boolValue = false;
		expect(entity.boolValue).toStrictEqual(false);
	});

	it('should watch prop change', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.boolValue).toStrictEqual(false);

		entity.boolValue = true;
		expect(entity.boolValue).toStrictEqual(true);
		expect(subscriber).toHaveBeenNthCalledWith(1, { boolValue: new Change(false, true) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.boolValue = false;
		expect(entity.boolValue).toStrictEqual(false);
		expect(subscriber).toHaveBeenNthCalledWith(2, { boolValue: new Change(true, false) });
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should not fire when prop value is the same', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.boolValue).toStrictEqual(false);

		entity.boolValue = false;
		expect(entity.boolValue).toStrictEqual(false);

		expect(subscriber).toHaveBeenCalledTimes(0);

		entity.boolValue = true;
		expect(entity.boolValue).toStrictEqual(true);
		expect(subscriber).toHaveBeenNthCalledWith(1, { boolValue: new Change(false, true) });
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	it('should cast value to boolean', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.boolValue).toStrictEqual(false);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.boolValue = 1 as any;
		expect(entity.boolValue).toStrictEqual(true);
		expect(subscriber).toHaveBeenNthCalledWith(1, { boolValue: new Change(false, true) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.boolValue = '' as any;
		expect(entity.boolValue).toStrictEqual(false);
		expect(subscriber).toHaveBeenNthCalledWith(2, { boolValue: new Change(true, false) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.boolValue = null as any;
		expect(entity.boolValue).toStrictEqual(false);
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should catch when ChangeDispatcher is not set', () => {
		const entity = new EntityWithoutChangeDispatcher();
		entity.boolValue = true;
		expect(entity.boolValue).toStrictEqual(true);
	});
});
