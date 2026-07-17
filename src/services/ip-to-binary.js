import { isIPv4 } from 'node:net'

/**
 *
 * @param {string} ip
 * @returns string[]
 */
function ipToBinary(ip) {
  if (!isIPv4(ip)) {
    throw new Error('Invalid IPv4 address')
  }

  return ip.split('.').map(octet => Number(octet).toString(2).padStart(8, '0'))
}

export { ipToBinary }
