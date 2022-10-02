import * as vscode from 'vscode';

export function showSideBar(context: vscode.ExtensionContext) {
  // see if we have any active webviews
  const wv = context.globalState.get('webview');
  // @ts-ignore
  if(wv?.visible) {
    // if we do, show it
    console.log("SHOWING SIDEBAR");
    // @ts-ignore
    wv?.show?.();
  } else {
    // if we don't, create it
    console.log("CREATING SIDEBAR", wv);
    const panel = vscode.window.createWebviewPanel(
      'sidebar', 						 // type of webview (internal)
      'GreyDuckGuide',    	 // title 
      vscode.ViewColumn.Two, // show in secondary sidebar
      {} 										 // webview options
    );
    // save the webview so we can show it later
    context.globalState.update('webview', panel);

    context.subscriptions.push(panel);
    setInterval(() => { 
      // set the webview's html content
      panel.webview.html = getSidebarContent(context);
    }, 200);
  }
}


const codeHtml = (txt: string, lns: number[]) => {
  return `
    <div class="code">
      <pre class="code-text">
        ${txt}
      </pre>
    </div>
  `;
}


function getSidebarContent(context: vscode.ExtensionContext) {
  const data = context.globalState.get('data');
  const pos = vscode.window?.activeTextEditor?.selection?.active?.line ?? 0;
  let html = "";
  // @ts-ignore
  for(let i = 0; i < data?.file_ranges?.length; i++){
    // @ts-ignore`
    const activeClass = data?.file_ranges[i][0] <= pos && pos <= data?.file_ranges[i][1] ? "active" : "";
    html += `<div class='code-container ${activeClass}'>`;
    // @ts-ignore
    html += codeHtml(data?.improved_sections[i], data?.file_ranges[i]);
    // @ts-ignore
    html += `<div class="explanation">${data?.explanations[i]}</div>`;
    html += "</div>";
  }

  return `
    <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GreyDuck Guide</title>
          <style>
            .code-container {
              margin: 10px;
              display: none;
            }
            .code-container.active {
              display: block;
            }

          </style>
      </head>
      <body>
          <h1>GreyDuck Goose</h1>
          <h2>write this instead</h2>
          ${html}
      </body>
    </html>
  `;
}
