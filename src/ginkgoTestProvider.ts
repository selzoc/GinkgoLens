'use strict';

import * as vscode from 'vscode';

import cp = require('child_process');
import path = require('path')
import { getGinkgoPath } from './ginkgoTestRunner'

export enum GinkgoTestKind {
	Describe = 0,
	It = 1
}

interface Spec {
	ConcatenatedString: string;
	Location: vscode.Location;
}

export function getTestFunctionsViaGinkgo(doc: vscode.TextDocument, testKind: GinkgoTestKind): Thenable<vscode.SymbolInformation[]> {
	return new Promise((resolve, reject) => {
		const ginkgooRuntimePath = getGinkgoPath();
		if (!ginkgooRuntimePath) {
			vscode.window.showErrorMessage('Not able to find "ginkgo" binary in GOPATH');
			reject();
			return;
		}

		const dir = path.dirname(doc.fileName);
		const spawnedGinkgoOutput = cp.spawnSync(
			ginkgooRuntimePath,
			["-noColor", "-dryRun", "-v"],
			{ cwd: dir, shell: true }
		);
		const specs = getSpecsFromLines(spawnedGinkgoOutput.stdout.toString().split("\n"), doc);
doc.lineAt(0).firstNonWhitespaceCharacterIndex
		resolve(specs.map(s =>
			new vscode.SymbolInformation(
				s.ConcatenatedString,
				vscode.SymbolKind.Function,
				"Ginkgo test file",
				s.Location
			)));
	});
}

function getSpecsFromLines(lines: string[], doc: vscode.TextDocument): Spec[] {
	const testIndices = getTestIndices(doc.getText(), GinkgoTestKind.It);
	const specs: Spec[] = [];
	for (let i = 5; i < (lines.length - 7); i += 5) {
		const prefix = lines[i].trim();
		const subject = lines[i + 1].trim();
		const pos = doc.positionAt(testIndices[(i-5)/5]);

		specs.push({
			ConcatenatedString: `${prefix} ${subject}`,
			Location: new vscode.Location(doc.uri, pos)
		});
	}

	return specs;
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