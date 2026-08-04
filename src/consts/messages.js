import { numberFormatter } from '../utils/number-formatter.js'
import colors from 'picocolors'

export const messages = {
  intro: `${colors.bgWhite(colors.black(" Scan active PC's in network "))}${colors.bgCyan(
    colors.black(' @DarkMalk ')
  )}`,
  segmentIp: {
    message: `${colors.cyan('Insert IP segment')}`,
    placeholder: '192.168.1.0',
    validateMessage: 'Please insert valid Ip segment'
  },
  netmask: {
    message: `${colors.cyan('Insert Netmask')}`,
    placeholder: '24',
    validateMessage: 'Please insert netmask in range 1-32'
  },
  canceled: 'Operation Canceled',
  progress: {
    start: (ipComplete, totalHosts) =>
      `${colors.cyan(`Scanning network: ${numberFormatter.format(ipComplete)} of ${numberFormatter.format(totalHosts)}`)}`,
    end: `${colors.cyan('Finalice scanning')}`
  },
  confirmScan: totalHosts =>
    `${colors.cyan(`Do you want to continue?, A total of ${numberFormatter.format(totalHosts)} hosts will be scanned.`)}`,
  note: {
    title: `${colors.cyan('IPs Available')}`,
    content: IPs => IPs.join('\n'),
    noContent: 'No active IPs have been detected in the segment'
  },
  exportFile: {
    confirmExport: colors.cyan('Do you want export data to CSV file?'),
    confirmEmptyExport: colors.cyan('No active IPs found, export empty CSV anyway?'),
    directoryMessage: colors.cyan('Select path to export file'),
    fileName: {
      message: colors.cyan('Enter a CSV file name'),
      placeholder: 'Example: ActiveIPs.csv',
      validateMessage: {
        required: 'Please enter a file name',
        empty: 'File name cannot be empty',
        format: 'Use only letters and end with .csv'
      }
    },
    overwriteConfirm: filePath =>
      colors.cyan(`The file ${colors.white(filePath)} already exists. Overwrite it?`),
    successExport: filePath => `${colors.cyan('File is exported in')} ${colors.white(filePath)}`,
    errorExport: 'Error on export file'
  },
  outro: `${colors.bgWhite(colors.black(' Thanks for using '))}`
}
