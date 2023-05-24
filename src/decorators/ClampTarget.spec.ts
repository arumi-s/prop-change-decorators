import { Clamp } from './Clamp';
import { ClampTarget } from './ClampTarget';
import { Dispatcher } from './Dispatcher';
import { Change } from '../internals/Change';
import { ChangeDispatcher } from '../internals/ChangeDispatcher';

class Entity {
	@Dispatcher()
	change$: ChangeDispatcher<Entity>;

	@Clamp({ name: 'numberValue' })
	private __numberValue__ = 5;
	numberValue: number;
	numberValueMin: number = 0;
	numberValueMax: number = 10;

	@ClampTarget({ name: 'numberValue' })
	private __numberValueTarget__: number = 8;
	numberValueTarget: number;

	@Clamp({ name: 'otherNumberValue' })
	private __otherNumberValue__ = 15;
	otherNumberValue: number;
	otherNumberValueMin: number = 0;
	otherNumberValueMax: number = 100;

	@ClampTarget({ name: 'otherNumberValue' })
	private __otherNumberValueTarget__: number = 20;
	otherNumberValueTarget: number;

	@Clamp({ name: 'custom', min: 'lower', max: 'upper', target: 'goal' })
	private _custom = -2;
	custom: number;
	lower: number = -10;
	upper: number = 10;

	@ClampTarget({ name: 'custom', min: 'lower', max: 'upper', target: 'goal' })
	private _goal: number = 5;
	goal: number;
}

describe('@ClampTarget', () => {
	let entity: Entity;

	beforeEach(() => {
		entity = new Entity();
	});

	it('should provide prop accessor', () => {
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(8);

		entity.numberValueTarget = 5;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(5);

		entity.numberValueTarget = 4;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(5);

		entity.numberValueTarget = Number.MAX_SAFE_INTEGER;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(10);
	});

	it('should watch prop change', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(8);

		entity.numberValueTarget = 6;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(6);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValueTarget: new Change(8, 6) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.numberValueTarget = 3;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(5);
		expect(subscriber).toHaveBeenNthCalledWith(2, { numberValueTarget: new Change(6, 5) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		entity.numberValueTarget = 3;
		expect(entity.numberValueTarget).toStrictEqual(5);
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should not fire when prop value is the same', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(8);

		entity.numberValueTarget = 8;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(8);

		expect(subscriber).toHaveBeenCalledTimes(0);

		entity.numberValueTarget = 10;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(10);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValueTarget: new Change(8, 10) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.numberValueTarget = 100;
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(10);
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	it('should cast value to number, NaN become 0', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValueTarget).toStrictEqual(8);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValueTarget = '6.234' as any;
		expect(entity.numberValueTarget).toStrictEqual(6);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValueTarget: new Change(8, 6) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValueTarget = 'x' as any;
		expect(entity.numberValueTarget).toStrictEqual(5);
		expect(subscriber).toHaveBeenNthCalledWith(2, { numberValueTarget: new Change(6, 5) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		entity.numberValueTarget = '0' as any;
		expect(entity.numberValueTarget).toStrictEqual(5);
		expect(subscriber).toHaveBeenCalledTimes(2);
	});

	it('should handle props with custom min, max, target prop name', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.custom).toStrictEqual(-2);
		expect(entity.goal).toStrictEqual(5);

		entity.goal = -4;
		expect(entity.custom).toStrictEqual(-2);
		expect(entity.goal).toStrictEqual(-2);
		expect(subscriber).toHaveBeenNthCalledWith(1, { goal: new Change(5, -2) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.goal = 0;
		expect(entity.custom).toStrictEqual(-2);
		expect(entity.goal).toStrictEqual(0);
		expect(subscriber).toHaveBeenNthCalledWith(2, { goal: new Change(-2, 0) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		entity.goal = 12;
		expect(entity.custom).toStrictEqual(-2);
		expect(entity.goal).toStrictEqual(10);
		expect(subscriber).toHaveBeenNthCalledWith(3, { goal: new Change(0, 10) });
		expect(subscriber).toHaveBeenCalledTimes(3);
	});

	it('should handle multiple props', () => {
		const subscriber = jest.fn();

		entity.change$.subscribe(subscriber);
		expect(entity.numberValue).toStrictEqual(5);
		expect(entity.numberValueTarget).toStrictEqual(8);
		expect(entity.otherNumberValue).toStrictEqual(15);
		expect(entity.otherNumberValueTarget).toStrictEqual(20);

		entity.numberValueTarget = 9;
		expect(entity.numberValueTarget).toStrictEqual(9);
		expect(subscriber).toHaveBeenNthCalledWith(1, { numberValueTarget: new Change(8, 9) });
		expect(subscriber).toHaveBeenCalledTimes(1);

		entity.otherNumberValueTarget = 50;
		expect(entity.otherNumberValueTarget).toStrictEqual(50);
		expect(subscriber).toHaveBeenNthCalledWith(2, { otherNumberValueTarget: new Change(20, 50) });
		expect(subscriber).toHaveBeenCalledTimes(2);

		entity.numberValueTarget = 2;
		expect(entity.numberValueTarget).toStrictEqual(5);
		expect(subscriber).toHaveBeenNthCalledWith(3, { numberValueTarget: new Change(9, 5) });
		expect(subscriber).toHaveBeenCalledTimes(3);

		entity.otherNumberValueTarget = 10;
		expect(entity.otherNumberValueTarget).toStrictEqual(15);
		expect(subscriber).toHaveBeenNthCalledWith(4, { otherNumberValueTarget: new Change(50, 15) });
		expect(subscriber).toHaveBeenCalledTimes(4);
	});
});
