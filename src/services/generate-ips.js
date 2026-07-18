import { generateSegmentIp } from './generate-segment-ip.js'

/**
 * Función generadora que produce IPs en lotes de tamaño `batchSize`.
 * @param {string} segmentIp - La dirección IP del segmento.
 * @param {string} netmask - La máscara de red.
 * @param {number} [batchSize=254] - Tamaño del lote de IPs a generar.
 * @returns {Generator<string[]>}
 */
export function* generateIPs(segmentIp, netmask, batchSize = 254) {
  const totalHosts = Math.pow(2, 32 - Number(netmask)) - 2 // total de IPs disponibles
  const segment = generateSegmentIp(segmentIp, netmask)
  let batch = []

  for (let i = 1; i <= totalHosts; i++) {
    batch.push(generateIpFromOffset(segment, i))
    if (batch.length === batchSize) {
      yield batch
      batch = []
    }
  }
  if (batch.length > 0) {
    yield batch
  }
}

function generateIpFromOffset(segmentIp, offset) {
  const [a, b, c, d] = segmentIp.split('.').map(Number)

  const ipToInteger =
    a * Math.pow(256, 3) + b * Math.pow(256, 2) + c * Math.pow(256, 1) + d * Math.pow(256, 0)

  const newIpInteger = ipToInteger + offset

  const newIp = []

  let x = newIpInteger
  for (let i = 0; i < 4; i++) {
    newIp.unshift(Math.floor(x % 256))
    x = x / 256
  }

  return newIp.join('.')
}
