# NetADX AI-CORE MCP Stdio Wrapper

Enable Claude Desktop to connect to NetADX AI-CORE API servers via stdio MCP protocol.

## Overview

This package provides a stdio wrapper that translates between:
- stdio MCP protocol (used by Claude Desktop, Cline, and other MCP clients)
- HTTP-based NetADX AI-CORE API servers (REST API)

This allows Claude Desktop to seamlessly use all tools provided by NetADX AI-CORE API servers.

## Quick Start

### 1. Obtain JWT Token

Request a JWT token from your NetADX AI-CORE administrator or generate one for development:

```bash
# Example: Generate token for user
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userObjId: 'YOUR_USER_ID' },
  'netadxAPI',
  { algorithm: 'HS256', expiresIn: '24h' }
);
console.log(token);
"
```

### 2. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "netadx-api": {
      "command": "npx",
      "args": ["-y", "@netadx1ai/mcp-stdio-wrapper@latest"],
      "env": {
        "API_URL": "https://api.netadx.ai",
        "JWT_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "LOG_FILE": "/tmp/netadx-mcp.log"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

Restart Claude Desktop to load the MCP server.

### 4. Verify Connection

In Claude Desktop, ask:

```
Can you list the available NetADX tools?
```

Claude should respond with a list of available tools from your NetADX AI-CORE API server.

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `API_URL` | No | NetADX AI-CORE API base URL | `https://api.netadx.ai` |
| `JWT_TOKEN` | **Yes** | Your JWT authentication token | `eyJhbGci...` |
| `LOG_FILE` | No | Path to log file for debugging | `/tmp/netadx-mcp.log` |

### Development Setup

For local development or testing:

```json
{
  "mcpServers": {
    "netadx-api-dev": {
      "command": "npx",
      "args": ["-y", "@netadx1ai/mcp-stdio-wrapper@latest"],
      "env": {
        "API_URL": "http://localhost:8025",
        "JWT_TOKEN": "your-dev-token",
        "LOG_FILE": "/tmp/netadx-mcp-dev.log"
      }
    }
  }
}
```

## Available Tools

Once configured, Claude Desktop can use all tools provided by your NetADX AI-CORE API server. The available tools depend on your server configuration and implementation.

For example, the NetADX AI-CORE boilerplate includes:

| Tool | Description |
|------|-------------|
| `example_tool` | Example CRUD operations for learning and testing |

Your production server may include additional custom tools based on your business requirements.

## Example Usage in Claude Desktop

### List Items (using example_tool)

```
Claude, can you list all items using the example tool?
```

Claude will execute the `example_tool`:
```json
{
  "action": "list_items"
}
```

### Create Item

```
Claude, please create a new item with name "Test Item" and value 123
```

Claude will execute the `example_tool`:
```json
{
  "action": "create_item",
  "data": {
    "name": "Test Item",
    "value": 123
  }
}
```

### Get Specific Item

```
Claude, get the item with ID abc123
```

Claude will execute the `example_tool`:
```json
{
  "action": "get_data",
  "id": "abc123"
}
```

## Troubleshooting

### 1. "JWT_TOKEN environment variable is required"

**Problem:** No JWT token provided

**Solution:** Add `JWT_TOKEN` to your Claude Desktop config:
```json
"env": {
  "JWT_TOKEN": "your-jwt-token-here"
}
```

### 2. "Authentication failed: Invalid or expired JWT token"

**Problem:** Token is invalid or expired

**Solution:** Generate a new token with correct secret and required claims:
```javascript
const token = jwt.sign(
  { userObjId: 'YOUR_USER_ID' },  // Required claim
  'your-jwt-secret',              // Must match server JWT_SECRET
  { algorithm: 'HS256', expiresIn: '24h' }
);
```

### 3. Tools not appearing in Claude Desktop

**Problem:** MCP server not loaded

**Solution:** 
1. Check `claude_desktop_config.json` is valid JSON
2. Restart Claude Desktop
3. Check log file if `LOG_FILE` is set
4. Verify npx can download the package

### 4. Check Logs

If you set `LOG_FILE`, check the logs:

```bash
tail -f /tmp/netadx-mcp.log
```

Example log output:
```
[2025-10-31T08:36:19.128Z] NetAdxApiClient initialized {"baseUrl":"https://api.netadx.ai"}
[2025-10-31T08:36:20.456Z] Fetching tools from NetADX AI-CORE API
[2025-10-31T08:36:21.123Z] Tools fetched successfully {"count":1}
[2025-10-31T08:36:25.789Z] Executing tool {"name":"example_tool","args":{"action":"list_items"}}
[2025-10-31T08:36:26.234Z] Tool executed successfully {"name":"example_tool","success":true}
```

## Local Development

### Install Dependencies

```bash
cd mcp-stdio-wrapper
npm install
```

### Run in Development Mode

```bash
# Set environment variables
export API_URL="https://api.netadx.ai"
export JWT_TOKEN="your-jwt-token"
export LOG_FILE="/tmp/netadx-mcp-dev.log"

# Run with tsx
npm run dev
```

### Build

```bash
npm run build
```

### Test Locally with Claude Desktop

Instead of `npx`, use local path:

```json
{
  "mcpServers": {
    "netadx-api-local": {
      "command": "node",
      "args": ["/path/to/mcp-stdio-wrapper/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:8025",
        "JWT_TOKEN": "your-dev-token",
        "LOG_FILE": "/tmp/netadx-mcp-local.log"
      }
    }
  }
}
```

## Publishing to npm

```bash
# Login to npm
npm login

# Publish (requires @netadx1ai organization access)
npm publish --access public
```

## Architecture

```
┌─────────────────┐
│ Claude Desktop  │
│   (stdio MCP)   │
└────────┬────────┘
         │ stdio protocol
         │ (JSON-RPC 2.0)
         ▼
┌─────────────────┐
│  This Wrapper   │
│  stdio → HTTP   │
└────────┬────────┘
         │ HTTP/REST
         │ (x-access-token)
         ▼
┌─────────────────┐
│  NetADX AI-CORE API v5    │
│ (HTTP MCP)      │
└─────────────────┘
```

## Security Notes

- Never commit JWT tokens to version control
- Tokens expire after configured duration (typically 1-24 hours) - generate new tokens as needed
- Store tokens securely in environment variables or credential managers
- Use HTTPS in production environments

## Support

- Issues: [GitHub Issues](https://github.com/netadx1ai/netadx-workspace/issues)
- Documentation: [NetADX AI-CORE Documentation](https://github.com/netadx1ai/netadx-workspace)
- Email: hello@netadx.ai
- Website: https://netadx.ai

## License

MIT License - See LICENSE file for details

## Changelog

**Version 2.1.3** (Current)
- Professional B2B documentation
- NetADX AI-CORE branding
- Simplified configuration examples

**Version 2.1.1**
- Updated environment variable names
- Improved error handling

**Version 2.1.0**
- Initial release with Claude Desktop support
- HTTP to stdio protocol translation
- JWT authentication support

---

**Maintained by:** NetADX Team  
**Contact:** hello@netadx.ai  
**Website:** https://netadx.ai  
**Last Updated**: 2025-01-09
