'use strict';
let timestamps = require('mongoose-timestamp');
let includeAll = require('include-all');

let loadModules = function(relPath) {
  return includeAll({
    dirname: require('path').resolve(__dirname, relPath),
    filter: /(.+)\.js$/
  }) || {};
};

// let createdbyplugin = function(schema, options) {
//   schema.add({
//     createdUser: String
//   });
//
//   schema.pre('save', function(next) {
//     // this.createdUser = helpdeskNamespace.get('userId');
//     next();
//   });
// };

let createModel = function(modelDefinition, modelName, mongoose, Schema) {
  let modelSchema = Schema(modelDefinition.attributes, {autoIndex: false});

  modelSchema.methods.toJSON = function() {
    let obj = this.toObject();
    delete obj.__v;

    if (obj._id) {
      obj.id = obj._id.toString();
    }

    return obj;
  };

  for (let methodName in modelDefinition.methods) {
    let method = modelDefinition.methods[methodName];
    modelSchema.methods[methodName] = method;
  }

  for (let methodName in modelDefinition.statics) {
    let method = modelDefinition.statics[methodName];
    modelSchema.statics[methodName] = method;
  }

  modelSchema.plugin(timestamps);
  // modelSchema.plugin(createdbyplugin);

  let model = mongoose.model(modelName, modelSchema);

  for(let propertyName in modelDefinition) {
    if(propertyName !== 'attributes' && propertyName !== 'methods' && propertyName !== 'statics') {
      model[propertyName] = modelDefinition[propertyName];
    }
  }

  return model;
};

function clean(mongoose){
  for(let modelName in mongoose.models) {
    delete mongoose.models[modelName];
  }

  for(let schemaName in mongoose.modelSchemas) {
    delete mongoose.modelSchemas[schemaName];
  }
}

module.exports = {
  loadModules,
  createModel,
  clean
};
