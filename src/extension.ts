// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const scriptRegex = /<script.*?>[\s\S]*?<\/script>/g;
const htmlRegex = /<template.*?>[\s\S]*?<\/template>/g;
const cssRegex = /<style.*?>[\s\S]*?<\/style>/g;

let scriptDecoration = vscode.window.createTextEditorDecorationType({});

let htmlDecoration = vscode.window.createTextEditorDecorationType({});

let cssDecoration = vscode.window.createTextEditorDecorationType({});

function decorateRegex(regex: RegExp, activeEditor: vscode.TextEditor, text: string, decoration: vscode.TextEditorDecorationType) {
    const matches = text.match(regex);
    if (matches) {
        const ranges = matches.map(match => {
            const start = text.indexOf(match);
            const end = start + match.length;
            return new vscode.Range(activeEditor.document.positionAt(start), activeEditor.document.positionAt(end));
        });
        activeEditor.setDecorations(decoration, ranges);
    }
}

function decorateVue() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;

    const text = activeEditor.document.getText();
    decorateRegex(scriptRegex, activeEditor, text, scriptDecoration);
    decorateRegex(htmlRegex, activeEditor, text, htmlDecoration);
    decorateRegex(cssRegex, activeEditor, text, cssDecoration);
}

function brightenColor(color: string) {
    const rgba = color.match(/\d+/g);
    if (!rgba) return color;
    const r = parseInt(rgba[0]);
    const g = parseInt(rgba[1]);
    const b = parseInt(rgba[2]);
    const a = parseFloat(rgba[3]);
    return `rgba(${r}, ${g}, ${b}, ${a + 0.2 > 1 ? 1 : a + 0.2})`;
}

function loadSettings() {
    const config = vscode.workspace.getConfiguration('vueColors');
    const scriptColor = config.get('scriptColor');
    const htmlColor = config.get('htmlColor');
    const cssColor = config.get('cssColor');
    const highlightLine = config.get('highlightLine');
    const highlightScrollbar = config.get('highlightScrollbar');

    scriptDecoration.dispose();
    htmlDecoration.dispose();
    cssDecoration.dispose();

    if (!scriptColor || !htmlColor || !cssColor) {
        let missingColors = [];
        if (!scriptColor) missingColors.push('scriptColor');
        if (!htmlColor) missingColors.push('htmlColor');
        if (!cssColor) missingColors.push('cssColor');
        vscode.window.showErrorMessage('Vue Colors: Please set all colors in settings. Missing colors: ' + missingColors.join(', '));
        return;
    }

    scriptDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: highlightLine ? scriptColor : "rgba(0,0,0,0)",
        isWholeLine: true,
        overviewRulerColor: highlightScrollbar ? brightenColor(scriptColor as string) : "rgba(0,0,0,0)",
        overviewRulerLane: vscode.OverviewRulerLane.Right,
    });

    htmlDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: highlightLine ? htmlColor : "rgba(0,0,0,0)",
        isWholeLine: true,
        overviewRulerColor: highlightScrollbar ? brightenColor(htmlColor as string) : "rgba(0,0,0,0)",
        overviewRulerLane: vscode.OverviewRulerLane.Right,
    });

    cssDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: highlightLine ? cssColor : "rgba(0,0,0,0)",
        isWholeLine: true,
        overviewRulerColor: highlightScrollbar ? brightenColor(cssColor as string) : "rgba(0,0,0,0)",
        overviewRulerLane: vscode.OverviewRulerLane.Right,
    });

    decorateVue();
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "highlighter" is now active!');

    let onSave = vscode.workspace.onDidSaveTextDocument((e) => decorateVue());
    let onChangeDocument = vscode.window.onDidChangeActiveTextEditor((e) => decorateVue());
    let onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((e) => loadSettings());

    context.subscriptions.push(onSave);
    context.subscriptions.push(onChangeDocument);
    context.subscriptions.push(onDidChangeConfiguration);

    loadSettings();
}

// This method is called when your extension is deactivated
export function deactivate() { }
