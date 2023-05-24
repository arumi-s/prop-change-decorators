# Prop Change Decorators

[![NPM](https://img.shields.io/npm/v/prop-change-decorators)](https://www.npmjs.com/package/prop-change-decorators)
![License](https://img.shields.io/npm/l/prop-change-decorators)

## Install

```bash
npm install prop-change-decorators
```

### Install peer dependencies

```bash
npm install rxjs@7
```

## Usage

```typescript
import { Dispatcher, Clamp, ClampTarget } from 'prop-change-decorators';

class Entity {
	@Dispatcher()
	change$: ChangeDispatcher<Entity>;

	@Clamp({ name: 'numberValue' })
	private __numberValue__ = 5;
	numberValue: number;
	numberValueMin: number = 0;
	numberValueMax: number = 10;

	@ClampTarget({ name: 'numberValue' })
	private __numberValueTarget__: number = 8;
	numberValueTarget: number;
}
```
