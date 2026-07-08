/**
 *
 * @param {string} ipSegment
 * @param {string} netmask
 * @returns {string[]}
 */
export function generateIPs(ipSegment, netmask) {
  const availableIPs = Math.pow(2, 32 - parseInt(netmask, 10))
  let ipBase = ipSegment
    .split('.')
    .slice(0, 3)
    .map(segment => parseInt(segment))
  const IPs = []

  let lastSegmentIp = 0
  for (let i = 1; i <= availableIPs; i++) {
    if (lastSegmentIp > 255) {
      ipBase[ipBase.length - 1]++
      lastSegmentIp = 0
    }
    IPs.push(`${ipBase.join('.')}.${lastSegmentIp}`)
    lastSegmentIp++
  }
  return IPs
}
