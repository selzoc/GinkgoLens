'use strict';

import * as vscode from 'vscode';

import { getTestSpecs } from './ginkgoSpecProvider';

export class GinkgoRunTestCodeLensProvider implements vscode.CodeLensProvider {
    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        const ginkgoConfig = vscode.workspace.getConfiguration('ginkgolens');
        const codeLenses: vscode.CodeLens[] = [];

        if (ginkgoConfig.get<boolean>('includeFile'))
            codeLenses.push(... await this.getCodeLensesForFile(document));

        if (ginkgoConfig.get<boolean>('includeIts'))
            codeLenses.push(... await this.getCodeLensesForIts(document));

        return codeLenses;
    }

    private async getCodeLensesForFile(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        if (document.fileName.endsWith('_suite_test.go')) {
            return [];
        }

        return [
            new vscode.CodeLens(
                new vscode.Range(0, 0, 0, 0),
                {
                    title: 'run file tests with ginkgo',
                    command: 'ginkgo.test.file',
                    arguments: [{ path: document.uri.fsPath }]
                }
            )
        ];
    }

    private async getCodeLensesForIts(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        return (await getTestSpecs(document))
            .map(spec =>
                new vscode.CodeLens(
                    spec.location.range,
                    {
                        title: 'run test',
                        command: 'ginkgo.test.focus',
                        arguments: [{ testFocus: spec.fullSpecString }]
                    }
                )
            );
    }
}