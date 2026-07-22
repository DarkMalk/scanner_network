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
    `Do you want to continue?, A total of ${numberFormatter.format(totalHosts)} hosts will be scanned.`,
  note: {
    title: `${colors.cyan('IPs Available')}`,
    content: IPs => IPs.join('\n')
  },
  outro: `${colors.bgWhite(colors.black(' Thanks for using '))}`
}
