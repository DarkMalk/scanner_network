/**
 *
 * @param {string[]} columns Array con los nombres de las columnas para el archivo CSV
 * @param {string[]} data Array con los datos correspondientes para el archivo CSV
 * @returns string
 */
const generateCSV = (columns, data) => {
  let text = columns.join(',') + `\n`
  let line = []

  for (let i = 0; i < data.length; i++) {
    line.push(data[i])

    if (line.length === columns.length) {
      text += line.join(',') + '\n'

      line = []
    }
  }

  return text
}

export { generateCSV }
