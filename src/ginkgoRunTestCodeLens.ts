'use strict';

import * as vscode from 'vscode';

import { CodeLensProvider, TextDocument, CancellationToken, CodeLens, Command } from 'vscode';
import { getTestSpecs } from './ginkgoSpecProvider';

export class GinkgoRunTestCodeLensProvider implements CodeLensProvider {
    public provideCodeLenses(document: TextDocument, token: CancellationToken): Thenable<CodeLens[]> {
        const ginkgoConfig = vscode.workspace.getConfiguration('ginkgolens');

        return Promise.all([
            this.getCodeLensesForFile(document),
            this.getCodeLensesForIts(document)
        ]).then(res => {
            let codeLenses: CodeLens[] = [];

            if (ginkgoConfig.get<boolean>('includeFile'))
                codeLenses = codeLenses.concat(res[0])
            if (ginkgoConfig.get<boolean>('includeIts'))
                codeLenses = codeLenses.concat(res[1]);

            return codeLenses;
        });
    }

    private getCodeLensesForFile(document: TextDocument): Thenable<CodeLens[]> {
        if (document.fileName.endsWith('_suite_test.go')) {
            return Promise.resolve([]);
        }

        const topOfFile = new vscode.Range(0, 0, 0, 0);

        return Promise.resolve([
            new CodeLens(
                topOfFile,
                {
                    title: 'run file tests with ginkgo',
                    command: 'ginkgo.test.file',
                    arguments: [{ path: document.uri.fsPath }]
                }
            )
        ]);
    }

    private getCodeLensesForIts(document: TextDocument): Thenable<CodeLens[]> {
        return getTestSpecs(document)
            .then(testFunctions =>
                testFunctions.map(func =>
                    new CodeLens(
                        func.location.range,
                        {
                            title: 'run test',
                            command: 'ginkgo.test.focus',
                            arguments: [{ testFocus: func.name }]
                        }
                    )
                )
            );
    }
}