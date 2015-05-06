'use strict';
/* jslint node: true */
/* global describe, it */

var expect = require('expect.js');

describe('map-obj-lib', function (done) {
  var MapObjLib = require(__dirname + '/../index.js');

  it('should map objects by dot notation', function (done) {
    var obj = {
      simpleProperty: 42,
      complexProperty: {
        child: 126
      }
    };

    var map = {
      flattern: 'complexProperty.child',
      explode: {
        child: 'simpleProperty'
      }
    };

    var objMap = new MapObjLib(map);
    objMap.map(obj, function(error, result) {
      expect(error).to.not.be.ok();
      expect(result).to.eql({
        flattern: 126,
        explode: {
          child: 42
        }
      });
      done();
    });
  });

  it('should ignore empty (null) values', function (done) {
    var obj = {
      simpleProperty: 42,
      complexProperty: {
        child: 126
      }
    };

    var map = {
      flattern: 'complexPropertyNULL.child',
      explode: {
        child: 'simplePropertyNULL'
      },
      some: 'simpleProperty'
    };

    var objMap = new MapObjLib(map, { strictMode: MapObjLib.STRICT_OFF });
    objMap.map(obj, function(error, result) {
      expect(error).to.not.be.ok();
      expect(result).to.eql({
        some: 42
      });
      done();
    });
  });

  it('should ignore empty (undefined) values on method call', function (done) {
    var obj = {
      undefinedProperty: function (_obj, options, callback) {
        callback();
      }
    };

    var map = {
      some: 'undefinedProperty'
    };

    var objMap = new MapObjLib(map, { strictMode: MapObjLib.STRICT_OFF });
    objMap.map(obj, function(error, result) {
      expect(error).to.not.be.ok();
      expect(result).to.eql(null);
      done();
    });
  });

  it('should\'nt ignore empty (null) values on strict mode', function (done) {
    var obj = {
      simpleProperty: 42,
      complexProperty: {
        child: 126
      }
    };

    var map = {
      flattern: 'complexPropertyNULL.child',
      explode: {
        child: 'simplePropertyNULL'
      }
    };

    var objMap = new MapObjLib(map, { strictMode: MapObjLib.STRICT_ON });
    objMap.map(obj, function(error, result) {
      expect(error).to.be.ok();
      expect(result).to.not.be.ok();
      done();
    });
  });

  it('should map by provided context "$"-prefix', function (done) {
    var obj = {
      simpleProperty: 42,
      complexProperty: {
        child: 126
      }
    };

    var context = {
      contextProp: 23
    };

    var map = {
      flattern: 'complexProperty.child',
      explode: {
        child: '$contextProp'
      }
    };

    var objMap = new MapObjLib(map, { context: context });
    objMap.map(obj, function(error, result) {
      expect(error).to.not.be.ok();
      expect(result).to.eql({
        flattern: 126,
        explode: {
          child: 23
        }
      });
      done();
    });
  });

  it('should call a function, when provided', function (done) {
    var functionPropertyCalled = false;
    var contextFunctionCalled = true;

    var obj = {
      simpleProperty: 42,
      functionProperty: function (_obj, options, callback) {
        expect(_obj).to.be(obj);
        expect(options.context).to.be(context);
        functionPropertyCalled = true;
        callback(null, 126);
      }
    };

    var context = {
      contextFunction: function (_obj, options, callback) {
        expect(_obj).to.be(obj);
        expect(options.context).to.be(context);
        contextFunctionCalled = true;
        callback(null, 23);
      }
    };

    var map = {
      flattern: 'functionProperty',
      explode: {
        child: '$contextFunction'
      }
    };

    var objMap = new MapObjLib(map, { context: context });
    objMap.map(obj, function(error, result) {
      expect(error).to.not.be.ok();
      expect(result).to.eql({
        flattern: 126,
        explode: {
          child: 23
        }
      });
      expect(functionPropertyCalled).to.be.ok();
      expect(contextFunctionCalled).to.be.ok();
      done();
    });
  });

  it('should get a value by it\'s path', function () {
    var obj = {
      value1: 'a',
      value2: {
        value21: 'b'
      }
    };

    expect(MapObjLib.getByPath('value1', obj)).to.be('a');
    expect(MapObjLib.getByPath('value2.value21', obj)).to.be('b');
    expect(MapObjLib.getByPath('value3', obj)).to.not.be.ok();
  });

  it('should always return a new MapObjLib', function () {
    var cMapObjLib = MapObjLib;
    expect(cMapObjLib()).to.be.a(MapObjLib);
  });
});
