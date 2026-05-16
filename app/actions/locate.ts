'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Server Action: Locate a method/function in a file
 * Used by PayloadInterpreters to find code definitions
 */
export async function locateMethodInFile(
  filePath: string,
  methodName: string
): Promise<{ line: number; content: string } | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Simple regex to find function/method declarations
    const patterns = [
      new RegExp(`function\\s+${methodName}\\s*\\(`),
      new RegExp(`const\\s+${methodName}\\s*=`),
      new RegExp(`${methodName}\\s*:\\s*function`),
      new RegExp(`${methodName}\\s*\\(`), // method shorthand
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (patterns.some(pattern => pattern.test(line))) {
        return {
          line: i + 1,
          content: line.trim()
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`[Locate] Failed to locate method ${methodName} in ${filePath}:`, error);
    return null;
  }
}

// Made with Bob
