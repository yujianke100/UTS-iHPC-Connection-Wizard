# UTS-iHPC-Connection-Wizard

[VSCode Extension](https://marketplace.visualstudio.com/items?itemName=JiankeYu.uts-ihpc)

## Features

This extension is designed to facilitate the use of UTS iHPC within VS Code.

1. **Check Node Status**: View the live status of UTS iHPC nodes.
2. **Context Menu Features**:
   - **Open Terminal and SSH Connect to Node**: Quickly open a new terminal and establish an SSH connection to a node via the right-click context menu.
   - **Add Node Information to Remote-SSH**: In a local environment, you can swiftly add node information to the Remote-SSH configuration.
3. **Node Environment Compatibility**: When using this extension on a node, you can view node statuses and open terminals for SSH connections. However, in a remote node environment, the ability to add node information to Remote-SSH is not available due to the deactivation of VS Code's Remote-SSH feature.

## Requirements

1. You need to be in the UTS intranet environment or have an active [VPN](https://vpn.uts.edu.au/) connection established. 
2. You need to ensure that your device can log in to iHPC without password. You can achieve this by setting a [SSH key](https://code.visualstudio.com/docs/remote/troubleshooting#_quick-start-using-ssh-keys).

**Recommended**: Use in Conjunction with [Remote-SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh).

## Extension Settings

The first time you open the extension, you will be prompted to enter your UTS iHPC username. 
If you do not have an account yet, please apply for one at [this page](https://ihpc.research.uts.edu.au/login/).


---

## Following extension guidelines

**Node Overview**: Access the extension panel to confirm the currently available nodes and their status within your UTS iHPC cluster. Information includes CPU usage, memory usage, GPU availability, GPU memory usage, and the username of the user currently utilizing the node. 

**One-Click Node Connection**: Right-clicking on a specific node can open a new command to log in to the node with ssh or update the connection details in the Remote-SSH. Be sure to refresh the list in the Remote-SSH plugin, and the newly added node is readily available for your remote access needs.


**Enjoy!**
