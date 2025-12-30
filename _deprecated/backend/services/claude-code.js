import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const PERSONALOS_PATH = process.env.PERSONALOS_PATH || `${process.env.HOME}/PersonalOS`;

/**
 * Execute a Claude Code slash command
 */
export async function executeCommand(command) {
  return new Promise((resolve, reject) => {
    const process = spawn('opencode', ['prompt', command], {
      cwd: PERSONALOS_PATH,
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Command failed: ${stderr}`));
      }
    });

    setTimeout(() => {
      process.kill();
      reject(new Error('Command timed out'));
    }, 60000);
  });
}

/**
 * Send a message to Claude Code
 */
export async function sendChatMessage(message, sessionId = null) {
  // For now, use opencode prompt directly
  // In the future, could implement session management
  return new Promise((resolve, reject) => {
    const fullPrompt = `${message}\n\nContext: You have access to all PersonalOS files.`;

    const claudeProcess = spawn('opencode', ['prompt', fullPrompt], {
      cwd: PERSONALOS_PATH,
      env: process.env
    });

    let response = '';
    let error = '';

    claudeProcess.stdout.on('data', (data) => {
      response += data.toString();
    });

    claudeProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    claudeProcess.on('close', (code) => {
      if (code === 0) {
        const newSessionId = sessionId || `session-${Date.now()}`;
        resolve({
          response: response.trim(),
          sessionId: newSessionId
        });
      } else {
        reject(new Error(`Chat failed: ${error}`));
      }
    });

    setTimeout(() => {
      claudeProcess.kill();
      reject(new Error('Chat timed out'));
    }, 60000);
  });
}

/**
 * Load today's briefing
 */
export async function loadTodaysBriefing() {
  const today = new Date().toISOString().split('T')[0];
  const briefingPath = path.join(PERSONALOS_PATH, 'briefings', `${today}.json`);

  try {
    const content = await fs.readFile(briefingPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Read a PersonalOS file
 */
export async function readFile(relativePath) {
  const fullPath = path.join(PERSONALOS_PATH, relativePath);
  return await fs.readFile(fullPath, 'utf-8');
}

/**
 * Write a PersonalOS file
 */
export async function writeFile(relativePath, content) {
  const fullPath = path.join(PERSONALOS_PATH, relativePath);
  await fs.writeFile(fullPath, content, 'utf-8');
}
