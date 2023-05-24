import { dispatchChange } from '../internals/ChangeDispatcher';

export interface WatchNumberOptions<Key extends string> {
	name: Key;
}

export type WatchNumberDecorated<Key extends string> = {
	[key in Key]: number;
};

type WatchNumberDecoratedInt<KeyInt extends string | symbol> = {
	[key in KeyInt]: number;
};

export const WatchNumber = <Key extends string>(options: WatchNumberOptions<Key>) => {
	const name = options.name;

	return function <KeyInt extends string | symbol>(objOrCls: WatchNumberDecorated<Key>, propertyKey: KeyInt) {
		Object.defineProperties(objOrCls, {
			[name]: {
				get: function (this: WatchNumberDecorated<Key> & WatchNumberDecoratedInt<KeyInt>): number {
					return this[propertyKey];
				},
				set: function (this: WatchNumberDecorated<Key> & WatchNumberDecoratedInt<KeyInt>, value: number) {
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
