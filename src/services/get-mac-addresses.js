import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import { isIPv4 } from 'node:net'
import { platform } from 'node:os'

const execAsync = promisify(exec)

/**
 *
 * @param {string} ip IPv4 a recuperar dirección MAC
 * @returns {Promise<{ success: boolean, data: { ip: string, mac: string } | null }>}
 */
const getMACAddresses = async ip => {
  if (!isIPv4(ip)) {
    throw new Error('Is not IPv4 valid')
  }

  const os = platform()

  const commands = {
    darwin: ip => `arp -n ${ip}`,
    linux: ip => `ip neighbor show ${ip}`,
    win32: ip => `arp -a ${ip}`
  }

  const command = commands[os]

  if (!command) {
    throw new Error(`Platform "${os}" is not supported`)
  }

  try {
    const { stdout } = await execAsync(command(ip))

    const mac = parseMacAddress(stdout) ?? 'N/A'

    return { success: true, data: { ip, mac } }
  } catch {
    return { success: false, data: null }
  }
}

const parseMacAddress = stdout => {
  const os = platform()

  if (os === 'darwin') {
    const match = stdout.match(/at\s+([0-9a-f]{1,2}(?::[0-9a-f]{1,2}){5})/i)
    return match?.[1]
  }

  if (os === 'linux') {
    const match = stdout.match(/lladdr\s+([0-9a-f]{1,2}(?::[0-9a-f]{1,2}){5})/i)
    return match?.[1]
  }

  if (os === 'win32') {
    const match = stdout.match(/\b([0-9a-f]{2}(?:-[0-9a-f]{2}){5})\b/i)
    return match?.[1]
  }

  return undefined
}

export { getMACAddresses }
