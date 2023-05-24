import { Change } from '../internals/Change';
import { dispatchChanges } from '../internals/ChangeDispatcher';

export interface ClampOptions<
	Key extends string,
	KeyMin extends string = `${Key}Min`,
	KeyMax extends string = `${Key}Max`,
	KeyTarget extends string = `${Key}Target`,
> {
	name: Key;
	min?: KeyMin;
	max?: KeyMax;
	target?: KeyTarget;
}

export type ClampDecorated<
	Key extends string,
	KeyMin extends string = `${Key}Min`,
	KeyMax extends string = `${Key}Max`,
	KeyTarget extends string = `${Key}Target`,
> = {
	[key in Key | KeyMin | KeyMax | KeyTarget]: number;
};

type ClampDecoratedInt<KeyInt extends string | symbol> = {
	[key in KeyInt]: number;
};

export const Clamp = <
	Key extends string,
	KeyMin extends string = `${Key}Min`,
	KeyMax extends string = `${Key}Max`,
	KeyTarget extends string = `${Key}Target`,
>(
	options: ClampOptions<Key, KeyMin, KeyMax, KeyTarget>,
) => {
	const name = options.name;
	const min = options.min ?? (`${options.name}Min` as KeyMin);
	const max = options.max ?? (`${options.name}Max` as KeyMax);
	const target = options.target ?? (`${options.name}Target` as KeyTarget);

	return function <KeyInt extends string | symbol = `__${Key}__`>(
		objOrCls: ClampDecorated<Key, KeyMin, KeyMax, KeyTarget extends '' ? never : KeyTarget>,
		propertyKey: KeyInt,
	) {
		Object.defineProperties(objOrCls, {
			[name]: {
				get: function (this: ClampDecorated<Key, KeyMin, KeyMax, KeyTarget> & ClampDecoratedInt<KeyInt>): number {
					return this[propertyKey];
				},
				set: function (this: ClampDecorated<Key, KeyMin, KeyMax, KeyTarget> & ClampDecoratedInt<KeyInt>, value: number) {
					if (isNaN(value)) value = 0;
					value = Math.max(Math.min(Math.floor(value), this[max]), this[min]);
					if (this[propertyKey] !== value) {
						const valueOld = this[propertyKey];
						Reflect.set(this, propertyKey, value);
						if (target && this[target] < this[propertyKey]) {
							const valueTargetOld = this[target];
							Reflect.set(this, target, this[propertyKey]);
							dispatchChanges<object>(this, {
								[name]: new Change(valueOld, this[propertyKey]),
								[target]: new Change(valueTargetOld, this[target]),
							});
						} else {
							dispatchChanges<object>(this, {
								[name]: new Change(valueOld, this[propertyKey]),
							});
						}
					}
				},
			},
		});
	};
};
