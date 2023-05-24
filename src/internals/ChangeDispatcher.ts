import { Subject } from 'rxjs';
import { Change, Changes } from './Change';

export type ChangeDispatcher<T> = Subject<Changes<T>>;

const changeDispatchers = new WeakMap<object, ChangeDispatcher<object>>();

export const getChangeDispatcher = <O extends object>(obj: O, createIfNotExist = false): ChangeDispatcher<O> | undefined => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	let dispatcher: ChangeDispatcher<O> = changeDispatchers.get(obj) as any;

	if (dispatcher == null && createIfNotExist) {
		dispatcher = new Subject<Changes<O>>();
		changeDispatchers.set(obj, dispatcher as any as ChangeDispatcher<object>);
	}

	return dispatcher;
};

export const dispatchChanges = <O extends object>(obj: O, changes: Changes<O>) => {
	const dispatcher = getChangeDispatcher(obj);
	if (dispatcher) {
		dispatcher.next(changes);
	}
};

export const dispatchChange = <Key extends string, Value>(obj: object, key: Key, oldValue: Value, newValue: Value) => {
	const dispatcher = getChangeDispatcher(obj);
	if (dispatcher) {
		dispatcher.next({ [key]: new Change(oldValue, newValue) });
	}
};

export const hasKeys = <O>(changes: Changes<O>, ...keys: (keyof O)[]) => {
	return keys.some((key) => Object.prototype.hasOwnProperty.call(changes, key));
};
