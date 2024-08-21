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