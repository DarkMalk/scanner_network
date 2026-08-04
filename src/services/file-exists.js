import { constants, access } from 'node:fs/promises'
import { join } from 'node:path'

/**
 *
 * @param {string} directoryPath Ruta absoluta del archivo
 * @param {string} filename nombre del archivo
 * @returns {Promise<{ exists: boolean, pathFile: string | null }>}
 */
const fileExists = async (directoryPath, filename) => {
  const pathFile = join(directoryPath, filename)

  try {
    await access(pathFile, constants.F_OK)
    return { exists: true, pathFile }
  } catch {
    return { exists: false, pathFile: null }
  }
}

export { fileExists }
