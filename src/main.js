import {
  intro,
  text,
  isCancel,
  cancel,
  note,
  outro,
  confirm,
  path,
  log,
  tasks
} from '@clack/prompts'
import { messages } from './consts/messages.js'
import { pingIP } from './services/ping.js'
import { generateIPs } from './utils/generate-ips.js'
import { isIPv4 } from 'node:net'
import { MAX_NETMASK, MIN_NETMASK } from './consts/netmask.js'
import { FILE_NAME_REGEX } from './consts/file-name.js'
import { homedir } from 'node:os'
import { generateCSV } from './utils/generate-csv.js'
import { exportCSV } from './services/export-csv.js'
import { fileExists } from './services/file-exists.js'
import { getMACAddresses } from './services/get-mac-addresses.js'
import { getHostname } from './services/get-hostname.js'
import { generateHostnameBatches } from './utils/generate-hostname-batches.js'

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

await tasks([
  {
    title: messages.tasks.discoveryHosts.start(0, totalHosts),
    task: async message => {
      let ipComplete = 0

      for (const batch of generateBatch()) {
        const responses = await Promise.all(
          batch.map(ip => {
            const promise = pingIP(ip)
            promise.finally(() => {
              ipComplete++
              message(messages.tasks.discoveryHosts.start(ipComplete, totalHosts))
            })
            return promise
          })
        )
        responses.forEach(
          response =>
            response.success && IPsAvailable.push({ ip: response.ip, mac: null, hostname: null })
        )
      }

      return messages.tasks.discoveryHosts.end(IPsAvailable.length)
    }
  },
  {
    title: messages.tasks.discoveryMAC.start(0, IPsAvailable.length),
    task: async message => {
      let macComplete = 0

      const responses = await Promise.all(
        IPsAvailable.map(host => {
          const promise = getMACAddresses(host.ip)
          promise.finally(() => {
            macComplete++
            message(messages.tasks.discoveryMAC.start(macComplete, IPsAvailable.length))
          })

          return promise
        })
      )

      responses.forEach(
        res =>
          res.success &&
          IPsAvailable.forEach((host, index) => {
            if (host.ip === res.data.ip) {
              IPsAvailable[index] = { ...IPsAvailable[index], mac: res.data.mac }
            }
          })
      )

      return messages.tasks.discoveryMAC.end(
        IPsAvailable.filter(value => value.mac !== 'N/A').length
      )
    }
  },
  {
    title: messages.tasks.discoveryHostname.start(0, IPsAvailable.length),
    task: async message => {
      let complete = 0

      for (const batch of generateHostnameBatches(IPsAvailable)) {
        const responses = await Promise.all(batch.map(host => getHostname(host.ip)))

        responses.forEach(res => {
          if (res.success) {
            const index = IPsAvailable.findIndex(h => h.ip === res.data.ip)
            if (index !== -1) {
              IPsAvailable[index].hostname = res.data.hostname
            }
          }
          complete++
          message(messages.tasks.discoveryHostname.start(complete, IPsAvailable.length))
        })
      }

      return messages.tasks.discoveryHostname.end(
        IPsAvailable.filter(h => h.hostname !== null).length
      )
    }
  }
])

if (IPsAvailable.length > 0) {
  note(
    messages.note.content(
      IPsAvailable.map(val => `${val.ip} - ${val.mac} - ${val.hostname ?? 'N/A'}`)
    ),
    messages.note.title
  )
} else {
  note(messages.note.noContent, messages.note.title)
}

const confirmExport = await confirm({
  message:
    IPsAvailable.length > 0
      ? messages.exportFile.confirmExport
      : messages.exportFile.confirmEmptyExport
})

if (isCancel(confirmExport)) {
  cancel(messages.canceled)
  process.exit(0)
}

if (confirmExport) {
  const directoryToExport = await path({
    message: messages.exportFile.directoryMessage,
    directory: true,
    root: homedir()
  })

  if (isCancel(directoryToExport)) {
    cancel(messages.canceled)
    process.exit(0)
  }

  const fileName = await text({
    message: messages.exportFile.fileName.message,
    placeholder: messages.exportFile.fileName.placeholder,
    validate: value => {
      if (!value) {
        return messages.exportFile.fileName.validateMessage.required
      }

      if (!value.trim()) {
        return messages.exportFile.fileName.validateMessage.empty
      }

      if (!FILE_NAME_REGEX.test(value)) {
        return messages.exportFile.fileName.validateMessage.format
      }
    }
  })

  if (isCancel(fileName)) {
    cancel(messages.canceled)
    process.exit(0)
  }

  const existingFile = await fileExists(directoryToExport, fileName)

  if (existingFile.exists) {
    const confirmOverwrite = await confirm({
      message: messages.exportFile.overwriteConfirm(existingFile.pathFile),
      initialValue: false
    })

    if (isCancel(confirmOverwrite) || !confirmOverwrite) {
      cancel(messages.canceled)
      process.exit(0)
    }
  }

  const csvContent = generateCSV(
    ['Active IPs', 'MAC', 'Hostname'],
    IPsAvailable.flatMap(value => Object.values(value))
  )

  const result = await exportCSV(directoryToExport, fileName, csvContent)

  if (result.success) {
    log.success(messages.exportFile.successExport(result.filePath))
  } else {
    log.error(messages.exportFile.errorExport)
  }
}

outro(messages.outro)
