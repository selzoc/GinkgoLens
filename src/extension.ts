'use strict';

import * as vscode from 'vscode';

import { GinkgoRunTestCodeLensProvider } from './ginkgoRunTestCodeLens';
import { runGinkgoTestsForFile, runFocusedGinkgoTest } from './ginkgoTestRunner';

export function activate(context: vscode.ExtensionContext) {
    const goDocumentFilter: vscode.DocumentFilter = {
        language: 'go',
        scheme: 'file',
        pattern: '**/**_test.go'
    };

    context.subscriptions.push(vscode.languages.registerCodeLensProvider(goDocumentFilter, new GinkgoRunTestCodeLensProvider()));

    context.subscriptions.push(vscode.commands.registerCommand('ginkgo.test.file', (args) => {
        const ginkgoLensConfig = vscode.workspace.getConfiguration('ginkgolens');
        runGinkgoTestsForFile(ginkgoLensConfig, args);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ginkgo.test.focus', (args) => {
        const ginkgoLensConfig = vscode.workspace.getConfiguration('ginkgolens');
        runFocusedGinkgoTest(ginkgoLensConfig, args);
    }));
}

export function deactivate() { }