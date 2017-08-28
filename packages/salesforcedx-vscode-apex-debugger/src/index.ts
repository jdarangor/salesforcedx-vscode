/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as vscode from 'vscode';

const initialDebugConfigurations = {
  version: '0.2.0',
  configurations: [
    {
      name: 'Launch Apex Debugger',
      type: 'apex',
      request: 'launch',
      userIdFilter: '',
      requestTypeFilter: '',
      entryPointFilter: '',
      sfdxProject: '${workspaceRoot}'
    }
  ]
};

function registerCommands(): vscode.Disposable {
  const initialDebugConfig = vscode.commands.registerCommand(
    'sfdx.debug.provideInitialConfigurations',
    () => {
      return [JSON.stringify(initialDebugConfigurations, null, '\t')].join(
        '\n'
      );
    }
  );
  const customEventHandler = vscode.debug.onDidReceiveDebugSessionCustomEvent(
    async event => {
      if (event && event.session) {
        if (event.event === 'getLineBreakpointInfo') {
          const sfdxApex = vscode.extensions.getExtension(
            'salesforce.salesforcedx-vscode-apex'
          );
          if (sfdxApex && sfdxApex.exports) {
            const lineBpInfo = await sfdxApex.exports.getLineBreakpointInfo();
            event.session.customRequest('lineBreakpointInfo', lineBpInfo);
            console.log('Retrieved line breakpoint info from language server');
          }
        }
      }
    }
  );
  return vscode.Disposable.from(initialDebugConfig, customEventHandler);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Apex Debugger Extension Activated');
  const commands = registerCommands();
  context.subscriptions.push(commands);
}

export function deactivate() {
  console.log('Apex Debugger Extension Deactivated');
}
