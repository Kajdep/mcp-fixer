#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing MCP Fixer Server...\n');

const serverPath = path.join(__dirname, '..', 'src', 'index.js');

// Test 1: Basic server startup
console.log('Test 1: Starting server...');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Test 2: Send initialization request
setTimeout(() => {
  console.log('Test 2: Sending initialization request...');
  
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

// Test 3: Request tools list
setTimeout(() => {
  console.log('Test 3: Requesting tools list...');
  
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  };
  
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 2000);

// Test 4: Call diagnose_mcp_config tool
setTimeout(() => {
  console.log('Test 4: Testing diagnose_mcp_config tool...');
  
  const diagnosisRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'diagnose_mcp_config',
      arguments: {}
    }
  };
  
  server.stdin.write(JSON.stringify(diagnosisRequest) + '\n');
}, 3000);

// Cleanup and results
setTimeout(() => {
  console.log('\nTest Results:');
  console.log('=============');
  
  if (errorOutput.includes('MCP Fixer Server running on stdio')) {
    console.log('✅ Server started successfully');
  } else {
    console.log('❌ Server failed to start');
    console.log('Error output:', errorOutput);
  }
  
  if (output.includes('tools')) {
    console.log('✅ Tools list request processed');
  } else {
    console.log('❌ Tools list request failed');
  }
  
  if (output.includes('diagnose_mcp_config') || output.includes('configPath')) {
    console.log('✅ Diagnostic tool executed');
  } else {
    console.log('❌ Diagnostic tool failed');
  }
  
  console.log('\nServer Output:');
  console.log(output);
  
  if (errorOutput && !errorOutput.includes('MCP Fixer Server running on stdio')) {
    console.log('\nError Output:');
    console.log(errorOutput);
  }
  
  server.kill();
  process.exit(0);
}, 5000);

server.on('error', (error) => {
  console.log('❌ Server error:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\nServer exited with code: ${code}`);
});