import * as vscode from 'vscode';

/** Code that is used to associate diagnostic entries with code actions. */
export const KEYWORD_MENTION = 'keyword_mention';
const KEYWORD = 'goose';

export function refreshDiagnostics(doc: vscode.TextDocument, keywordDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
		if (lineOfText.text.includes(KEYWORD)) {
			diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex));
		}
	}

	keywordDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	const index = lineOfText.text.indexOf(KEYWORD);
	const range = new vscode.Range(lineIndex, index, lineIndex, index + KEYWORD.length);

	const diagnostic = new vscode.Diagnostic(range, `why the heck did you write the word ${KEYWORD}?`,
		vscode.DiagnosticSeverity.Information);
	diagnostic.code = KEYWORD_MENTION;
	return diagnostic;
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, keywordDiagnostic: vscode.DiagnosticCollection): void {
    console.log("samyok: listen to document changes");
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, keywordDiagnostic);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, keywordDiagnostic);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, keywordDiagnostic))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => keywordDiagnostic.delete(doc.uri))
	);

}