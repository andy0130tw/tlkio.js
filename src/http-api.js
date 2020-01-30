import _rp from 'request-promise'

export class TlkioHttpApi {
  constructor(prefix = 'https://tlk.io/api/chats',
              msgLimit = 50) {
    this.prefix = prefix
    this.msgLimit = msgLimit

    this.session = _rp.defaults({
      json: true
    })
    // token -> user meta
    this.userBase = new Map()
  }

  _requestHistory(id, before_id) {
    if (before_id != null) {
      return this.session.get(`${this.prefix}/${id}/messages?before_id=${before_id}`)
    } else {
      return this.session.get(`${this.prefix}/${id}/messages`)
    }
  }

  async* getAllHistoryEntries(id, initial_before_id) {
    let before_id = initial_before_id
    while (1) {
      let cnt = 0
      const entries = await this._requestHistory(id, before_id)
      let next_before_id
      entries.reverse()
      for (const ent of entries) {
        yield ent
        cnt += 1

        // the last will be our next id due to reverse
        // it is safe to overwrite it, though
        next_before_id = ent.id
      }
      if (cnt < this.msgLimit) {
        return
      }
      before_id = next_before_id
    }
  }
}
