import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'

/**
 * @param {string} routeToExport Ruta absoluta del directorio donde se exportara el archivo CSV
 * @param {string} filename Nombre del archivo
 * @param {string} content Contenido del archivo
 * @returns {Promise<{ success: boolean, filePath: string | null }>}
 */
const exportCSV = async (routeToExport, filename, content) => {
  const filePath = join(routeToExport, filename)

  try {
    await writeFile(filePath, content, { encoding: 'utf-8' })
    return { success: true, filePath }
  } catch {
    return { success: false, filePath: null }
  }
}

export { exportCSV }
