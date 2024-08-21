This codemod converts synchronous formatter functions into asynchronous format functions and ensures that specific Style Dictionary methods, cleanAllPlatforms and buildAllPlatforms, are awaited.

Detailed description
This codemod is designed to handle the transition from synchronous to asynchronous methods in the Style Dictionary API, particularly focusing on converting formatter functions to async format functions and awaiting the fileHeader call. It also ensures that cleanAllPlatforms and buildAllPlatforms method calls are correctly awaited, addressing potential issues that could arise due to the asynchronous nature of the updated API.

## Example

### Before

```ts
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: 'custom/less',
    formatter: function ({ dictionary, file, options }) {
        const { outputReferences } = options;
        return (
            fileHeader({ file }) +
            '@root {\n' +
            formattedVariables({
                format: 'less',
                dictionary,
                outputReferences,
            }) +
            '\n}\n'
        );
    },
});

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;

sd.cleanAllPlatforms();
sd.buildAllPlatforms();
```

### After

```ts
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
    name: 'custom/less',
    format: async function ({ dictionary, file, options }) {
        const { outputReferences } = options;
        return (
            (await fileHeader({ file })) +
            '@root {\n' +
            formattedVariables({
                format: 'less',
                dictionary,
                outputReferences,
            }) +
            '\n}\n'
        );
    },
});

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
```

