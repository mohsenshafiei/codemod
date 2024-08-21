import type {
  API,
  ASTPath,
  Collection,
  FileInfo,
  JSCodeshift,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection = j(file.source);
  let dirtyFlag = false;

  // Transform `formatter` function to `async format` function and await `fileHeader`
  root.find(j.ObjectExpression).forEach((path: ASTPath<j.ObjectExpression>) => {
    const properties = path.node.properties;
    properties.forEach((prop: any) => {
      if (j.Identifier.check(prop.key) && prop.key.name === "formatter") {
        prop.key.name = "format";
        if (j.FunctionExpression.check(prop.value)) {
          prop.value.async = true;
          j(prop.value.body)
            .find(j.CallExpression, {
              callee: { name: "fileHeader" },
            })
            .forEach((callPath: ASTPath<j.CallExpression>) => {
              callPath.replace(j.awaitExpression(callPath.node));
            });
          dirtyFlag = true;
        }
      }
    });
  });

  // Await `cleanAllPlatforms` and `buildAllPlatforms` calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "sd" },
        property: { name: "cleanAllPlatforms" },
      },
    })
    .forEach((path: ASTPath<j.CallExpression>) => {
      const parent = path.parent;
      if (j.ExpressionStatement.check(parent.node)) {
        parent.replace(j.expressionStatement(j.awaitExpression(path.node)));
        dirtyFlag = true;
      }
    });

  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "sd" },
        property: { name: "buildAllPlatforms" },
      },
    })
    .forEach((path: ASTPath<j.CallExpression>) => {
      const parent = path.parent;
      if (j.ExpressionStatement.check(parent.node)) {
        parent.replace(j.expressionStatement(j.awaitExpression(path.node)));
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource({ quote: "single" }) : undefined;
}
