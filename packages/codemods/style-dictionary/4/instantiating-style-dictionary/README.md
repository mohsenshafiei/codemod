This codemod converts Style Dictionary usage from a regular JavaScript object to an instantiable class.

## Example

### Before

```ts
const StyleDictionary = require('style-dictionary');

const sd = StyleDictionary.extend('config.json');
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary('config.json');
await sd.hasInitialized;
```

