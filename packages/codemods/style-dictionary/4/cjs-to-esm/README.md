## Example
This codemod transforms CommonJS-style require statements into ES Module import statements.

### Before

```ts
const StyleDictionary = require('style-dictionary');
```

### After

```ts
import StyleDictionary from 'style-dictionary';
```

