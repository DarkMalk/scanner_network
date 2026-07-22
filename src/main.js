import { intro, text, isCancel, cancel, note, outro, progress, confirm } from '@clack/prompts'
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

const { totalHosts, generateBatch } = generateIPs(segmentIp, netmask)
const IPsAvailable = []

const confirmScan = await confirm({
  message: messages.confirmScan(totalHosts)
})

if (!confirmScan || isCancel(confirmScan)) {
  cancel(messages.canceled)
  process.exit(0)
}

const prog = progress({
  indicator: 'timer',
  style: 'block',
  max: totalHosts,
  cancelMessage: messages.canceled
})

let ipComplete = 0

prog.start(messages.progress.start(ipComplete, totalHosts))

for (const batch of generateBatch()) {
  const responses = await Promise.all(
    batch.map(ip => {
      const promise = pingIP(ip)
      promise.finally(() => {
        prog.advance()
        ipComplete++
        prog.message(messages.progress.start(ipComplete, totalHosts))
      })
      return promise
    })
  )
  responses.forEach(response =>
    typeof response !== 'undefined' ? IPsAvailable.push(response.ip) : null
  )
}

prog.stop(messages.progress.end)

note(messages.note.content(IPsAvailable), messages.note.title)

outro(messages.outro)
