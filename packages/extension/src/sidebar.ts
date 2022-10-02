import * as vscode from 'vscode';

export function showSideBar(context: vscode.ExtensionContext) {
  // see if we have any active webviews
  // if we don't, create it
  console.log("CREATING SIDEBAR");
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
    html += `<div class='code-container ${activeClass}'><p>We think this could be better written as:</p>`;
    // @ts-ignore
    html += codeHtml(data?.improved_sections[i], data?.file_ranges[i]);
    // @ts-ignore
    html += `<p>Why is this better?</p><div class="explanation">${data?.explanations[i]}</div>`;
    html += "</div>";
  }

  if(!html.includes("code-container active")) {
    html += "<p style='font-size: 20px'>Click into an underlined function to see where you can do better!</p>";
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

            .img-container {
              display: flex;
              justify-content: flex-end;
              position: absolute;
              bottom: 0;
            }

            div {
              font-size: 18px;
            }

          </style>
      </head>
      <body>
          <h1>GreyDuck Goose</h1>
          ${html}
          <div class="img-container">
          <img src="https://www.greyduck.guide/pixel_goose_animated.gif" style="max-width: min(75%, 500px);"/>
          </div>
      </body>
    </html>
  `;
}
