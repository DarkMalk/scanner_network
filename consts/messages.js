import colors from 'picocolors'

export const messages = {
  // eslint-disable-next-line quotes
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
    validateMessage: 'Please insert netmask in range 0-32'
  },
  canceled: 'Operation Canceled',
  spinner: {
    start: `${colors.cyan('Scanning network')}`,
    end: `${colors.cyan('Finalice scanning')}`
  },
  note: {
    title: `${colors.cyan('IPs Available')}`,
    content: IPs => IPs.join('\n')
  },
  outro: `${colors.bgWhite(colors.black(' Thanks for using '))}`
}
