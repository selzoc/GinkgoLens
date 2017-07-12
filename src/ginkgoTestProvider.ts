'use strict';

import * as vscode from 'vscode';

export enum GinkgoTestKind {
	Describe = 0,
	It = 1
}

/**
 * Searches the given document for test of type testKind
 * @param doc document to search for functions
 * @param testKind type of tests to search for
 */
export function getTestFunctions(doc: vscode.TextDocument, testKind: GinkgoTestKind): Thenable<vscode.SymbolInformation[]> {
	const docText = doc.getText();

	const testIndices = getTestIndices(docText, testKind);
	const testTitles = testIndices.map(i => getTestTitle(docText, testKind, i));

	const testSymbols: vscode.SymbolInformation[] = [];
	for (var i in testIndices) {
		const pos = doc.positionAt(testIndices[i]);
		const loc = new vscode.Location(doc.uri, pos);

		testSymbols.push(
			new vscode.SymbolInformation(
				testTitles[i],
				vscode.SymbolKind.Function,
				"Ginkgo test file",
				loc
			)
		)
	}

	return Promise.resolve(testSymbols);
}

function getTestTitle(docText: string, testKind: GinkgoTestKind, index: number): string {
	let startQuote = index + 4;
	if (testKind === GinkgoTestKind.Describe) {
		startQuote += 6;
	}

	const endQuote = docText.indexOf('"', startQuote);

	return docText.substring(startQuote, endQuote);
}

function getTestIndices(docText: string, testKind: GinkgoTestKind): number[] {
	let testString = "It(";
	if (testKind === GinkgoTestKind.Describe) {
		testString = "Describe(";
	}

	const indices = [];

	let i = 0;
	while (i !== -1) {
		const loc = docText.indexOf(testString, i)
		if (loc == -1) {
			break;
		}

		indices.push(loc);
		i = loc + 1;
	}

	return indices;
}