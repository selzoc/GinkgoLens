'use strict';

import * as vscode from 'vscode';

import cp = require('child_process');
import path = require('path');
import { getTestFunctions } from './ginkgoTestProvider';

let ginkgoTestOutput = vscode.window.createOutputChannel('Ginkgo');

/**
 * Runs ginkgo against the current file
 * @param ginkgoLensConfig ginkgolens vscode config section
 * @param args args passed to the invocation of the command
 */
export function runGinkgoTestsForFile(ginkgoLensConfig: vscode.WorkspaceConfiguration, args: any) {
	return runGinkgoTest(ginkgoLensConfig);
}

/**
 * Runs ginkgo against the specified test
 * @param ginkgoLensConfig ginkgolens vscode config section
 * @param args args passed to the invocation of the command
 */
export function runFocusedGinkgoTest(ginkgoLensConfig: vscode.WorkspaceConfiguration, args: any) {
	if (args && args.testFocus) {
		return runGinkgoTest(ginkgoLensConfig, args.testFocus);
	} else {
		vscode.window.showInformationMessage('No test function found at cursor.');
		return;
	}
}

function runGinkgoTest(ginkgoLensConfig: vscode.WorkspaceConfiguration, testFocus?: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor.document.isDirty) {
		vscode.window.showWarningMessage('File has unsaved changes, please save and try again.');
		return;
	}

	return ginkgoTest(ginkgoLensConfig, path.dirname(editor.document.fileName), testFocus);
}

function ginkgoTest(ginkgoLensConfig: vscode.WorkspaceConfiguration, dir: string, focus?: string) {
	return new Promise((resolve, reject) => {
		const gingkoArgs = ginkgoLensConfig.get<string[]>('ginkgoArgs');
		let args = [].concat(gingkoArgs);

		let ginkgooRuntimePath = getGinkgoPath();
		if (!ginkgooRuntimePath) {
			vscode.window.showErrorMessage('Not able to find "ginkgo" binary. Update GOROOT, GOPATH, or PATH environment variables.');
			reject('ginkgo binary not found');
		}

		if (focus) {
			args.push(`-focus="${focus}"`);
		}

		ginkgoTestOutput.clear();
		ginkgoTestOutput.show(true);

		let proc = cp.spawn(ginkgooRuntimePath, args, { cwd: dir, shell: true });
		proc.stdout.on('data', chunk => ginkgoTestOutput.append(chunk.toString()));
		proc.stderr.on('data', chunk => ginkgoTestOutput.append(chunk.toString()));
		proc.on('close', () => resolve());
		proc.on('error', err => reject(err));
	});
}

function getGinkgoPath(): string {
	return path.join(process.env['GOPATH'], 'bin', 'ginkgo');
}
