'use strict';

import * as vscode from 'vscode';

import { getTestSpecs } from './ginkgoSpecProvider';

export class GinkgoRunTestCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.CodeLens[]> {
        const ginkgoConfig = vscode.workspace.getConfiguration('ginkgolens');

        return Promise.all([
            this.getCodeLensesForFile(document),
            this.getCodeLensesForIts(document)
        ]).then(res => {
            const codeLenses: vscode.CodeLens[] = [];

            if (ginkgoConfig.get<boolean>('includeFile'))
                codeLenses.push(...res[0])
            if (ginkgoConfig.get<boolean>('includeIts'))
                codeLenses.push(...res[1]);

            return codeLenses;
        });
    }

    private getCodeLensesForFile(document: vscode.TextDocument): Thenable<vscode.CodeLens[]> {
        if (document.fileName.endsWith('_suite_test.go')) {
            return Promise.resolve([]);
        }

        return Promise.resolve([
            new vscode.CodeLens(
                new vscode.Range(0, 0, 0, 0),
                {
                    title: 'run file tests with ginkgo',
                    command: 'ginkgo.test.file',
                    arguments: [{ path: document.uri.fsPath }]
                }
            )
        ]);
    }

    private getCodeLensesForIts(document: vscode.TextDocument): Thenable<vscode.CodeLens[]> {
        return getTestSpecs(document)
            .then(testSpecs =>
                testSpecs.map(spec =>
                    new vscode.CodeLens(
                        spec.location.range,
                        {
                            title: 'run test',
                            command: 'ginkgo.test.focus',
                            arguments: [{ testFocus: spec.fullSpecString }]
                        }
                    )
                )
            );
    }
}