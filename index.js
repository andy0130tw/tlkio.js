import fs from 'fs'
import util from 'util'
import readline from 'readline'

if (!process.env['SESSION_TOKEN']) {
  // process.stderr.write('For now, all requests should be authenticated with a valid session token.\n')
  process.stderr.write('WARNING: You have not set a session token.\n')
  // process.exit(1)
}

import {TlkioHttpApi} from './src/http-api'

const api = new TlkioHttpApi()

function writePayload(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('line', async rawRequest => {
  process.stderr.write(`LOG: request: ${util.inspect(rawRequest)}\n`)

  let request
  try {
    request = JSON.parse(rawRequest)
  } catch (e) {
    writePayload({ ok: false, body: 'invalid payload', nickname: 'Owo' })
    return
  }

  try {
    const chat_id = parseInt(request.chat_id)
    let limit = request.limit
    if (!(limit > 0 || limit <= 1000)) {
      limit = 50
    }

    const history = api.getAllHistoryEntries(chat_id)
    for await (const ent of history) {
      writePayload({ id: request.id, data: ent })
      if (limit <= 0) return
      limit--
    }
  } catch (e) {
    writePayload({ ok: false, body: 'internal error: ' + e.message, nickname: 'Owo' })
    return
  }
})

rl.on('close', () => {
  process.stderr.write('Bye!\n')
})
