import { intro, text, isCancel, cancel, spinner, note, outro } from '@clack/prompts'
import { messages } from './consts/messages.js'
import { generateIPs, pingIP } from './functions.js'
import { regValidateNetmask } from './consts/regex.js'
import { isIPv4 } from 'node:net'

intro(messages.intro)

const segmentIp = await text({
  message: messages.segmentIp.message,
  placeholder: messages.segmentIp.placeholder,
  validate: value => {
    if (!isIPv4(value)) {
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

note(messages.note.content(IPsAvailable), messages.note.title)

outro(messages.outro)
