'use strict';

import * as vscode from 'vscode';

import { GinkgoRunTestCodeLensProvider } from './ginkgoRunTestCodeLens';
import { runGinkgoTestsForFile, runFocusedGinkgoTest } from './ginkgoTestRunner';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            {
                language: 'go',
                scheme: 'file',
                pattern: '**/**_test.go'
            },
            new GinkgoRunTestCodeLensProvider()
        ),
        vscode.commands.registerCommand(
            'ginkgo.test.file',
            (args) => runGinkgoTestsForFile(vscode.workspace.getConfiguration('ginkgolens'), args)
        ),
        vscode.commands.registerTextEditorCommand(
            'ginkgo.test.focus',
            (editor, edit, args) => runFocusedGinkgoTest(vscode.workspace.getConfiguration('ginkgolens'), editor, args)
        )
    );
}

export function deactivate() { }