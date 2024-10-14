const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      username: { type: String, required: true, unique: true },
      email: { type: String, default: null, index: true },
      phoneNumber: { type: String, default: null, index: true },
      password: { type: String, default: null, index: true, select: false },
      role: { type: String, default: 'user' },
      title: { type: String, default: '', index: true },
      fullName: { type: String, index: true },
      firstName: { type: String, default: '', index: true },
      lastName: { type: String, default: '', index: true },
      gender: { type: String, default: '', enum: ['', 'male', 'female', 'other'] },
      dateOfBirth: { type: String, default: '2000-01-01', min: 10, max: 10 },
      location: { type: String, default: '' },
      image: { type: String, default: '' },
      bio: { type: String, default: '' },
      links: [{ type: String }],
      married: { type: Boolean, default: false },
      children: { type: Number, default: 0 },
      targets: [{
        startDate: { type: String, required: true, min: 10, max: 10, index: true },
        endDate: { type: String, required: true, min: 10, max: 10, index: true },
        annualIncome: { type: Number, required: true, index: true },
        hourlyWage: { type: Number, required: true, index: true },
        currency: { type: String, required: true, index: true },
      }],
      passive: { type: Boolean, default: false, index: true, select: false },

    },
    { versionKey: false, timestamps: true }
  )

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (member, filter) => sendToTrash(dbModel, collectionName, member, filter)
  return model
}
