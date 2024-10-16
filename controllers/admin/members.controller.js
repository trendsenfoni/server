module.exports = (dbModel, adminSessionDoc, req) => new Promise(async (resolve, reject) => {


  switch (req.method) {
    case 'GET':
      if (req.params.param1 != undefined) {
        getOne(dbModel, adminSessionDoc, req).then(resolve).catch(reject)
      } else {
        getList(dbModel, adminSessionDoc, req).then(resolve).catch(reject)
      }
      break
    case 'POST':
      post(dbModel, adminSessionDoc, req).then(resolve).catch(reject)

      break
    case 'PUT':
      put(dbModel, adminSessionDoc, req).then(resolve).catch(reject)
      break
    case 'DELETE':
      deleteItem(dbModel, adminSessionDoc, req).then(resolve).catch(reject)
      break
    default:
      restError.method(req, reject)
      break
  }
})

function getOne(dbModel, adminSessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.members
      .findOne({ _id: req.params.param1 })
      .then(resolve)
      .catch(reject)
  })
}

function getList(dbModel, adminSessionDoc, req) {
  return new Promise((resolve, reject) => {
    let options = {
      limit: req.getValue('pageSize') || 10,
      page: req.getValue('page') || 1,
    }
    let filter = {}
    dbModel.members.paginate(filter, options).then(resolve).catch(reject)
  })
}

function post(dbModel, adminSessionDoc, req) {
  return new Promise((resolve, reject) => {
    let data = req.body || {}
    data._id = undefined
    let newDoc = new dbModel.members(data)
    if (!epValidateSync(newDoc, reject)) return

    newDoc.save().then(resolve).catch(reject)
  })
}

function put(dbModel, adminSessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (!req.params.param1) return reject(`param1 required`)
    let data = req.body || {}
    delete data._id

    dbModel.members
      .findOne({ _id: req.params.param1 })
      .then(doc => {
        if (doc) {
          let newDoc = Object.assign(doc, data)

          if (!epValidateSync(newDoc, reject)) return

          newDoc.save().then(resolve).catch(reject)
        } else {
          reject(`member not found`)
        }
      })
      .catch(reject)
  })
}

function deleteItem(dbModel, adminSessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (!req.params.param1) return reject(`param1 required`)

    dbModel.members.removeOne(adminSessionDoc, { _id: req.params.param1 }).then(resolve).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
