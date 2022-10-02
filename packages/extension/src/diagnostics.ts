import * as vscode from 'vscode';
import axios from 'axios';

/** Code that is used to associate diagnostic entries with code actions. */
export const KEYWORD_MENTION = 'GreyDuck';

// keyword that diagnostics looks for to complain about
const KEYWORD = 'goose';

export async function refreshDiagnostics(doc: vscode.TextDocument, keywordDiagnostics: vscode.DiagnosticCollection): Promise<void> {
	const diagnostics: vscode.Diagnostic[] = [];
 

	const request = await getImprovedCode();
	const { file_ranges, improved_sections, explanations } = request;

	for(let i = 0; i < file_ranges.length; i++){
		const hoverText = explanations[i] || "No explanation available";
		const range = file_ranges[i];
		const diagnostic = createDiagnostic(doc, hoverText, range[0], range[1]);
		diagnostics.push(diagnostic);
	}

	keywordDiagnostics.set(doc.uri, diagnostics);	
}

async function getImprovedCode() {
	try {
		const editor = vscode.window.activeTextEditor;
		const filename = editor?.document.fileName?.split("/").reverse()[0];
		const file_text = editor?.document.getText();
		const data = {
			file_text,
			filename,
			cursor_line: 0, 
			cursor_character: 0
		};
		console.log({ data })
		const res = await axios.post('http://localhost:8888/backend/improve_pyfile', data);
		console.log(res.data);
		return res.data;
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

function createDiagnostic(doc: vscode.TextDocument, info : string, rowStart: number, rowEnd: number): vscode.Diagnostic {
	const range = new vscode.Range(rowStart, 0, rowEnd + 1, 0);
	const diagnostic = new vscode.Diagnostic(range, info, vscode.DiagnosticSeverity.Information);
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