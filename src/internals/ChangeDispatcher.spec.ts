import { Subject } from 'rxjs';
import { Change, Changes } from './Change';
import { getChangeDispatcher, hasKeys } from './ChangeDispatcher';

class Entity {
	value: number;
	text: string;
	other: string;
	array: string[];
}

describe('getChangeDispatcher', () => {
	it('should return undefined when first called for an object instance', () => {
		const entity = new Entity();
		const dispatcher = getChangeDispatcher(entity);

		expect(dispatcher).toBeUndefined();
	});

	it('should create a ChangeDispatcher when first called for an object instance with createIfNotExist = true', () => {
		const entity = new Entity();
		const dispatcher = getChangeDispatcher(entity, true);

		expect(dispatcher).toBeInstanceOf(Subject);
	});
});

describe('hasKeys', () => {
	it('should return true when any of the provided keys are in the object', () => {
		const changes: Changes<Entity> = {
			value: new Change(1, 2),
			text: new Change('aa', 'bb'),
			array: [new Change('aa', 'bb')],
		};

		expect(hasKeys(changes, 'value')).toStrictEqual(true);
		expect(hasKeys(changes, 'text')).toStrictEqual(true);
		expect(hasKeys(changes, 'array')).toStrictEqual(true);
		expect(hasKeys(changes, 'other', 'text')).toStrictEqual(true);
	});

	it('should return false when none of the provided keys are in the object', () => {
		const changes: Changes<Entity> = {
			value: new Change(1, 2),
			text: new Change('aa', 'bb'),
		};

		expect(hasKeys(changes, 'other')).toStrictEqual(false);
		expect(hasKeys(changes, undefined as unknown as string)).toStrictEqual(false);
		expect(hasKeys(changes, 'other', 'array')).toStrictEqual(false);
	});
});
