module.exports = (dbModel, adminSessionDoc, req) => new Promise(async (resolve, reject) => {


  switch (req.method) {
    case 'GET':
      getOne(dbModel, adminSessionDoc, req).then(resolve).catch(reject)

      break
    case 'PUT':
      put(dbModel, adminSessionDoc, req).then(resolve).catch(reject)
      break
    default:
      restError.method(req, reject)
      break
  }
})

function getOne(dbModel, adminSessionDoc, req) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!req.params.param1) return reject(`param1 required`)
      const memberDoc = await dbModel.members.findOne({ _id: req.params.param1 })
      if (!memberDoc) return reject(`member not found`)
      dbModel.settings
        .findOne({ member: memberDoc._id })
        .then(async settingDoc => {
          if (!settingDoc) {
            settingDoc = new dbModel.settings({ member: memberDoc._id })
            settingDoc = await settingDoc.save()
          }
          settingDoc = settingDoc.populate(['member'])
          resolve(settingDoc)
        })
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}


function put(dbModel, adminSessionDoc, req) {
  return new Promise(async (resolve, reject) => {
    if (!req.params.param1) return reject(`param1 required`)
    let data = req.body || {}
    delete data._id

    const memberDoc = await dbModel.members.findOne({ _id: req.params.param1 })
    if (!memberDoc) return reject(`member not found`)

    data.member = memberDoc._id

    dbModel.settings
      .findOne({ member: memberDoc._id })
      .then(async doc => {
        let settingDoc = null
        if (!doc) {
          settingDoc = new dbModel.settings(data)
        } else {
          settingDoc = Object.assign(doc, data)
        }


        if (!epValidateSync(settingDoc, reject)) return

        settingDoc.save().then(doc => {
          doc = doc.populate(['member'])
          resolve(doc)
        }).catch(reject)

      })
      .catch(reject)
  })
}
