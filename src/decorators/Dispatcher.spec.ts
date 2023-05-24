import { Dispatcher } from './Dispatcher';
import { Subject } from 'rxjs/internal/Subject';
import { ChangeDispatcher } from '../internals/ChangeDispatcher';

class Entity {
	@Dispatcher()
	change$: ChangeDispatcher<Entity>;
}

describe('@ChangeDispatcher', () => {
	it('should provide a change dispatcher', () => {
		const entity = new Entity();

		expect(entity.change$).toBeInstanceOf(Subject);
	});
});
