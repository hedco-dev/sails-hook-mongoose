'use strict';

module.exports = function(sails) {

  let async             = require('async');
  let utils             = require('./utils.js');
  let mongoose          = require('mongoose');
  let path              = require('path');
  let db                = mongoose.connection;
  let Schema            = global.Schema = mongoose.Schema;
  let promise           = require('bluebird');

  promise.promisifyAll(mongoose);

  Schema.createObjectId = function() {
    return mongoose.Types.ObjectId();
  };

  Schema.castToObjectId = function(stringObjectid) {
    return mongoose.Types.ObjectId(stringObjectid);
  };  

  let hook          = {
    defaults: {

      models: {
        connection: 'localMongoDb'
      },

      connections: {
        localMongoDb: {
          // url: 'mongodb://localhost:27017/testDb'
        }
      }
    },
    configure: function() {
      sails.once('lower', hook.teardown);
    },
    initialize: function(cb) {
      var modelPath = path.join(sails.config.appPath, 'api', 'models');
      let modelDefinitions = utils.loadModules(modelPath);

      if(!sails.models) {
        sails.models = {};
      }

      utils.clean(mongoose);

      async.forEachOf(modelDefinitions, function(modelDefinition, modelName, next){
        global[modelName] = sails.models[modelName] = utils.createModel(modelDefinition, modelName, mongoose, Schema);
        next();
      });

      if (sails.config.connections && sails.config.models &&
        sails.config.models.connection &&
        sails.config.connections[sails.config.models.connection].url) {
        mongoose.connect(sails.config.connections[sails.config.models.connection].url);
        db.on('error', function(err){
          cb(err);
        });

        db.once('open', function () {
          cb();
        });
      } else {
        cb(new Error('Can not find a connection to the mongo db'));
      }
    },
    teardown: function() {
      db.close();
    }
  };

  return hook;
};
