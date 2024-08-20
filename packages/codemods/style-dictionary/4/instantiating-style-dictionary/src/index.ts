import type { API, Collection, FileInfo, JSCodeshift } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection = j(file.source);
  let dirtyFlag = false;

  // Replace require statement with import statement
  root.find(j.VariableDeclaration).forEach((path) => {
    const declaration = path.value.declarations[0];
    if (
      j.CallExpression.check(declaration.init) &&
      j.Identifier.check(declaration.init.callee) &&
      declaration.init.callee.name === "require" &&
      j.Literal.check(declaration.init.arguments[0]) &&
      declaration.init.arguments[0].value === "style-dictionary"
    ) {
      const importDeclaration = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(declaration.id.name))],
        j.literal("style-dictionary"),
      );
      j(path).replaceWith(importDeclaration);
      dirtyFlag = true;
    }
  });

  // Replace StyleDictionary.extend with new StyleDictionary
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "StyleDictionary" },
        property: { name: "extend" },
      },
    })
    .forEach((path) => {
      const newExpression = j.newExpression(
        j.identifier("StyleDictionary"),
        path.value.arguments,
      );
      j(path).replaceWith(newExpression);
      dirtyFlag = true;
    });

  // Add await sd.hasInitialized
  root.find(j.VariableDeclarator, { id: { name: "sd" } }).forEach((path) => {
    const variableDeclaration = path.parentPath.value;
    const awaitExpression = j.expressionStatement(
      j.awaitExpression(
        j.memberExpression(j.identifier("sd"), j.identifier("hasInitialized")),
      ),
    );
    const parentScope = j(path).closestScope().get();
    parentScope.value.body.push(awaitExpression);
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}
