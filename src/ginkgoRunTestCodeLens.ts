'use strict';

import * as vscode from 'vscode';

import { CodeLensProvider, TextDocument, CancellationToken, CodeLens, Command } from 'vscode';
import { GinkgoTestKind, getTestFunctions, getTestFunctionsViaGinkgo } from './ginkgoTestProvider';

export class GinkgoRunTestCodeLensProvider implements CodeLensProvider {
    public provideCodeLenses(document: TextDocument, token: CancellationToken): Thenable<CodeLens[]> {
        const ginkgoConfig = vscode.workspace.getConfiguration('ginkgolens');

        return Promise.all([
            this.getCodeLensesForFile(document),
            this.getCodeLensesForDescribes(document),
            this.getCodeLensesForIts(document)
        ]).then(res => {
            let codeLenses: CodeLens[] = [];

            if (ginkgoConfig.get<boolean>('includeFile'))
                codeLenses = codeLenses.concat(res[0]);
            // if (ginkgoConfig.get<boolean>('includeDescribes'))
            //     codeLenses = codeLenses.concat(res[1]);
            if (ginkgoConfig.get<boolean>('includeIts'))
                codeLenses = codeLenses.concat(res[2]);

            return codeLenses;
        });
    }

    private getCodeLensesForFile(document: TextDocument): Thenable<CodeLens[]> {
        const topOfFile = new vscode.Range(0, 0, 0, 0);

        return Promise.resolve([
            new CodeLens(
                topOfFile,
                {
                    title: 'run file tests using ginkgo',
                    command: 'ginkgo.test.file'
                }
            )
        ]);
    }

    private getCodeLensesForDescribes(document: TextDocument): Thenable<CodeLens[]> {
        return this.getCodeLenesesForGinkgoTestKind(document, GinkgoTestKind.Describe);
    }

    private getCodeLensesForIts(document: TextDocument): Thenable<CodeLens[]> {
        return this.getCodeLenesesForGinkgoTestKind(document, GinkgoTestKind.It);
    }

    private getCodeLenesesForGinkgoTestKind(document: TextDocument, testKind: GinkgoTestKind): Thenable<CodeLens[]> {
        // return getTestFunctions(document, testKind)
        return getTestFunctionsViaGinkgo(document, testKind)
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