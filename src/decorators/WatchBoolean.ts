import { dispatchChange } from '../internals/ChangeDispatcher';

export interface WatchBooleanOptions<Key extends string> {
	name: Key;
}

export type WatchBooleanDecorated<Key extends string, KeyInt extends string | symbol = `__${Key}__`> = {
	[key in Key | KeyInt]: boolean;
};

export const WatchBoolean = <Key extends string>(options: WatchBooleanOptions<Key>) => {
	const name = options.name;

	return function <KeyInt extends string | symbol>(objOrCls: WatchBooleanDecorated<Key, KeyInt>, propertyKey: KeyInt) {
		Object.defineProperties(objOrCls, {
			[name]: {
				get: function (this: typeof objOrCls): boolean {
					return this[propertyKey];
				},
				set: function (this: typeof objOrCls, value: boolean) {
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
