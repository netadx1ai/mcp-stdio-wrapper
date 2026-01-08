#!/usr/bin/env node

/**
 * NetADX AI-CORE MCP Stdio Wrapper
 * 
 * This wrapper translates between stdio MCP protocol (used by Claude Desktop)
 * and HTTP-based NetADX AI-CORE API servers.
 * 
 * Usage in Claude Desktop claude_desktop_config.json:
 * 
 * {
 *   "mcpServers": {
 *     "netadx-aicore": {
 *       "command": "npx",
 *       "args": ["-y", "@netadx1ai/mcp-stdio-wrapper@latest"],
 *       "env": {
 *         "API_URL": "https://api.your-domain.com",
 *         "JWT_TOKEN": "your-jwt-token-here"
 *       }
 *     }
 *   }
 * }
 * 
 * @author NetADX AI-CORE Team
 * @version 2.1.3
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { appendFileSync } from 'fs';

/**
 * Configuration from environment variables
 */
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:8005',
  jwtToken: process.env.JWT_TOKEN || '',
  logFile: process.env.LOG_FILE,
};

/**
 * Validate configuration
 */
if (!config.jwtToken) {
  console.error('ERROR: JWT_TOKEN environment variable is required');
  console.error('Usage: Set JWT_TOKEN in your Claude Desktop config');
  process.exit(1);
}

/**
 * Logger - writes to file if LOG_FILE is set, otherwise silent
 */
const logger = {
  log: (message: string, ...args: any[]) => {
    if (config.logFile) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message} ${args.map(a => JSON.stringify(a)).join(' ')}\n`;
      appendFileSync(config.logFile, logMessage);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (config.logFile) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ERROR: ${message} ${args.map(a => JSON.stringify(a)).join(' ')}\n`;
      appendFileSync(config.logFile, logMessage);
    }
  },
};

/**
 * HTTP client for NetADX API
 */
class NetAdxApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, token: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    logger.log('NetAdxApiClient initialized', { baseUrl });
  }

  /**
   * List all available tools from NetADX AI-CORE API
   */
  async listTools(): Promise<Tool[]> {
    try {
      logger.log('Fetching tools from NetADX AI-CORE API');
      const response = await this.client.get('/tools');
      
      if (!response.data || !response.data.tools) {
        throw new Error('Invalid response from NetADX AI-CORE API: missing tools array');
      }

      // Transform API tool format to MCP Tool format
      const tools: Tool[] = response.data.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.parameters || {
          type: 'object',
          properties: {},
        },
      }));

      logger.log('Tools fetched successfully', { count: tools.length });
      return tools;
    } catch (error) {
      logger.error('Failed to fetch tools', error);
      throw new Error(`Failed to fetch tools from NetADX AI-CORE API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a tool on NetADX AI-CORE API
   */
  async executeTool(name: string, args: any): Promise<any> {
    try {
      logger.log('Executing tool', { name, args });
      
      const response = await this.client.post(`/tools/${name}`, args);

      if (!response.data) {
        throw new Error('Invalid response from NetADX AI-CORE API: missing data');
      }

      logger.log('Tool executed successfully', { name, success: response.data.success });
      return response.data;
    } catch (error) {
      logger.error('Tool execution failed', { name, error });
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed: Invalid or expired JWT token');
        }
        if (error.response?.status === 404) {
          throw new Error(`Tool '${name}' not found on NetADX AI-CORE API`);
        }
        if (error.response?.data) {
          throw new Error(`NetADX AI-CORE API error: ${JSON.stringify(error.response.data)}`);
        }
      }
      
      throw new Error(`Failed to execute tool: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Main server setup
 */
async function main() {
  logger.log('Starting NetADX AI-CORE MCP stdio wrapper', config);

  // Create NetADX AI-CORE API client
  const netadxClient = new NetAdxApiClient(config.apiUrl, config.jwtToken);

  // Create MCP server
  const server = new Server(
    {
      name: 'netadx-aicore-stdio-wrapper',
      version: '2.1.3',
      description: 'NetADX AI-CORE MCP stdio wrapper - enables Claude Desktop integration with HTTP-based MCP servers',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * List tools handler
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.log('Handling ListTools request');
    
    try {
      const tools = await netadxClient.listTools();
      return { tools };
    } catch (error) {
      logger.error('ListTools failed', error);
      throw error;
    }
  });

  /**
   * Call tool handler
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    logger.log('Handling CallTool request', { name, args });

    try {
      const result = await netadxClient.executeTool(name, args || {});

      // Format response for MCP protocol
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      logger.error('CallTool failed', { name, error });
      
      // Return error in MCP format
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  /**
   * Error handler
   */
  server.onerror = (error) => {
    logger.error('Server error', error);
  };

  /**
   * Connect to stdio transport
   */
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.log('NetADX AI-CORE MCP stdio wrapper started successfully');

  // Keep process alive
  process.on('SIGINT', async () => {
    logger.log('Received SIGINT, shutting down');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM, shutting down');
    await server.close();
    process.exit(0);
  });
}

// Run the server
main().catch((error) => {
  logger.error('Fatal error', error);
  console.error('Fatal error:', error);
  process.exit(1);
});
