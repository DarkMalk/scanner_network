import { ipToBinary } from './ip-to-binary.js'
import { subnetmaskToBinary } from './subnetmask-to-binary.js'

export function generateSegmentIp(ip, netmask) {
  const ipBinary = ipToBinary(ip)
  const subnetmaskBinary = subnetmaskToBinary(netmask)

  const networkBinary = ipBinary.map((octet, index) => {
    const andResult = parseInt(octet, 2) & parseInt(subnetmaskBinary[index], 2)
    return andResult.toString(2).padStart(8, '0')
  })

  return networkBinary.map(octet => parseInt(octet, 2)).join('.')
}
