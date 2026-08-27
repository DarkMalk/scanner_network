import { reverse } from 'node:dns/promises'
import { isIPv4 } from 'node:net'

/**
 * Resuelve el hostname de una dirección IPv4 mediante DNS inverso.
 * @param {string} ip - Dirección IPv4 a resolver.
 * @param {number} [timeout=100] - Tiempo máximo de espera en ms.
 * @returns {Promise<{ success: boolean, data: { ip: string, hostname: string } | null }>}
 */
const getHostname = async (ip, timeout = 100) => {
  if (!isIPv4(ip)) {
    return { success: false, data: null }
  }

  try {
    const [hostname] = await Promise.race([
      reverse(ip),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), timeout))
    ])

    return { success: true, data: { ip, hostname } }
  } catch {
    return { success: false, data: null }
  }
}

export { getHostname }
