import * as vscode from 'vscode';
import axios from 'axios';
import { debounce } from 'lodash';

/** Code that is used to associate diagnostic entries with code actions. */
export const GREYDUCK_DIAGNOSTIC_CODE = 'GreyDuck';

export async function refreshDiagnostics(doc: vscode.TextDocument, keywordDiagnostics: vscode.DiagnosticCollection, context: vscode.ExtensionContext): Promise<void> {
	const diagnostics: vscode.Diagnostic[] = [];
 
	console.log("RUNNING REFRESH DIAGNOSTICS");

	const request = await getImprovedCode();
	// store the request in the context.globalState
	context.globalState.update('data', request);

	const { file_ranges, improved_sections, explanations } = request;

	for(let i = 0; i < file_ranges.length; i++){
		const hoverText = "This code could be written better!";
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
		console.log("sending request", { data })
		const res = await axios.post('https://www.greyduck.guide/backend/improve_pyfile', data);
		console.log("got request", res.data);
		return res.data;
	} catch (e) {
		console.log(e);
	}
}

function createDiagnostic(doc: vscode.TextDocument, info : string, rowStart: number, rowEnd: number): vscode.Diagnostic {
	const range = new vscode.Range(rowStart, 0, rowEnd + 1, 0);
	const diagnostic = new vscode.Diagnostic(range, info, vscode.DiagnosticSeverity.Information);
	diagnostic.code = GREYDUCK_DIAGNOSTIC_CODE;
	return diagnostic;
}

const DEBOUNCE_TIME = 1000;

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, keywordDiagnostic: vscode.DiagnosticCollection): void {
	const debouncedRefreshDiagnostics = debounce((doc: vscode.TextDocument) => refreshDiagnostics(doc, keywordDiagnostic, context), DEBOUNCE_TIME);

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(async (doc) => {
		if (doc.languageId === 'python') {
			debouncedRefreshDiagnostics(doc);
		}
	}));

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			if (event.document.languageId === 'python') {
				debouncedRefreshDiagnostics(event.document);
			}
		})
	);
	
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => keywordDiagnostic.delete(doc.uri))
	);

}