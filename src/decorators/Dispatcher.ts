import { ChangeDispatcher, getChangeDispatcher } from '../internals/ChangeDispatcher';

export type DispatcherDecorated<Key extends string | symbol, Obj = object> = {
	[key in Key]: ChangeDispatcher<Obj>;
};

export const Dispatcher = () => {
	return function <Key extends string | symbol>(objOrCls: DispatcherDecorated<Key>, propertyKey: Key) {
		Object.defineProperties(objOrCls, {
			[propertyKey]: {
				get: function (this: typeof objOrCls) {
					return getChangeDispatcher(this, true);
				},
			},
		});
	};
};
