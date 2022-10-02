import * as vscode from 'vscode';

export function showSideBar(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'sidebar', 						 // type of webview (internal)
    'GooseMoose', 				 // title 
    vscode.ViewColumn.Two, // show in secondary sidebar
    {} 										 // webview options
  );

  // set HTML content of panel
  panel.webview.html = getSidebarContent();

  context.subscriptions.push(panel);
}

function getSidebarContent() {
  return `
    <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>your code sucks</title>
      </head>
      <body>
          <h1>surprise! your code is shitty!</h1>
          <h2>write this instead</h2>
          <code>awesome numpy code here </code>

          <h2>instead of this</h2>
          <code>original terrible code here </code>

          <h2>explanation</h2>
          <p>very cool and slick explanation here</p>
      </body>
    </html>
  `;
}
