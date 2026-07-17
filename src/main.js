import { intro, text, isCancel, cancel, spinner, note, outro } from '@clack/prompts'
import { messages } from './consts/messages.js'
import { pingIP } from './services/ping.js'
import { generateIPs } from './services/generate-ips.js'
import { isIPv4 } from 'node:net'
import { MAX_NETMASK, MIN_NETMASK } from './consts/netmask.js'

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
    if (isNaN(value) || Number(value) < MIN_NETMASK || Number(value) > MAX_NETMASK) {
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

for (const batch of IPs) {
  const responses = await Promise.all(batch.map(pingIP))
  responses.forEach(response =>
    typeof response !== 'undefined' ? IPsAvailable.push(response.ip) : null
  )
}

sp.stop(messages.spinner.end)

note(messages.note.content(IPsAvailable), messages.note.title)

outro(messages.outro)
