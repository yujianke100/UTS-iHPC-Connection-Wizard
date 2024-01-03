# UTS-iHPC-Connection-Wizard

[VSCode Extension](https://marketplace.visualstudio.com/items?itemName=JiankeYu.uts-ihpc)

## Features

Helping you easily use UTS iHPC on VS Code.

1. **Check Node Status**: View live status of available UTS iHPC nodes.
2. **One-Click SSH Setup**: Add nodes to Remote-SSH quickly.


## Requirements

1. You need to be in the UTS intranet environment or have an active [VPN](https://vpn.uts.edu.au/) connection established. 
2. You need to ensure that your device can log in to iHPC without password. You can achieve this by setting a [SSH key](https://code.visualstudio.com/docs/remote/troubleshooting#_quick-start-using-ssh-keys).

**Recommended**: Use in Conjunction with [Remote-SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh).

## Extension Settings

The first time you open the extension, you will be prompted to enter your UTS iHPC username. 
If you do not have an account yet, please apply for one at [this page](https://ihpc.research.uts.edu.au/login/).


## Release Notes

### 1.0.2

Adapt to use this extension on nodes

### 1.0.1

Add the function of one click connection to SSH

Add display of username

### 1.0.0

Publish the extension.

---

## Following extension guidelines

**Node Overview**: Access the extension panel to confirm the currently available nodes and their status within your UTS iHPC cluster. Information includes CPU usage, memory usage, GPU availability, GPU memory usage, and the username of the user currently utilizing the node. 

**One-Click Node Connection**: Right-clicking on a specific node can open a new command to log in to the node with ssh or update the connection details in the Remote-SSH. Be sure to refresh the list in the Remote-SSH plugin, and the newly added node is readily available for your remote access needs.


**Enjoy!**
