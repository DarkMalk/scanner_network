import { intro, text, isCancel, cancel, spinner } from '@clack/prompts'
import { messages } from './consts/messages.js'
import { generateIPs, pingIP } from './functions.js'

intro(messages.intro)

const segmentIp = await text({
  message: messages.segmentIp.message,
  placeholder: messages.segmentIp.placeholder,
  validate: value => {
    let reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!reg.test(value)) {
      return messages.segmentIp.validateMessage
    }
  }
})

if (isCancel(segmentIp)) {
  cancel(messages.canceled)
  process.exit(0)
}

const netmask = await text({
  message: messages.netmask.message,
  placeholder: messages.netmask.placeholder,
  validate: value => {
    let reg = /^(0|([1-9]|[1-2][0-9]|3[0-2]))$/
    if (!reg.test(value)) {
      return messages.netmask.validateMessage
    }
  }
})

if (isCancel(netmask)) {
  cancel(messages.canceled)
  process.exit(0)
}

const IPs = generateIPs(segmentIp, netmask)
const IPsAvailable = []

const sp = spinner()

sp.start(messages.spinner.start)
for (let ip of IPs) {
  try {
    const { error } = await pingIP(ip)
    if (error) continue
    IPsAvailable.push(ip)
  } catch (error) {
    continue
  }
}
sp.stop(messages.spinner.end)

console.table(IPsAvailable)
