/**
 * Client-safe Method Locator Stub
 * Code method location is handled local-first via client-side search tools in PWA static builds
 */
export async function locateMethodInFile(
  filePath: string,
  methodName: string
): Promise<{ success: boolean; line: number; content: string }> {
  console.warn('[Locate] locateMethodInFile is not available in static client builds.');
  return {
    success: false,
    line: 0,
    content: ''
  };
}
