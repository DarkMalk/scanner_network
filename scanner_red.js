import { intro, text, isCancel, cancel, spinner } from '@clack/prompts'
import { messages } from './consts/messages.js'
import { generateIPs, pingIP } from './functions.js'
import { regValidateIPv4, regValidateNetmask } from './consts/regex.js'

intro(messages.intro)

const segmentIp = await text({
  message: messages.segmentIp.message,
  placeholder: messages.segmentIp.placeholder,
  validate: value => {
    if (!regValidateIPv4.test(value)) {
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
    if (!regValidateNetmask.test(value)) {
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

await Promise.all(IPs.map(pingIP)).then(array => {
  array.forEach(result => {
    if (!result?.stdout) return
    IPsAvailable.push(result.ip)
  })
})

sp.stop(messages.spinner.end)

console.table(IPsAvailable)
