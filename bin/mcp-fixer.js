#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get package info
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf-8'));

program
  .name('mcp-fixer')
  .description('MCP Fixer Server - Diagnostic and repair tool for Claude Desktop MCP servers')
  .version(packageJson.version);

program
  .command('install')
  .description('Install MCP Fixer Server to Claude Desktop configuration')
  .option('-p, --path <path>', 'Custom path to claude_desktop_config.json')
  .option('-g, --global', 'Install globally using npx command')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔧 Installing MCP Fixer Server to Claude Desktop...'));
      
      const configPath = getConfigPath(options.path);
      await installToClaudeConfig(configPath, options.global);
      
      console.log(chalk.green('✅ Successfully installed MCP Fixer Server!'));
      console.log(chalk.yellow('📝 Please restart Claude Desktop to activate the server.'));
      console.log(chalk.cyan('💡 You can now ask Claude to diagnose your MCP configuration.'));
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Remove MCP Fixer Server from Claude Desktop configuration')
  .option('-p, --path <path>', 'Custom path to claude_desktop_config.json')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🗑️ Removing MCP Fixer Server from Claude Desktop...'));
      
      const configPath = getConfigPath(options.path);
      await uninstallFromClaudeConfig(configPath);
      
      console.log(chalk.green('✅ Successfully removed MCP Fixer Server!'));
      console.log(chalk.yellow('📝 Please restart Claude Desktop to complete removal.'));
    } catch (error) {
      console.error(chalk.red('❌ Uninstallation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('check')
  .description('Check if MCP Fixer Server is properly installed')
  .option('-p, --path <path>', 'Custom path to claude_desktop_config.json')
  .action(async (options) => {
    try {
      const configPath = getConfigPath(options.path);
      const status = await checkInstallation(configPath);
      
      console.log(chalk.blue('🔍 MCP Fixer Server Installation Status:'));
      console.log(`📁 Config file: ${status.configExists ? chalk.green('Found') : chalk.red('Not found')}`);
      console.log(`⚙️ MCP Fixer entry: ${status.mcpFixerInstalled ? chalk.green('Installed') : chalk.red('Not installed')}`);
      console.log(`📋 Total MCP servers: ${chalk.cyan(status.totalServers)}`);
      
      if (status.issues.length > 0) {
        console.log(chalk.yellow('\n⚠️ Issues found:'));
        status.issues.forEach(issue => console.log(`  • ${issue}`));
      }
      
      if (status.mcpFixerInstalled) {
        console.log(chalk.green('\n✅ MCP Fixer Server is properly installed!'));
      } else {
        console.log(chalk.red('\n❌ MCP Fixer Server is not installed.'));
        console.log(chalk.cyan('💡 Run "mcp-fixer install" to install it.'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Check failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Start MCP Fixer Server directly (for development/testing)')
  .action(async () => {
    try {
      console.log(chalk.blue('🚀 Starting MCP Fixer Server...'));
      const serverPath = path.join(__dirname, '..', 'src', 'index.js');
      
      // Import and run the server
      const { default: server } = await import(serverPath);
      await server.run();
    } catch (error) {
      console.error(chalk.red('❌ Failed to start server:'), error.message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current Claude Desktop configuration')
  .option('-p, --path <path>', 'Custom path to claude_desktop_config.json')
  .action(async (options) => {
    try {
      const configPath = getConfigPath(options.path);
      
      if (!fs.existsSync(configPath)) {
        console.log(chalk.red('❌ Claude Desktop config file not found.'));
        console.log(chalk.cyan(`Expected location: ${configPath}`));
        return;
      }
      
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      console.log(chalk.blue('📋 Claude Desktop Configuration:'));
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(chalk.red('❌ Failed to read config:'), error.message);
      process.exit(1);
    }
  });

function getConfigPath(providedPath) {
  if (providedPath && fs.existsSync(providedPath)) {
    return providedPath;
  }
  
  const isWindows = os.platform() === 'win32';
  if (isWindows) {
    return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  }
}

async function installToClaudeConfig(configPath, useGlobal = false) {
  let config = {};
  
  // Read existing config or create new one
  if (fs.existsSync(configPath)) {
    config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  }
  
  // Ensure mcpServers object exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  // Create backup
  const backupPath = `${configPath}.backup.${Date.now()}`;
  if (fs.existsSync(configPath)) {
    await fs.copy(configPath, backupPath);
    console.log(chalk.green(`📦 Backup created: ${backupPath}`));
  }
  
  // Add MCP Fixer Server entry
  const serverConfig = useGlobal ? {
    command: 'npx',
    args: ['@your-username/mcp-fixer-server'],
    autoStart: true
  } : {
    command: 'node',
    args: [path.join(__dirname, '..', 'src', 'index.js')],
    autoStart: true
  };
  
  config.mcpServers['mcp-fixer'] = serverConfig;
  
  // Ensure config directory exists
  await fs.ensureDir(path.dirname(configPath));
  
  // Write updated config
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

async function uninstallFromClaudeConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error('Claude Desktop config file not found');
  }
  
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  
  if (!config.mcpServers || !config.mcpServers['mcp-fixer']) {
    console.log(chalk.yellow('⚠️ MCP Fixer Server was not found in configuration.'));
    return;
  }
  
  // Create backup
  const backupPath = `${configPath}.backup.${Date.now()}`;
  await fs.copy(configPath, backupPath);
  console.log(chalk.green(`📦 Backup created: ${backupPath}`));
  
  // Remove MCP Fixer Server entry
  delete config.mcpServers['mcp-fixer'];
  
  // Write updated config
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

async function checkInstallation(configPath) {
  const status = {
    configExists: false,
    mcpFixerInstalled: false,
    totalServers: 0,
    issues: []
  };
  
  if (!fs.existsSync(configPath)) {
    status.issues.push('Claude Desktop config file not found');
    return status;
  }
  
  status.configExists = true;
  
  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    
    if (config.mcpServers) {
      status.totalServers = Object.keys(config.mcpServers).length;
      
      if (config.mcpServers['mcp-fixer']) {
        status.mcpFixerInstalled = true;
      }
    } else {
      status.issues.push('No mcpServers configuration found');
    }
  } catch (error) {
    status.issues.push(`Failed to parse config file: ${error.message}`);
  }
  
  return status;
}

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log(chalk.cyan('💡 Run "mcp-fixer --help" to see available commands.'));
  process.exit(1);
});

// Parse command line arguments
program.parse();