import * as vscode from 'vscode';
import { showSideBar } from './sidebar';
import { subscribeToDocumentChanges, KEYWORD_MENTION } from './diagnostics';


const COMMAND = 'grey-duck-guide.command';

// Code action provider (squiggly lines underneath text)

export class KeywordInfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		// run "grey-duck-guide.command" command when squiggly line's "Quick Fix" button is clicked
		return context.diagnostics
			.filter(diagnostic => diagnostic.code === KEYWORD_MENTION)
			.map(diagnostic => this.createCommandCodeAction(diagnostic));
	}

	private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
		const action = new vscode.CodeAction(diagnostic.message, vscode.CodeActionKind.QuickFix);
		action.command = { command: COMMAND, title: 'Detailed Info', tooltip: 'This will open detailed info on the sidebar.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
}


export function activate(context: vscode.ExtensionContext) {

	// watch for keywords in python code
	const keywordDiagnostics = vscode.languages.createDiagnosticCollection("goose");
	context.subscriptions.push(keywordDiagnostics);

	// subscribe to document changes
	subscribeToDocumentChanges(context, keywordDiagnostics);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('python', new KeywordInfo(), {
			providedCodeActionKinds: KeywordInfo.providedCodeActionKinds
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(COMMAND, () => {
			showSideBar(context);
		})
	);
	
	// This line of code will only be executed once when your extension is activate
	console.log("We're fkn live!! Don't die!!");

	let disposable = vscode.commands.registerCommand('hackmit-ext.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from hackmit-ext!');

		// showSideBar(context);
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log("fuck we died");
}