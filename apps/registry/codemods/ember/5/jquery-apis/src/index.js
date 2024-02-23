/*! @license
This code is based on a public codemod, which is subject to the original license terms.
Original codemod: https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/jquery-apis/index.js

MIT License

Copyright (c) 2019 ember-codemods

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

License URL: https://github.com/ember-codemods/ember-no-implicit-this-codemod/blob/master/LICENSE
 */

export default function transform(file, api) {
	const j = api.jscodeshift;

	const root = j(file.source);

	root
		.find(j.CallExpression, {
			callee: {
				object: {
					callee: {
						object: {
							type: "ThisExpression",
						},
						property: {
							name: "$",
						},
					},
				},
			},
		})
		.forEach(() => {
			//console.log(path);
		})
		.replaceWith((path) => {
			//callee.object.arguments
			//console.log(path.value.callee.object.arguments);
			const isQuerySelector = path.value.callee.object.arguments.length > 0;
			//console.log(isQuerySelector);
			let newCallExp;
			if (isQuerySelector) {
				newCallExp = j.callExpression(
					j.memberExpression(
						j.callExpression(
							j.memberExpression(
								j.memberExpression(
									j.thisExpression(),
									j.identifier("element"),
									false,
								),
								j.identifier("querySelectorAll"),
							),
							path.value.callee.object.arguments,
						),
						j.identifier("forEach"),
						false,
					),
					[
						j.arrowFunctionExpression(
							[j.identifier("el")],
							j.callExpression(
								j.memberExpression(
									j.identifier("el"),
									j.identifier("addEventListener"),
									false,
								),
								path.value.arguments,
							),
							false,
						),
					],
				);
			} else {
				newCallExp = j.callExpression(
					j.memberExpression(
						j.memberExpression(
							j.thisExpression(),
							j.identifier("element"),
							false,
						),
						j.identifier("addEventListener"),
						false,
					),
					path.value.arguments,
				);
			}
			return newCallExp;
		});

	return root.toSource();
}
