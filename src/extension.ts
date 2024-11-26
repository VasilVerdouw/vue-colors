// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Decorator } from './decorater';

const scriptRegex = /<script.*?>[\s\S]*?<\/script>/g;
const htmlRegex = /<template\b[^>]*>[\s\S]*<\/template>/g;
const styleRegex = /<style.*?>[\s\S]*?<\/style>/g;

let scriptDecorator = new Decorator('script', scriptRegex);
let htmlDecorator = new Decorator('html', htmlRegex);
let styleDecorator = new Decorator('style', styleRegex);

function decorate() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;

    scriptDecorator.decorate(activeEditor);
    htmlDecorator.decorate(activeEditor);
    styleDecorator.decorate(activeEditor);
}

function loadSettings() {
    scriptDecorator.loadSettings();
    htmlDecorator.loadSettings();
    styleDecorator.loadSettings();

    decorate();
}

export function activate(context: vscode.ExtensionContext) {
    let onSave = vscode.workspace.onDidSaveTextDocument((e) => decorate());
    let onChangeDocument = vscode.window.onDidChangeActiveTextEditor((e) => decorate());
    let onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((e) => loadSettings());

    context.subscriptions.push(onSave);
    context.subscriptions.push(onChangeDocument);
    context.subscriptions.push(onDidChangeConfiguration);

    decorate();
}

export function deactivate() {
    scriptDecorator.dispose();
    htmlDecorator.dispose();
    styleDecorator.dispose();
}
