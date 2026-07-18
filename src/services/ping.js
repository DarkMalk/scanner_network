import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 *
 * @param {string} ip
 */
export async function pingIP(ip) {
  const { platform } = process
  const command = platform === 'win32' ? `ping -n 1 -w 100 ${ip}` : `ping -c 1 -t 100 ${ip}`

  try {
    const { stdout } = await execAsync(command)

    return {
      stdout,
      ip
    }
  } catch {
    return
  }
}
