import * as vscode from 'vscode';
import axios from 'axios';

/** Code that is used to associate diagnostic entries with code actions. */
export const KEYWORD_MENTION = 'keyword_mention';

// keyword that diagnostics looks for to complain about
const KEYWORD = 'goose';

export async function refreshDiagnostics(doc: vscode.TextDocument, keywordDiagnostics: vscode.DiagnosticCollection): Promise<void> {
	const diagnostics: vscode.Diagnostic[] = [];
 
	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);

		// DETERMINE WHETHER THE line OF CODE IS SUS HERE
		// const jsonStr = isSus(lineOfText.text); 
		if (lineOfText.text.includes(KEYWORD)) {
			const data = await getImprovedCode();
			const info = data["improved_code"] + "\n" + data["explanation"];
			diagnostics.push(createDiagnostic(doc, info, lineOfText, lineIndex));

			getFileInformation();
		}
	}

	keywordDiagnostics.set(doc.uri, diagnostics);	
}

async function getImprovedCode() {
	try {
		const res = await axios.get('http://localhost:8888/backend/example');
		return res.data;
		//return JSON.stringify(data);
	} catch (e) {
		console.log(e);
	}
}

async function getFileInformation() {
	const editor = vscode.window.activeTextEditor;
	console.log(editor?.document.offsetAt)

	/*
	const test = await axios.post('/localhost:8888/backend/', {
		// mouse position info
    start: editor?.document.offsetAt(editor.selection.start),
    end: editor?.document.offsetAt(editor.selection.end),
		active: editor?.document.offsetAt(editor.selection.active)
  });
	*/
}

function createDiagnostic(doc: vscode.TextDocument, info : string, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	const index = lineOfText.text.indexOf(KEYWORD);
	const range = new vscode.Range(lineIndex, index, lineIndex, index + KEYWORD.length);
	const diagnostic = new vscode.Diagnostic(range, info,
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