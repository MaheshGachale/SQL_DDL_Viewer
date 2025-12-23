import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('DDL Viewer extension is now active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('ddl-viewer.start', (sql?: string) => {
            DDLPanel.createOrShow(context.extensionUri, sql);
        })
    );

    console.log('DDL Viewer commands registered');
}

class DDLPanel {
    public static currentPanel: DDLPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sql?: string) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        // If SQL was provided, send it to the webview after a short delay
        if (sql) {
            setTimeout(() => {
                this._panel.webview.postMessage({ type: 'loadSql', sql });
            }, 100);
        }
    }

    public static createOrShow(extensionUri: vscode.Uri, sql?: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DDLPanel.currentPanel) {
            DDLPanel.currentPanel._panel.reveal(column);
            // Send SQL to existing panel
            if (sql) {
                DDLPanel.currentPanel._panel.webview.postMessage({ type: 'loadSql', sql });
            }
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'ddlViewer',
            'DDL Viewer',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
            }
        );

        DDLPanel.currentPanel = new DDLPanel(panel, extensionUri, sql);
    }

    public dispose() {
        DDLPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <title>DDL Viewer</title>
            <style>
                html, body {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                }
                #root {
                    height: 100%;
                    width: 100%;
                }
            </style>
        </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
