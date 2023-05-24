import { dispatchChange } from '../internals/ChangeDispatcher';

export interface WatchNumberOptions<Key extends string> {
	name: Key;
}

export type WatchNumberDecorated<Key extends string, KeyInt extends string | symbol = `__${Key}__`> = {
	[key in Key | KeyInt]: number;
};

export const WatchNumber = <Key extends string>(options: WatchNumberOptions<Key>) => {
	const name = options.name;

	return function <KeyInt extends string | symbol>(objOrCls: WatchNumberDecorated<Key, KeyInt>, propertyKey: KeyInt) {
		Object.defineProperties(objOrCls, {
			[name]: {
				get: function (this: typeof objOrCls): number {
					return this[propertyKey];
				},
				set: function (this: typeof objOrCls, value: number) {
					value = Number(value);
					const oldValue = this[propertyKey];

					if (oldValue !== value) {
						Reflect.set(this, propertyKey, value);
						dispatchChange(this, name, oldValue, this[propertyKey]);
					}
				},
			},
		});
	};
};
