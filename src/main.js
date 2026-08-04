import {
  intro,
  text,
  isCancel,
  cancel,
  note,
  outro,
  progress,
  confirm,
  path,
  log
} from '@clack/prompts'
import { messages } from './consts/messages.js'
import { pingIP } from './services/ping.js'
import { generateIPs } from './services/generate-ips.js'
import { isIPv4 } from 'node:net'
import { MAX_NETMASK, MIN_NETMASK } from './consts/netmask.js'
import { FILE_NAME_REGEX } from './consts/file-name.js'
import { homedir } from 'node:os'
import { generateCSV } from './utils/generate-csv.js'
import { exportCSV } from './services/export-csv.js'
import { fileExists } from './services/file-exists.js'

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

if (IPsAvailable.length > 0) {
  note(messages.note.content(IPsAvailable), messages.note.title)
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

  const csvContent = generateCSV(['Active IPs'], IPsAvailable)

  const result = await exportCSV(directoryToExport, fileName, csvContent)

  if (result.success) {
    log.success(messages.exportFile.successExport(result.filePath))
  } else {
    log.error(messages.exportFile.errorExport)
  }
}

outro(messages.outro)
