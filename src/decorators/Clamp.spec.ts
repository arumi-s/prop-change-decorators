import { Clamp } from './Clamp';
import { Dispatcher } from './Dispatcher';
import { Change } from '../internals/Change';
import { ChangeDispatcher } from '../internals/ChangeDispatcher';

class Entity {
	@Dispatcher()
	readonly change$: ChangeDispatcher<Entity>;

	@Clamp({ name: 'numberValue' })
	private __numberValue__ = 0;
	numberValue: number;
	numberValueMin: number = 0;
	numberValueMax: number = 10;
	numberValueTarget: number = 8;

	@Clamp({ name: 'otherNumberValue' })
	private __otherNumberValue__ = 1;
	otherNumberValue: number;
	otherNumberValueMin: number = 0;
	otherNumberValueMax: number = 100;
	otherNumberValueTarget: number = 20;

	@Clamp({ name: 'noTargetNumberValue', target: '' })
	private __noTargetNumberValue__ = 3;
	noTargetNumberValue: number;
	noTargetNumberValueMin: number = 0;
	noTargetNumberValueMax: number = 5;

	@Clamp({ name: 'custom', min: 'lower', max: 'upper', target: 'goal' })
	private _custom = -2;
	custom: number;
	lower: number = -10;
	upper: number = 10;
	goal: number = 5;
}

describe('@Clamp', () => {
	let entity: Entity;

	beforeEach(() => {
		entity = new Entity();
	});

	it('should provide prop accessor', () => {
		expect(entity.numberValue).toStrictEqual(0);
		entity.numberValue = 5;
		expect(entity.numberValue).toStrictEqual(5);
		entity.numberValue = Number.MAX_SAFE_INTEGER;
		expect(entity.numberValue).toStrictEqual(10);
	});

	it('should watch prop change', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);

		entity.numberValue = 5;
		expect(entity.numberValue).toStrictEqual(5);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 5) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.numberValue = 8;
		expect(entity.numberValue).toStrictEqual(8);
		expect(subscriber).toHaveBeenNthCalledWith(2, { numberValue: new Change(5, 8) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		entity.numberValue = 8;
		expect(entity.numberValue).toStrictEqual(8);
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
		expect(entity.numberValue).toStrictEqual(10);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 10), numberValueTarget: new Change(8, 10) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.numberValue = 100;
		expect(entity.numberValue).toStrictEqual(10);
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	it('should cast value to number, NaN become 0', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = '2.234' as any;
		expect(entity.numberValue).toStrictEqual(2);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 2) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = 'x' as any;
		expect(entity.numberValue).toStrictEqual(0);
		expect(subscriber).toHaveBeenNthCalledWith(2, { numberValue: new Change(2, 0) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValue = '0' as any;
		expect(entity.numberValue).toStrictEqual(0);
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should handle props without target', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.noTargetNumberValue).toStrictEqual(3);

		entity.noTargetNumberValue = 4;
		expect(entity.noTargetNumberValue).toStrictEqual(4);
		expect(subscriber).toHaveBeenNthCalledWith(1, { noTargetNumberValue: new Change(3, 4) });
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	it('should handle props with custom min, max, target prop name', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.custom).toStrictEqual(-2);
		expect(entity.goal).toStrictEqual(5);

		entity.custom = -4;
		expect(entity.custom).toStrictEqual(-4);
		expect(entity.goal).toStrictEqual(5);
		expect(subscriber).toHaveBeenNthCalledWith(1, { custom: new Change(-2, -4) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.custom = -20;
		expect(entity.custom).toStrictEqual(-10);
		expect(entity.goal).toStrictEqual(5);
		expect(subscriber).toHaveBeenNthCalledWith(2, { custom: new Change(-4, -10) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		entity.custom = 12;
		expect(entity.custom).toStrictEqual(10);
		expect(entity.goal).toStrictEqual(10);
		expect(subscriber).toHaveBeenNthCalledWith(3, { custom: new Change(-10, 10), goal: new Change(5, 10) });
		expect(subscriber).toHaveBeenCalledTimes(3);
	});

	it('should handle multiple props', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(0);
		expect(entity.otherNumberValue).toStrictEqual(1);

		entity.numberValue = 9;
		expect(entity.numberValue).toStrictEqual(9);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValue: new Change(0, 9), numberValueTarget: new Change(8, 9) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.otherNumberValue = 50;
		expect(entity.otherNumberValue).toStrictEqual(50);
		expect(subscriber).toHaveBeenNthCalledWith(2, { otherNumberValue: new Change(1, 50), otherNumberValueTarget: new Change(20, 50) });
		expect(subscriber).toHaveBeenCalledTimes(2);
	});
});
