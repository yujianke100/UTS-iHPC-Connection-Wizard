import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Activating UTS Server extension.'); 
	try {
        await checkAndCompleteUtsConfig();
    } catch (error) {
        return; 
    }
    const serverProvider = new ServerProvider();
    vscode.window.registerTreeDataProvider('uts-ihpc-list', serverProvider);
	context.subscriptions.push(vscode.commands.registerCommand('uts-ihpc.refresh', () => {
        serverProvider.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('uts-ihpc.configureSsh', async (nodeName) => {
        await configureSsh(nodeName);
    }));
}
async function checkAndCompleteUtsConfig() {
    const sshConfigPath = path.join(os.homedir(), '.ssh', 'config');

    let configContent;
    try {
        configContent = await fs.promises.readFile(sshConfigPath, 'utf8');
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            configContent = '';
        } else {
            vscode.window.showErrorMessage(`Failed to read SSH configuration: ${error.message}`);
            return;
        }
    }

    const utsConfigExists = configContent.includes('Host uts');
    if (!utsConfigExists) {
        const userName = await vscode.window.showInputBox({
            prompt: 'Enter your username for Host uts',
            placeHolder: 'username',
            ignoreFocusOut: true
        });

        if (userName) {
            const utsConfigStr = `Host uts\n  HostName access.ihpc.uts.edu.au\n  User ${userName}\n\n`;
            configContent = utsConfigStr + configContent;
            try {
                await fs.promises.writeFile(sshConfigPath, configContent);
            } catch (writeError: any) {
                vscode.window.showErrorMessage(`Failed to write SSH configuration: ${writeError.message}`);
            }
        } else {
            vscode.window.showErrorMessage('SSH configuration requires a username for UTS iHPC.');
        }
    }
}



async function configureSsh(nodeName: string) {
    const sshConfigPath = path.join(os.homedir(), '.ssh', 'config');
    try {
        const configContent = await fs.promises.readFile(sshConfigPath, 'utf8');
        const updatedContent = updateSshConfig(configContent, nodeName);
        await fs.promises.writeFile(sshConfigPath, updatedContent);
        vscode.window.showInformationMessage(`SSH configuration updated for ${nodeName}`);
    } catch (error: any) {
		console.error(error);
		vscode.window.showErrorMessage(`Failed to update SSH configuration: ${error.message}`);
	}
}
function updateSshConfig(config: string, nodeName: string): string {
    const lines = config.split('\n');
    if (lines.some(line => line.startsWith(`Host ${nodeName}`))) {
        return config; 
    }

    const utsUserMatch = config.match(/Host uts\n\s*HostName [^\n]+\n\s*User ([^\n]+)/);
    const utsUser = utsUserMatch ? utsUserMatch[1] : '';
	if(utsUser === '') {
		checkAndCompleteUtsConfig();
	}

    const newNodeConfig = `Host ${nodeName}\n  HostName ${nodeName}\n  User ${utsUser}\n  ProxyJump uts`;

    const nodeOrder = ['jupiter', 'mars', 'mercury', 'neptune', 'saturn', 'venus', 'uts'];

    const hostLines = lines.filter(line => line.startsWith('Host '));

    function getNodeOrderIndex(hostLine: string): number {
		const hostName = hostLine.split(' ')[1];
		const prefixMatch = hostName.match(/^[a-zA-Z]+/);
		const prefix = prefixMatch ? prefixMatch[0] : '';
		const index = nodeOrder.indexOf(prefix);
		return index !== -1 ? index : nodeOrder.length;
	}
    function getNodeNumber(hostLine: string): number {
		const numberMatch = hostLine.match(/[0-9]+/);
		return numberMatch ? parseInt(numberMatch[0], 10) : 0;
	}

    const insertIndex = hostLines.findIndex(hostLine => {
        const orderIndex = getNodeOrderIndex(hostLine);
        const newOrderIndex = getNodeOrderIndex(`Host ${nodeName}`);
        if (orderIndex !== newOrderIndex) {
            return orderIndex > newOrderIndex;
        }
        return getNodeNumber(hostLine) > getNodeNumber(`Host ${nodeName}`);
    });

    if (insertIndex !== -1) {
        const realInsertIndex = lines.indexOf(hostLines[insertIndex]);
        lines.splice(realInsertIndex, 0, newNodeConfig);
    } else {
        lines.push(newNodeConfig);
    }

    return lines.join('\n');
}
class ServerProvider implements vscode.TreeDataProvider<ServerNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<ServerNode | undefined> = new vscode.EventEmitter<ServerNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ServerNode | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ServerNode): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<ServerNode[]> {
        console.log('Fetching server data...'); 
        return new Promise(resolve => {
            exec('ssh uts "cnode | grep yes"', (error, stdout, stderr) => {
                if (error) {
                    console.error('Error fetching data:', stderr);
                    vscode.window.showErrorMessage(`Error: ${stderr}`);
                    return resolve([]);
                }
                console.log('Data fetched:', stdout); 
                resolve(this.parseServerOutput(stdout));
            });
        });
    }

    parseServerOutput(output: string): ServerNode[] {
		const nameMaxLength = 'mercury28'.length;
		const cpuMemGpuMaxLength = '100.0%'.length;
	
		const lines = output.split('\n');
		return lines.map(line => {
			if (line.startsWith('*') || line.trim() === '') return null;
			const parts = line.trim().split(/\s+/);
			if (parts.length < 6) return null;
	
			const name = parts[0].padEnd(nameMaxLength, ' ');
			const cpu = parts[3].padEnd(cpuMemGpuMaxLength, ' ');
			const mem = parts[4].padEnd(cpuMemGpuMaxLength, ' ');
			const gpu = parts.length > 6 ? parts[5].padEnd(cpuMemGpuMaxLength, ' ') : 'N/A'.padEnd(cpuMemGpuMaxLength, ' ');
			const gpuMem = parts.length > 7 ? parts[6].padEnd(cpuMemGpuMaxLength, ' ') : 'N/A'.padEnd(cpuMemGpuMaxLength, ' ');
			const users = parts.length > 7 ? parts.slice(7).join(', ') : '';
	
			return new ServerNode(`${name}`,`| C: ${cpu} | M: ${mem} | G: ${gpu} | GM: ${gpuMem} | ${users}`);
		}).filter(node => node !== null) as ServerNode[];
	}
	
}

class ServerNode extends vscode.TreeItem {
    constructor(public readonly name: string, public readonly description: string) {
        super(name, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.name} - ${this.description}`;
        this.command = {
            title: "Configure SSH",
            command: "uts-ihpc.configureSsh",
            arguments: [this.name]
        };
    }
}