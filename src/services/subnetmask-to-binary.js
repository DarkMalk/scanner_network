import { MAX_NETMASK, MIN_NETMASK } from '../consts/netmask.js'

/**
 *
 * @param {string} netmask
 * @returns string[]
 */
function subnetmaskToBinary(netmask) {
  if (netmask < MIN_NETMASK || netmask > MAX_NETMASK) {
    throw new Error('Invalid netmask')
  }

  return '1'
    .repeat(netmask)
    .padEnd(32, '0')
    .match(/.{1,8}/g)
}

export { subnetmaskToBinary }
