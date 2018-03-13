/**
 * RuiZhang  skyperson@gmail.com
 */

'use strict';

const path = require('path');
const fs = require('fs');

const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
const MultiEntryPlugin = require("webpack/lib/MultiEntryPlugin");

const utils = require('./lib/utils');
const virtualFilesystem = require('./lib/virtual-file-system');

class entryWrapperWebpackPlugin {

    constructor(options = {}){
        this.options = Object.assign({
            include: /.*/,
            template: '',
            file: ''
        }, options);
    }

    apply(compiler){

        const wrapperEntry = [];
        const context = compiler.context;
        const _opt = this.options;

        if(_opt.file){
            const filename = _opt.file;
            const filePath = path.isAbsolute(filename) ? filename : path.resolve(context, filename);
            this.contents = fs.readFileSync(filePath, { encoding: 'utf8' });
        } else if ((typeof _opt.template).match(/string|function/)){
            this.contents = _opt.template;
        } else {
            const filePath = path.join(__dirname, 'default_index.js');
            this.contents = fs.readFileSync(filePath, { encoding: 'utf8' });
        }

        const templateContents = this.contents;

        compiler.plugin("entry-option", function(context, entry) {

            const extToJs = npath => utils.replaceExt(npath, '.js');

            function action(n){
                if(_opt.include.test(n)){
                    const _js = extToJs(n);
                    wrapperEntry.push({
                        source: n,
                        wrapper: _js
                    });
                    return _js;
                }
                return n;
            }

            function itemToPlugin(item, name) {
                if(Array.isArray(item)){
                    item = item.map(action);
                    return new MultiEntryPlugin(context, item, name);
                } else {
                    return new SingleEntryPlugin(context, action(item), name);
                }
            }

            if(typeof entry === "string" || Array.isArray(entry)) {
                compiler.apply(itemToPlugin(entry, "main"));
            } else if(typeof entry === "object") {
                Object.keys(entry).forEach(function(name) {
                    compiler.apply(itemToPlugin(entry[name], name));
                });
            }

            return true;

        });

        compiler.plugin("after-environment", function() {

            const inputFileSystem = this.inputFileSystem;

            const compileTemplate = originPath => {
                const params = { origin: originPath };
                const contentIsFunction = typeof templateContents === 'function';
                return contentIsFunction
                    ? templateContents(params)
                    : utils.compileTemplate(templateContents, params);
            };

            function saveToVirtualFilesystem(jsPath, contents){
                const modulePath = path.isAbsolute(jsPath) ? jsPath : path.join(context, jsPath);
                virtualFilesystem({
                    fs: inputFileSystem,
                    modulePath,
                    contents
                });
            }

            wrapperEntry.forEach(({source, wrapper}) => {
                saveToVirtualFilesystem(wrapper, compileTemplate(source))
            });

        });

    }

}

module.exports = entryWrapperWebpackPlugin;
