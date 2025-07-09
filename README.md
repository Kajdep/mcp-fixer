# 🔧 MCP Fixer Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

A comprehensive diagnostic and repair tool for Model Context Protocol (MCP) servers in Claude Desktop. Automatically detects, diagnoses, and fixes common MCP configuration issues.

## 🌟 Features

- **🔍 Configuration Analysis** - Validates JSON syntax, paths, and server settings
- **📊 Server Status Monitoring** - Real-time health checks for individual MCP servers  
- **⚙️ Dependency Validation** - Ensures Node.js, npm, Python, UV are properly installed
- **🌐 Port Conflict Detection** - Identifies network conflicts on common MCP ports
- **🔧 Automatic Syntax Fixing** - Repairs JSON errors with automatic backup creation
- **📝 Log File Analysis** - Parses MCP logs for error patterns and insights
- **💡 Smart Suggestions** - Provides targeted fix recommendations
- **🛡️ Safety First** - Creates backups before any modifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Claude Desktop with MCP support
- npm or npx available

### Installation

#### Option 1: NPX (Recommended)
```bash
npx @kajdep/mcp-fixer install
```

#### Option 2: Global Install
```bash
npm install -g @kajdep/mcp-fixer
mcp-fixer install
```

#### Option 3: Clone and Install
```bash
git clone https://github.com/kajdep/mcp-fixer.git
cd mcp-fixer
npm install
npm run install:claude
```

### Usage

Once installed, simply ask Claude to use the diagnostic tools:

```
"Claude, can you diagnose my MCP configuration?"
"Claude, check the status of my MCP servers"
"Claude, generate a comprehensive diagnostic report"
"Claude, suggest fixes for my MCP issues"
```

## 📋 Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `diagnose_mcp_config` | Comprehensive configuration analysis | First-line diagnosis |
| `check_mcp_server_status` | Individual server health checks | Server connectivity issues |
| `fix_config_syntax` | Automatic JSON syntax repair | Configuration errors |
| `validate_dependencies` | System dependency verification | Missing tools/packages |
| `check_port_conflicts` | Port availability scanning | Network conflicts |
| `generate_diagnostic_report` | Complete system analysis | Full health assessment |
| `suggest_fixes` | Targeted solution recommendations | Issue resolution |

## 🎯 Common Issues Detected

- **JSON Syntax Errors** - Missing commas, brackets, quotes
- **Path Issues** - Incorrect Windows path escaping
- **Missing Dependencies** - Node.js, npm, Python not found
- **Port Conflicts** - Multiple services using same ports
- **Server Crashes** - MCP servers failing to start
- **Environment Variables** - Missing or empty API keys
- **Permission Errors** - File access and executable permissions

## 🔧 CLI Usage

```bash
# Install to Claude Desktop
mcp-fixer install

# Check installation status
mcp-fixer check

# Remove from Claude Desktop
mcp-fixer uninstall

# Show current configuration
mcp-fixer config

# Run server directly (development)
mcp-fixer run
```

## 📊 Example Output

```json
{
  "configPath": "/path/to/claude_desktop_config.json",
  "exists": true,
  "valid": true,
  "issues": [],
  "warnings": [
    {
      "type": "path_escaping",
      "severity": "medium", 
      "server": "filesystem",
      "message": "Potential path escaping issue...",
      "fix": "Ensure Windows paths use double backslashes"
    }
  ],
  "serverCount": 15,
  "recommendations": [
    "Consider disabling unused servers to improve startup time"
  ]
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Setup
```bash
git clone https://github.com/kajdep/mcp-fixer.git
cd mcp-fixer
npm install
npm test
```

## 📝 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Usage Examples](docs/USAGE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [API Documentation](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude Desktop and MCP

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/kajdep/mcp-fixer/issues)
- 💬 [Discussions](https://github.com/kajdep/mcp-fixer/discussions)

---

**Made with ❤️ for the MCP community**"# mcp-fixer" 
