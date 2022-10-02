import * as vscode from 'vscode';

/** Code that is used to associate diagnostic entries with code actions. */
export const KEYWORD_MENTION = 'keyword_mention';

// keyword that diagnostics looks for to complain about
const KEYWORD = 'goose';

export function refreshDiagnostics(doc: vscode.TextDocument, keywordDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);

		// DETERMINE WHETHER THE LINE OF CODE IS SUS HERE
		// const jsonStr = isSus(lineOfText.text); 
		const jsonStr = '{"reason": "insert reasoning here"}';
		if (lineOfText.text.includes(KEYWORD)) {
			diagnostics.push(createDiagnostic(doc, jsonStr, lineOfText, lineIndex));
		}
	}

	keywordDiagnostics.set(doc.uri, diagnostics);	
}

function createDiagnostic(doc: vscode.TextDocument, info : string, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	const index = lineOfText.text.indexOf(KEYWORD);
	const range = new vscode.Range(lineIndex, index, lineIndex, index + KEYWORD.length);
	const json = JSON.parse(info);

	const diagnostic = new vscode.Diagnostic(range, json["reason"],
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