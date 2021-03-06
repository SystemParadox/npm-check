'use strict';

var q = require('q');
var RegistryClient = require('npm-registry-client');
var npmConf = require('npmconf');
var os = require('os');
var path = require('path');

function noop () {}
var noop_log = {
    error: noop,
    warn: noop,
    info: noop,
    verbose: noop,
    silly: noop,
    http: noop,
    pause: noop,
    resume: noop
};

var npmConfig = {
    log: noop_log
};

function getConf() {
    return q.nbind(npmConf.load, npmConf)(npmConfig);

}

function getGlobalNodeModulesPath() {
    return getConf()
        .then(function(conf) {
            var lib = os.platform() === 'win32' ? '' : 'lib';
            return path.resolve(conf.get('prefix'), lib);
        });
}

function getRegistryClient() {
    return function (url) {
        return getConf().then(function (conf) {
            var regConf = {
                auth: conf.getCredentialsByURI(url),
            };
            var client = new RegistryClient(npmConfig);
            return q.ninvoke(client, 'get', url, regConf);
        });
    };
}

module.exports = {
    getRegistryClient: getRegistryClient,
    getGlobalNodeModulesPath: getGlobalNodeModulesPath
};
