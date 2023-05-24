import { dispatchChange } from '../internals/ChangeDispatcher';

export interface WatchBooleanOptions<Key extends string> {
	name: Key;
}

export type WatchBooleanDecorated<Key extends string> = {
	[key in Key]: boolean;
};

type WatchBooleanDecoratedInt<KeyInt extends string | symbol> = {
	[key in KeyInt]: boolean;
};

export const WatchBoolean = <Key extends string>(options: WatchBooleanOptions<Key>) => {
	const name = options.name;

	return function <KeyInt extends string | symbol = `__${Key}__`>(objOrCls: WatchBooleanDecorated<Key>, propertyKey: KeyInt) {
		Object.defineProperties(objOrCls, {
			[name]: {
				get: function (this: WatchBooleanDecorated<Key> & WatchBooleanDecoratedInt<KeyInt>): boolean {
					return this[propertyKey];
				},
				set: function (this: WatchBooleanDecorated<Key> & WatchBooleanDecoratedInt<KeyInt>, value: boolean) {
					value = Boolean(value);
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
