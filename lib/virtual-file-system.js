"use strict";

const VirtualStats = require('virtual-module-webpack-plugin/virtual-stats');

function virtualFilesystem(options = {}) {

    const {
        fs,
        modulePath,
        contents
    } = options;

    /*
        enhanced-resolve@3.4.0 及以上用的 Map
          this.running = new Map();
          this.data = new Map();
        enhanced-resolve@3.3.0 及一下用的 Object:
          this.running = {};
          this.data = {};
     */

    const mapIsAvailable = typeof Map !== 'undefined';
    const statStorageIsMap = mapIsAvailable && fs._statStorage.data instanceof Map;
    const readFileStorageIsMap = mapIsAvailable && fs._readFileStorage.data instanceof Map;

    if (readFileStorageIsMap) {
        if (fs._readFileStorage.data.has(modulePath)) return;
    } else if (fs._readFileStorage.data[modulePath]) {
        return;
    }

    const stats = createStats(options);

    statStorageIsMap
        ? fs._statStorage.data.set(modulePath, [null, stats])
        : fs._statStorage.data[modulePath] = [null, stats];

    readFileStorageIsMap
        ? fs._readFileStorage.data.set(modulePath, [null, contents])
        : fs._readFileStorage.data[modulePath] = [null, contents];

}

function createStats(options = {}) {

    const statsDate = new Date().toString();

    const {
        ctime = statsDate,
        mtime = statsDate,
        contents
    } = options;

    let { size = 0 } = options;

    if (!size && contents) {
        size = contents.length;
    }

    return new VirtualStats({
        dev: 8675309,
        nlink: 1,
        uid: 501,
        gid: 20,
        rdev: 0,
        blksize: 4096,
        ino: 44700000,
        mode: 33188,
        size,
        atime: mtime,
        mtime: mtime,
        ctime: ctime,
        birthtime: ctime,
    });
}

module.exports = virtualFilesystem;
