import * as vscode from 'vscode';

export class Decorator {
    private decoration: vscode.TextEditorDecorationType;
    private regex: RegExp;
    private id: string;

    /**
     * Generate a decorator for a specific regex, will automatically load settings from vscode
     * 
     * @param id used to get settings from vscode (e.g. script will get scriptColor from settings.json) 
     * @param regex used to match the text to be decorated
     */
    constructor(id: string, regex: RegExp) {
        this.regex = regex;
        this.id = id;
        this.decoration = vscode.window.createTextEditorDecorationType({});

        this.loadSettings();
    }

    /**
     * Use provided regex and decoration to decorate the active editor
     * 
     * @param activeEditor the active editor to decorate 
     */
    decorate(activeEditor: vscode.TextEditor) {
        const text = activeEditor.document.getText();
        const matches = text.match(this.regex);
        if (matches) {
            const ranges = matches.map(match => {
                const start = text.indexOf(match);
                const end = start + match.length;
                return new vscode.Range(activeEditor.document.positionAt(start), activeEditor.document.positionAt(end));
            });
            activeEditor.setDecorations(this.decoration, ranges);
        }
    }

    /**
     * Dispose the decoration, should be called when the extension is deactivated
     * or when switching to a new decoration
     */
    dispose() {
        this.decoration.dispose();
    }

    /**
     * Set the decoration with the provided options
     * 
     * @param options the options to set the decoration with
     */
    setDecoration(options: vscode.DecorationRenderOptions) {
        this.dispose();
        this.decoration = vscode.window.createTextEditorDecorationType(options);
    }

    /**
     * Load settings from vscode and set the decoration accordingly.
     * Should be called when the settings are changed. Is already called from
     * the constructor, so no need to call on activation.
     */
    loadSettings() {
        const config = vscode.workspace.getConfiguration('vueColors');
        const color = config.get(this.id + 'Color');
        const highlightLine = config.get('highlightLine');
        const highlightScrollbar = config.get('highlightScrollbar');

        if (!color) {
            vscode.window.showErrorMessage(`Vue Colors: Please set ${this.id} color in settings.`);
            return;
        }

        this.setDecoration({
            backgroundColor: highlightLine ? color : "rgba(0,0,0,0)",
            isWholeLine: true,
            overviewRulerColor: highlightScrollbar ? this.brightenColor(color as string) : "rgba(0,0,0,0)",
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });
    }

    /**
     * "Brighten" the color by adding 0.2 to the alpha value
     */
    private brightenColor(color: string) {
        const rgba = color.match(/\d+/g);
        if (!rgba) return color;
        const r = parseInt(rgba[0]);
        const g = parseInt(rgba[1]);
        const b = parseInt(rgba[2]);
        const a = parseFloat(rgba[3]);
        return `rgba(${r}, ${g}, ${b}, ${a + 0.2 > 1 ? 1 : a + 0.2})`;
    }
}