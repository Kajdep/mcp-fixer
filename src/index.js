#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPFixerServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-fixer-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'diagnose_mcp_config',
            description: 'Analyze the Claude Desktop MCP configuration for common issues',
            inputSchema: {
              type: 'object',
              properties: {
                configPath: {
                  type: 'string',
                  description: 'Path to claude_desktop_config.json (optional, will auto-detect if not provided)',
                },
              },
            },
          },
          {
            name: 'check_mcp_server_status',
            description: 'Check the status of individual MCP servers',
            inputSchema: {
              type: 'object',
              properties: {
                serverName: {
                  type: 'string',
                  description: 'Name of the MCP server to check (optional, checks all if not provided)',
                },
              },
            },
          },
          {
            name: 'fix_config_syntax',
            description: 'Attempt to fix common JSON syntax errors in the MCP configuration',
            inputSchema: {
              type: 'object',
              properties: {
                configPath: {
                  type: 'string',
                  description: 'Path to claude_desktop_config.json (optional, will auto-detect if not provided)',
                },
                createBackup: {
                  type: 'boolean',
                  description: 'Whether to create a backup before fixing (default: true)',
                  default: true,
                },
              },
            },
          },
          {
            name: 'validate_dependencies',
            description: 'Check if required dependencies (Node.js, npm, Python, etc.) are installed',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'check_port_conflicts',
            description: 'Check for port conflicts that might affect MCP servers',
            inputSchema: {
              type: 'object',
              properties: {
                ports: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Specific ports to check (optional, will check common MCP ports if not provided)',
                },
              },
            },
          },
          {
            name: 'generate_diagnostic_report',
            description: 'Generate a comprehensive diagnostic report for all MCP issues',
            inputSchema: {
              type: 'object',
              properties: {
                includeLogAnalysis: {
                  type: 'boolean',
                  description: 'Whether to include analysis of MCP log files (default: true)',
                  default: true,
                },
              },
            },
          },
          {
            name: 'suggest_fixes',
            description: 'Provide detailed suggestions for fixing identified MCP issues',
            inputSchema: {
              type: 'object',
              properties: {
                issueType: {
                  type: 'string',
                  description: 'Type of issue to get suggestions for (optional, provides general suggestions if not specified)',
                  enum: ['config_syntax', 'dependency_missing', 'port_conflict', 'permission_error', 'server_crash'],
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'diagnose_mcp_config':
            return await this.diagnoseMCPConfig(args);
          case 'check_mcp_server_status':
            return await this.checkMCPServerStatus(args);
          case 'fix_config_syntax':
            return await this.fixConfigSyntax(args);
          case 'validate_dependencies':
            return await this.validateDependencies(args);
          case 'check_port_conflicts':
            return await this.checkPortConflicts(args);
          case 'generate_diagnostic_report':
            return await this.generateDiagnosticReport(args);
          case 'suggest_fixes':
            return await this.suggestFixes(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  getConfigPath(providedPath) {
    if (providedPath && fs.existsSync(providedPath)) {
      return providedPath;
    }

    // Auto-detect config path based on OS
    const isWindows = os.platform() === 'win32';
    let defaultPath;

    if (isWindows) {
      defaultPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    } else {
      defaultPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    }

    return defaultPath;
  }

  async diagnoseMCPConfig(args) {
    const configPath = this.getConfigPath(args.configPath);
    const issues = [];
    const report = {
      configPath,
      exists: false,
      valid: false,
      issues: [],
      warnings: [],
      serverCount: 0,
      recommendations: [],
    };

    try {
      // Check if config file exists
      if (!fs.existsSync(configPath)) {
        report.issues.push({
          type: 'config_missing',
          severity: 'critical',
          message: 'Claude Desktop config file not found',
          location: configPath,
          fix: 'Create the config file with proper MCP server definitions',
        });
        return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
      }

      report.exists = true;

      // Read and parse config
      const configContent = await fs.readFile(configPath, 'utf-8');
      let config;

      try {
        config = JSON.parse(configContent);
        report.valid = true;
      } catch (parseError) {
        report.issues.push({
          type: 'json_syntax_error',
          severity: 'critical',
          message: `JSON syntax error: ${parseError.message}`,
          location: configPath,
          fix: 'Use the fix_config_syntax tool to attempt automatic repair',
        });
        return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
      }

      // Validate config structure
      if (!config.mcpServers) {
        report.issues.push({
          type: 'missing_mcp_servers',
          severity: 'critical',
          message: 'Missing "mcpServers" object in config',
          fix: 'Add an mcpServers object to the config file',
        });
        return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
      }

      report.serverCount = Object.keys(config.mcpServers).length;

      // Check each MCP server configuration
      for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
        await this.validateServerConfig(serverName, serverConfig, report);
      }

      // Add recommendations
      this.addRecommendations(report);

    } catch (error) {
      report.issues.push({
        type: 'analysis_error',
        severity: 'error',
        message: `Failed to analyze config: ${error.message}`,
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }

  async validateServerConfig(serverName, serverConfig, report) {
    // Check required fields
    if (!serverConfig.command) {
      report.issues.push({
        type: 'missing_command',
        severity: 'critical',
        server: serverName,
        message: `Server "${serverName}" missing "command" field`,
        fix: 'Add a valid command field pointing to the executable',
      });
      return;
    }

    // Check if command exists (for non-cmd.exe commands)
    if (serverConfig.command !== 'cmd.exe' && serverConfig.command !== 'python' && serverConfig.command !== 'node') {
      try {
        await execAsync(`where "${serverConfig.command}"`, { timeout: 5000 });
      } catch (error) {
        report.issues.push({
          type: 'command_not_found',
          severity: 'high',
          server: serverName,
          message: `Command "${serverConfig.command}" not found in PATH`,
          fix: `Install ${serverConfig.command} or update the command path`,
        });
      }
    }

    // Check for common Windows path issues
    if (serverConfig.args) {
      for (const arg of serverConfig.args) {
        if (typeof arg === 'string' && arg.includes('\\') && !arg.includes('\\\\')) {
          report.warnings.push({
            type: 'path_escaping',
            severity: 'medium',
            server: serverName,
            message: `Potential path escaping issue in argument: "${arg}"`,
            fix: 'Ensure Windows paths use double backslashes (\\\\) in JSON',
          });
        }
      }
    }

    // Check for environment variable requirements
    if (serverConfig.env) {
      for (const [envVar, envValue] of Object.entries(serverConfig.env)) {
        if (!envValue || envValue.trim() === '') {
          report.warnings.push({
            type: 'empty_env_var',
            severity: 'medium',
            server: serverName,
            message: `Environment variable "${envVar}" is empty`,
            fix: 'Set the required environment variable value',
          });
        }
      }
    }
  }

  addRecommendations(report) {
    if (report.serverCount === 0) {
      report.recommendations.push('Consider adding some useful MCP servers like filesystem, brave-search, or memory');
    }

    if (report.serverCount > 10) {
      report.recommendations.push('You have many MCP servers configured. Consider disabling unused ones to improve startup time');
    }

    const hasIssues = report.issues.some(issue => issue.severity === 'critical' || issue.severity === 'high');
    if (hasIssues) {
      report.recommendations.push('Address critical and high-severity issues first before adding new MCP servers');
    }
  }

  async checkMCPServerStatus(args) {
    const configPath = this.getConfigPath();
    const results = {
      timestamp: new Date().toISOString(),
      servers: {},
      summary: {
        total: 0,
        running: 0,
        failed: 0,
        unknown: 0,
      },
    };

    try {
      if (!fs.existsSync(configPath)) {
        return {
          content: [
            {
              type: 'text',
              text: 'Config file not found. Cannot check server status.',
            },
          ],
        };
      }

      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      const servers = config.mcpServers || {};

      for (const [serverName, serverConfig] of Object.entries(servers)) {
        if (args.serverName && args.serverName !== serverName) {
          continue;
        }

        results.summary.total++;
        results.servers[serverName] = await this.checkIndividualServer(serverName, serverConfig);

        switch (results.servers[serverName].status) {
          case 'running':
            results.summary.running++;
            break;
          case 'failed':
            results.summary.failed++;
            break;
          default:
            results.summary.unknown++;
        }
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error checking server status: ${error.message}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  async checkIndividualServer(serverName, serverConfig) {
    const result = {
      status: 'unknown',
      message: '',
      command: serverConfig.command,
      args: serverConfig.args || [],
      issues: [],
    };

    try {
      // Basic command validation
      if (!serverConfig.command) {
        result.status = 'failed';
        result.message = 'No command specified';
        result.issues.push('missing_command');
        return result;
      }

      // For Windows, try a quick validation
      if (os.platform() === 'win32') {
        if (serverConfig.command === 'cmd.exe') {
          // For cmd.exe commands, check if the nested command exists
          const args = serverConfig.args || [];
          if (args.length > 0 && args[0] === '/c') {
            const actualCommand = args[1];
            if (actualCommand && (actualCommand.startsWith('npx') || actualCommand.startsWith('uvx'))) {
              result.status = 'assumed_ok';
              result.message = 'NPX/UVX command, likely will work if npm/uv is installed';
            }
          }
        } else if (serverConfig.command === 'python' || serverConfig.command === 'node') {
          try {
            await execAsync(`where ${serverConfig.command}`, { timeout: 3000 });
            result.status = 'command_exists';
            result.message = `${serverConfig.command} found in PATH`;
          } catch {
            result.status = 'failed';
            result.message = `${serverConfig.command} not found in PATH`;
            result.issues.push('command_not_found');
          }
        }
      }

      // Check for common issues
      if (serverConfig.env) {
        for (const [key, value] of Object.entries(serverConfig.env)) {
          if (!value || value.trim() === '') {
            result.issues.push(`empty_env_${key}`);
          }
        }
      }

    } catch (error) {
      result.status = 'error';
      result.message = `Error checking server: ${error.message}`;
    }

    return result;
  }

  async fixConfigSyntax(args) {
    const configPath = this.getConfigPath(args.configPath);
    const createBackup = args.createBackup !== false;

    const result = {
      success: false,
      backupCreated: false,
      fixesApplied: [],
      errors: [],
      configPath,
    };

    try {
      if (!fs.existsSync(configPath)) {
        result.errors.push('Config file does not exist');
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      // Create backup if requested
      if (createBackup) {
        const backupPath = `${configPath}.backup.${Date.now()}`;
        await fs.copy(configPath, backupPath);
        result.backupCreated = true;
        result.backupPath = backupPath;
      }

      // Read current content
      let content = await fs.readFile(configPath, 'utf-8');
      const originalContent = content;

      // Try to parse - if it works, no fixes needed
      try {
        JSON.parse(content);
        result.success = true;
        result.fixesApplied.push('No syntax errors found');
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (parseError) {
        // Apply common fixes

        // Fix missing commas
        const missingCommaRegex = /}(\s*)"[^"]+"\s*:/g;
        if (missingCommaRegex.test(content)) {
          content = content.replace(missingCommaRegex, '},$1"');
          result.fixesApplied.push('Added missing commas');
        }

        // Fix trailing commas
        content = content.replace(/,(\s*[}\]])/g, '$1');
        if (content !== originalContent) {
          result.fixesApplied.push('Removed trailing commas');
        }

        // Fix unescaped backslashes in Windows paths
        content = content.replace(/\\(?!\\|")/g, '\\\\');
        if (content !== originalContent) {
          result.fixesApplied.push('Fixed Windows path escaping');
        }

        // Try to parse again
        try {
          JSON.parse(content);
          await fs.writeFile(configPath, content, 'utf-8');
          result.success = true;
        } catch (stillBroken) {
          result.errors.push(`Could not fix all syntax errors: ${stillBroken.message}`);
        }
      }

    } catch (error) {
      result.errors.push(`Error fixing config: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async validateDependencies(args) {
    const results = {
      timestamp: new Date().toISOString(),
      platform: os.platform(),
      dependencies: {},
      summary: {
        allRequired: true,
        missingCritical: [],
        recommendations: [],
      },
    };

    // Check Node.js
    try {
      const { stdout } = await execAsync('node --version', { timeout: 5000 });
      results.dependencies.nodejs = {
        status: 'installed',
        version: stdout.trim(),
        required: true,
      };
    } catch {
      results.dependencies.nodejs = {
        status: 'missing',
        required: true,
        fix: 'Install Node.js from https://nodejs.org/',
      };
      results.summary.allRequired = false;
      results.summary.missingCritical.push('nodejs');
    }

    // Check npm
    try {
      const { stdout } = await execAsync('npm --version', { timeout: 5000 });
      results.dependencies.npm = {
        status: 'installed',
        version: stdout.trim(),
        required: true,
      };
    } catch {
      results.dependencies.npm = {
        status: 'missing',
        required: true,
        fix: 'NPM usually comes with Node.js. Reinstall Node.js if missing.',
      };
      results.summary.allRequired = false;
      results.summary.missingCritical.push('npm');
    }

    // Check npx
    try {
      const { stdout } = await execAsync('npx --version', { timeout: 5000 });
      results.dependencies.npx = {
        status: 'installed',
        version: stdout.trim(),
        required: true,
      };
    } catch {
      results.dependencies.npx = {
        status: 'missing',
        required: true,
        fix: 'NPX usually comes with npm. Update npm or reinstall Node.js.',
      };
      results.summary.allRequired = false;
      results.summary.missingCritical.push('npx');
    }

    // Check Python (optional but common)
    try {
      const { stdout } = await execAsync('python --version', { timeout: 5000 });
      results.dependencies.python = {
        status: 'installed',
        version: stdout.trim(),
        required: false,
      };
    } catch {
      try {
        const { stdout } = await execAsync('python3 --version', { timeout: 5000 });
        results.dependencies.python = {
          status: 'installed',
          version: stdout.trim(),
          command: 'python3',
          required: false,
        };
      } catch {
        results.dependencies.python = {
          status: 'missing',
          required: false,
          note: 'Required for Python-based MCP servers',
          fix: 'Install Python from https://python.org/',
        };
      }
    }

    // Check UV (Python package manager)
    try {
      const { stdout } = await execAsync('uv --version', { timeout: 5000 });
      results.dependencies.uv = {
        status: 'installed',
        version: stdout.trim(),
        required: false,
      };
    } catch {
      results.dependencies.uv = {
        status: 'missing',
        required: false,
        note: 'Required for uvx-based MCP servers',
        fix: 'Install UV: pip install uv',
      };
    }

    // Add recommendations
    if (results.summary.missingCritical.length > 0) {
      results.summary.recommendations.push('Install missing critical dependencies first');
    }

    if (results.dependencies.python?.status === 'missing') {
      results.summary.recommendations.push('Consider installing Python for Python-based MCP servers');
    }

    if (results.dependencies.uv?.status === 'missing') {
      results.summary.recommendations.push('Consider installing UV for faster Python MCP server management');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  async checkPortConflicts(args) {
    const commonMCPPorts = args.ports || [7777, 8080, 3000, 4000, 5000, 8000];
    const results = {
      timestamp: new Date().toISOString(),
      ports: {},
      conflicts: [],
      recommendations: [],
    };

    for (const port of commonMCPPorts) {
      try {
        if (os.platform() === 'win32') {
          const { stdout } = await execAsync(`netstat -an | findstr :${port}`, { timeout: 5000 });
          if (stdout.trim()) {
            results.ports[port] = {
              status: 'in_use',
              details: stdout.trim().split('\n')[0],
            };
            results.conflicts.push(port);
          } else {
            results.ports[port] = { status: 'available' };
          }
        } else {
          const { stdout } = await execAsync(`lsof -i :${port}`, { timeout: 5000 });
          if (stdout.trim()) {
            results.ports[port] = {
              status: 'in_use',
              details: stdout.trim(),
            };
            results.conflicts.push(port);
          } else {
            results.ports[port] = { status: 'available' };
          }
        }
      } catch {
        results.ports[port] = { status: 'available' };
      }
    }

    if (results.conflicts.length > 0) {
      results.recommendations.push('Consider configuring MCP servers to use different ports if they support it');
      results.recommendations.push('Check if processes using these ports can be stopped when running MCPs');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  async generateDiagnosticReport(args) {
    const report = {
      timestamp: new Date().toISOString(),
      platform: os.platform(),
      sections: {},
    };

    try {
      // Configuration analysis
      const configAnalysis = await this.diagnoseMCPConfig({});
      report.sections.configuration = JSON.parse(configAnalysis.content[0].text);

      // Dependency validation
      const depValidation = await this.validateDependencies({});
      report.sections.dependencies = JSON.parse(depValidation.content[0].text);

      // Server status check
      const serverStatus = await this.checkMCPServerStatus({});
      report.sections.serverStatus = JSON.parse(serverStatus.content[0].text);

      // Port conflict check
      const portCheck = await this.checkPortConflicts({});
      report.sections.portConflicts = JSON.parse(portCheck.content[0].text);

      // Log analysis (if requested)
      if (args.includeLogAnalysis) {
        report.sections.logAnalysis = await this.analyzeLogFiles();
      }

      // Generate summary
      report.summary = this.generateSummary(report.sections);

    } catch (error) {
      report.error = `Failed to generate complete report: ${error.message}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }

  async analyzeLogFiles() {
    const analysis = {
      logsFound: false,
      logPath: '',
      recentErrors: [],
      patterns: {},
    };

    try {
      const isWindows = os.platform() === 'win32';
      const logDir = isWindows 
        ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'logs')
        : path.join(os.homedir(), 'Library', 'Logs', 'Claude');

      if (fs.existsSync(logDir)) {
        analysis.logsFound = true;
        analysis.logPath = logDir;

        // Look for common log files
        const logFiles = await fs.readdir(logDir);
        const mcpLogFiles = logFiles.filter(file => file.includes('mcp') || file.includes('server'));

        for (const logFile of mcpLogFiles.slice(0, 5)) { // Limit to 5 recent files
          try {
            const logPath = path.join(logDir, logFile);
            const content = await fs.readFile(logPath, 'utf-8');
            
            // Look for error patterns
            const errorLines = content.split('\n').filter(line => 
              line.toLowerCase().includes('error') || 
              line.toLowerCase().includes('failed') ||
              line.toLowerCase().includes('crash')
            ).slice(-10); // Last 10 errors

            if (errorLines.length > 0) {
              analysis.recentErrors.push({
                file: logFile,
                errors: errorLines,
              });
            }
          } catch (readError) {
            // Skip files we can't read
          }
        }

        // Analyze error patterns
        const allErrors = analysis.recentErrors.flatMap(log => log.errors);
        analysis.patterns = this.analyzeErrorPatterns(allErrors);
      }
    } catch (error) {
      analysis.error = `Error analyzing logs: ${error.message}`;
    }

    return analysis;
  }

  analyzeErrorPatterns(errors) {
    const patterns = {
      connectionIssues: 0,
      configErrors: 0,
      dependencyIssues: 0,
      permissionErrors: 0,
      portConflicts: 0,
    };

    for (const error of errors) {
      const lowerError = error.toLowerCase();
      
      if (lowerError.includes('connection') || lowerError.includes('connect')) {
        patterns.connectionIssues++;
      }
      if (lowerError.includes('config') || lowerError.includes('json')) {
        patterns.configErrors++;
      }
      if (lowerError.includes('not found') || lowerError.includes('missing')) {
        patterns.dependencyIssues++;
      }
      if (lowerError.includes('permission') || lowerError.includes('access denied')) {
        patterns.permissionErrors++;
      }
      if (lowerError.includes('port') || lowerError.includes('address in use')) {
        patterns.portConflicts++;
      }
    }

    return patterns;
  }

  generateSummary(sections) {
    const summary = {
      overallStatus: 'unknown',
      criticalIssues: 0,
      warnings: 0,
      recommendations: [],
      nextSteps: [],
    };

    // Analyze configuration issues
    if (sections.configuration?.issues) {
      const critical = sections.configuration.issues.filter(i => i.severity === 'critical').length;
      const high = sections.configuration.issues.filter(i => i.severity === 'high').length;
      summary.criticalIssues += critical + high;
      summary.warnings += sections.configuration.issues.filter(i => i.severity === 'medium').length;
    }

    // Analyze dependency issues
    if (sections.dependencies?.summary?.missingCritical?.length > 0) {
      summary.criticalIssues += sections.dependencies.summary.missingCritical.length;
      summary.nextSteps.push('Install missing critical dependencies');
    }

    // Analyze server status
    if (sections.serverStatus?.summary?.failed > 0) {
      summary.criticalIssues += sections.serverStatus.summary.failed;
      summary.nextSteps.push('Fix failed MCP servers');
    }

    // Determine overall status
    if (summary.criticalIssues === 0) {
      summary.overallStatus = 'healthy';
    } else if (summary.criticalIssues <= 2) {
      summary.overallStatus = 'minor_issues';
    } else {
      summary.overallStatus = 'needs_attention';
    }

    // Add general recommendations
    if (summary.criticalIssues > 0) {
      summary.recommendations.push('Address critical issues first');
      summary.recommendations.push('Use the suggest_fixes tool for specific guidance');
    }

    if (summary.warnings > 3) {
      summary.recommendations.push('Review warnings to prevent future issues');
    }

    return summary;
  }

  async suggestFixes(args) {
    const suggestions = {
      timestamp: new Date().toISOString(),
      issueType: args.issueType || 'general',
      fixes: [],
    };

    switch (args.issueType) {
      case 'config_syntax':
        suggestions.fixes = [
          {
            issue: 'JSON syntax errors',
            solution: 'Use the fix_config_syntax tool to automatically repair common issues',
            steps: [
              'Run fix_config_syntax with createBackup: true',
              'Review the changes made',
              'Restart Claude Desktop to test'
            ],
            preventive: 'Use a JSON validator when editing the config manually'
          }
        ];
        break;

      case 'dependency_missing':
        suggestions.fixes = [
          {
            issue: 'Missing Node.js/npm',
            solution: 'Install Node.js from the official website',
            steps: [
              'Download Node.js LTS from https://nodejs.org/',
              'Run the installer with default settings',
              'Restart your terminal/command prompt',
              'Verify with: node --version && npm --version'
            ],
            preventive: 'Keep Node.js updated to LTS versions'
          },
          {
            issue: 'Missing Python dependencies',
            solution: 'Install Python and package managers',
            steps: [
              'Install Python from https://python.org/',
              'Install UV: pip install uv',
              'Verify installations'
            ]
          }
        ];
        break;

      case 'port_conflict':
        suggestions.fixes = [
          {
            issue: 'Port conflicts between services',
            solution: 'Configure different ports or stop conflicting services',
            steps: [
              'Identify which process is using the port',
              'Either stop the conflicting process',
              'Or configure the MCP server to use a different port (if supported)',
              'Update the MCP configuration accordingly'
            ],
            preventive: 'Document which ports your MCP servers use'
          }
        ];
        break;

      case 'permission_error':
        suggestions.fixes = [
          {
            issue: 'File or resource access permissions',
            solution: 'Adjust permissions or run with appropriate privileges',
            steps: [
              'Try running Claude Desktop as Administrator (Windows) or with sudo (macOS/Linux)',
              'Check file permissions on configuration and log directories',
              'Ensure MCP servers have access to required files/directories'
            ],
            preventive: 'Set up proper user permissions during initial configuration'
          }
        ];
        break;

      case 'server_crash':
        suggestions.fixes = [
          {
            issue: 'MCP server crashes or fails to start',
            solution: 'Debug the specific server configuration and dependencies',
            steps: [
              'Check the specific server logs in the logs directory',
              'Verify all dependencies for that server are installed',
              'Test running the server command manually',
              'Check for syntax errors in server-specific configuration'
            ],
            preventive: 'Test each MCP server individually before adding to main config'
          }
        ];
        break;

      default:
        suggestions.fixes = [
          {
            issue: 'General MCP troubleshooting',
            solution: 'Systematic diagnosis and fixing approach',
            steps: [
              'Run generate_diagnostic_report for complete analysis',
              'Fix critical issues first (config syntax, missing dependencies)',
              'Test each fix by restarting Claude Desktop',
              'Check server status after each change',
              'Review logs for any remaining issues'
            ],
            preventive: 'Regular maintenance and monitoring of MCP configurations'
          },
          {
            issue: 'Best practices for MCP management',
            solution: 'Preventive measures and good practices',
            steps: [
              'Keep a backup of working configurations',
              'Test new MCP servers individually before adding to main config',
              'Document which servers you use and why',
              'Regularly update MCP servers and dependencies',
              'Monitor Claude Desktop logs for early warning signs'
            ]
          }
        ];
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(suggestions, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Fixer Server running on stdio');
  }
}

const server = new MCPFixerServer();
server.run().catch(console.error);