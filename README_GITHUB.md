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
npx @your-username/mcp-fixer-server --install
```

#### Option 2: Clone and Install
```bash
git clone https://github.com/your-username/mcp-fixer-server.git
cd mcp-fixer-server
npm install
```

#### Option 3: Download Release
1. Download the latest release from [GitHub Releases](https://github.com/your-username/mcp-fixer-server/releases)
2. Extract and run `npm install`

### Configuration

Add the MCP Fixer to your Claude Desktop config:

**Windows:**
```json
{
  "mcpServers": {
    "mcp-fixer": {
      "command": "npx",
      "args": ["@your-username/mcp-fixer-server"],
      "autoStart": true
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "mcp-fixer": {
      "command": "npx", 
      "args": ["@your-username/mcp-fixer-server"],
      "autoStart": true
    }
  }
}
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

## 🔧 Advanced Usage

### Manual Diagnostics
```bash
# Test the server
npm test

# Run specific diagnostics
node src/index.js --diagnose
```

### Custom Configuration
```javascript
// Custom config path
{
  "configPath": "/path/to/custom/claude_desktop_config.json"
}
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

## 🛠️ Development

### Setup
```bash
git clone https://github.com/your-username/mcp-fixer-server.git
cd mcp-fixer-server
npm install
```

### Testing
```bash
npm test
npm run dev  # Development mode with hot reload
```

### Building
```bash
npm run build
npm run package  # Create distribution package
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Create meaningful commit messages

### Reporting Issues
Please use our [Issue Template](.github/ISSUE_TEMPLATE.md) when reporting bugs or requesting features.

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
- [Model Context Protocol](https://modelcontextprotocol.io/) community
- All contributors and users who provide feedback

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-username/mcp-fixer-server/issues)
- 💬 [Discussions](https://github.com/your-username/mcp-fixer-server/discussions)
- 📧 Email: support@yourproject.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/mcp-fixer-server&type=Date)](https://star-history.com/#your-username/mcp-fixer-server&Date)

---

**Made with ❤️ for the MCP community**