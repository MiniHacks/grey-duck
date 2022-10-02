import * as vscode from 'vscode';
import { showSideBar } from './sidebar';
import { subscribeToDocumentChanges, KEYWORD_MENTION } from './diagnostics';

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// watch for keywords in python code
	const keywordDiagnostics = vscode.languages.createDiagnosticCollection("goose");
	context.subscriptions.push(keywordDiagnostics);
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
	
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations!!!!! your extension "hackmit-ext" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('hackmit-ext.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from hackmit-ext!');

		// showSideBar(context);
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

const COMMAND = 'grey-duck-guide.command';

/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class KeywordInfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		return context.diagnostics
			.filter(diagnostic => diagnostic.code === KEYWORD_MENTION)
			.map(diagnostic => this.createCommandCodeAction(diagnostic));
	}

	private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
		const action = new vscode.CodeAction('Show in Sidebar', vscode.CodeActionKind.QuickFix);
		action.command = { command: COMMAND, title: 'Detailed Info', tooltip: 'This will open detailed info on the sidebar.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
}