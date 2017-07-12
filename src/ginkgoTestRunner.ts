'use strict';

import * as vscode from 'vscode';

import cp = require('child_process');
import fs = require('fs');
import path = require('path');

const ginkgoTestOutput = vscode.window.createOutputChannel('Ginkgo');

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
		const args = [].concat(gingkoArgs);

		const ginkgooRuntimePath = getGinkgoPath();
		if (!ginkgooRuntimePath) {
			vscode.window.showErrorMessage('Not able to find "ginkgo" binary in GOPATH');
			reject('ginkgo binary not found');
			return;
		}

		if (focus) {
			args.push(`-focus="${focus}"`);
		}

		ginkgoTestOutput.clear();
		ginkgoTestOutput.show(true);

		const spawnedGinkgo = cp.spawn(ginkgooRuntimePath, args, { cwd: dir, shell: true });

		spawnedGinkgo.on('error', err => reject(err));
		spawnedGinkgo.stdout.on('data', chunk => ginkgoTestOutput.append(chunk.toString()));
		spawnedGinkgo.stderr.on('data', chunk => ginkgoTestOutput.append(chunk.toString()));
		spawnedGinkgo.on('close', () => resolve());
	});
}

export function getGinkgoPath(): string {
	const defaultPath = path.join(process.env['GOPATH'], 'bin', 'ginkgo');

	if (fs.existsSync(defaultPath)) {
		return defaultPath;
	}

	return null;
}
