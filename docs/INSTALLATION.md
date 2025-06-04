# Installation Guide

## Quick Install

### Option 1: NPX (Recommended)
```bash
npx @your-username/mcp-fixer-server install
```

### Option 2: Global Install
```bash
npm install -g @your-username/mcp-fixer-server
mcp-fixer install
```

### Option 3: Local Development
```bash
git clone https://github.com/your-username/mcp-fixer-server.git
cd mcp-fixer-server
npm install
npm run install:claude
```

## Manual Installation

1. **Add to Claude Desktop Config**

   Edit your `claude_desktop_config.json`:

   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add Server Entry**
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

3. **Restart Claude Desktop**

## Verification

Ask Claude: "Can you diagnose my MCP configuration?"

If it responds with a detailed analysis, the installation was successful!

## Troubleshooting

### Common Issues

- **Command not found**: Ensure Node.js and npm are installed
- **Permission errors**: Try running as administrator
- **Config not found**: Check file path and permissions

### Getting Help

- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Open an issue on [GitHub](https://github.com/your-username/mcp-fixer-server/issues)
- Run `mcp-fixer check` to diagnose installation