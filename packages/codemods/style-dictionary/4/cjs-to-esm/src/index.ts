import type { namedTypes } from "ast-types";
import type { API, Collection, FileInfo, JSCodeshift } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection = j(file.source);
  let dirtyFlag = false;

  // Find all variable declarations
  root.find(j.VariableDeclaration).forEach((path) => {
    const declaration = path.node
      .declarations[0] as namedTypes.VariableDeclaration;
    if (
      j.CallExpression.check(declaration.init) &&
      j.Identifier.check(declaration.init.callee) &&
      (declaration.init.callee as namedTypes.Identifier).name === "require"
    ) {
      const moduleName = (declaration.init as namedTypes.CallExpression)
        .arguments[0] as namedTypes.Literal;
      if (j.Literal.check(moduleName) && typeof moduleName.value === "string") {
        // Replace with import statement
        const importDeclaration: namedTypes.ImportDeclaration =
          j.importDeclaration(
            [j.importDefaultSpecifier(declaration.id)],
            j.literal(moduleName.value),
          );
        j(path).replaceWith(importDeclaration);
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
