module.exports = (dbModel, sessionDoc, req) =>
  new Promise(async (resolve, reject) => {
    switch (req.method) {
      case 'PATCH':
        getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      case 'GET':
        if (req.params.param1 != undefined) {
          getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
        } else {
          getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
        }
        break
      case 'POST':
       
          if (req.params.param1) {
            if (req.params.param1 == undefined) return restError.param1(req, reject)
          }
        post(dbModel, sessionDoc, req).then(resolve).catch(reject)

        break
      case 'PUT':
        put(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      case 'DELETE':
        deleteItem(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      default:
        restError.method(req, reject)
        break
    }
  })

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.hotels
      .findOne({ _id: req.params.param1 })
      .populate(['images'])
      .then(resolve)
      .catch(reject)
  })
}

function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    const search = getSearchParams(req, { passive: false })
    console.log('getList search:', search)
    dbModel.hotels.paginate(search.filter, search.options).then(resolve).catch(reject)
  })
}

function post(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let data = req.body || {}
    data._id = undefined
    data.owner = sessionDoc.member
    let newDoc = new dbModel.hotels(data)

    if (!epValidateSync(newDoc, reject)) return
    newDoc.save().then(resolve).catch(reject)
  })
}

function put(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, reject)
    let data = req.body || {}
    delete data._id

    dbModel.hotels
      .findOne({ _id: req.params.param1 })
      .populate([{ path: 'images' }])
      .then((doc) => {
        if (dbNull(doc, reject)) {
          let newDoc = Object.assign(doc, data)

          if (!epValidateSync(newDoc, reject)) return

          newDoc.save().then(resp => {
            // (resp.images || []).forEach((e)=>{
            //   e.populate()
            // })
            resolve(resp)
          }).catch(err => {
            console.log(err)
            reject(err)
          })
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

function deleteItem(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, next)
    let data = req.body || {}
    data._id = req.params.param1

    dbModel.hotels.removeOne(sessionDoc, { _id: data._id, owner: sessionDoc.member }).then(resolve).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
