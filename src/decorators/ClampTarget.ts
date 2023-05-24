import { Change } from '../internals/Change';
import { dispatchChanges } from '../internals/ChangeDispatcher';

export interface ClampTargetOptions<
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

export type ClampTargetDecorated<
	Key extends string,
	KeyMin extends string = `${Key}Min`,
	KeyMax extends string = `${Key}Max`,
	KeyTarget extends string = `${Key}Target`,
> = {
	[key in Key | KeyMin | KeyMax | KeyTarget]: number;
};

type ClampTargetDecoratedInt<KeyInt extends string | symbol> = {
	[key in KeyInt]: number;
};

export const ClampTarget = <
	Key extends string,
	KeyMin extends string = `${Key}Min`,
	KeyMax extends string = `${Key}Max`,
	KeyTarget extends string = `${Key}Target`,
>(
	options: ClampTargetOptions<Key, KeyMin, KeyMax, KeyTarget>,
) => {
	const name = options.name;
	const min = options.min ?? (`${options.name}Min` as KeyMin);
	const max = options.max ?? (`${options.name}Max` as KeyMax);
	const target = options.target ?? (`${options.name}Target` as KeyTarget);

	return function <KeyInt extends string | symbol = `__${Key}__`>(
		objOrCls: ClampTargetDecorated<Key, KeyMin, KeyMax, KeyTarget>,
		propertyKey: KeyInt,
	) {
		Object.defineProperties(objOrCls, {
			[target]: {
				get: function (this: ClampTargetDecorated<Key, KeyMin, KeyMax, KeyTarget> & ClampTargetDecoratedInt<KeyInt>): number {
					return this[propertyKey];
				},
				set: function (this: ClampTargetDecorated<Key, KeyMin, KeyMax, KeyTarget> & ClampTargetDecoratedInt<KeyInt>, valueTarget: number) {
					if (isNaN(valueTarget)) valueTarget = 0;
					valueTarget = Math.max(Math.min(Math.floor(valueTarget), this[max]), this[name], this[min]);
					if (this[propertyKey] !== valueTarget) {
						const valueTargetOld = this[propertyKey];
						Reflect.set(this, propertyKey, valueTarget);
						dispatchChanges<object>(this, { [target]: new Change(valueTargetOld, this[propertyKey]) });
					}
				},
			},
		});
	};
};
