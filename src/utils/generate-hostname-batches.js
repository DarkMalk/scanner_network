/**
 * Generador que produce lotes de hosts para resolver hostnames.
 * @param {Array<{ip: string}>} hosts - Lista de hosts a procesar.
 * @param {number} [batchSize=50] - Tamaño del lote.
 * @returns {Generator<Array<{ip: string}>>}
 */
export function* generateHostnameBatches(hosts, batchSize = 50) {
  let batch = []

  for (const host of hosts) {
    batch.push(host)
    if (batch.length === batchSize) {
      yield batch
      batch = []
    }
  }
  if (batch.length > 0) {
    yield batch
  }
}
