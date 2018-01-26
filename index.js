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
            template: '',
            file: ''
        }, options);
    }

    apply(compiler){

        let wrapperEntry;
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

            if(typeof entry === "string") {
                wrapperEntry = extToJs(entry);
                compiler.apply(new SingleEntryPlugin(context, wrapperEntry, "main"));
            } else if(Array.isArray(entry)){
                wrapperEntry = entry.map(extToJs);
                compiler.apply(new MultiEntryPlugin(context, wrapperEntry, "main"));
            } else if(typeof entry === "object") {
                wrapperEntry = Object.assign({}, entry);
                Object.keys(wrapperEntry).forEach(name => {
                    wrapperEntry[name] = extToJs(entry[name]);
                    compiler.apply(new SingleEntryPlugin(context, wrapperEntry[name], name));
                });
            }

            return true;

        });

        compiler.plugin("this-compilation", function(compilation) {

            const inputFileSystem = this.inputFileSystem;
            const optionsEntry = compilation.options.entry;

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

            if(typeof wrapperEntry === "string") {
                saveToVirtualFilesystem(wrapperEntry, compileTemplate(optionsEntry));
            }else if(typeof wrapperEntry === "object"){
                Object.keys(wrapperEntry).forEach(entry => {
                    saveToVirtualFilesystem(wrapperEntry[entry], compileTemplate(optionsEntry[entry]))
                });
            }

        });

    }

}

module.exports = entryWrapperWebpackPlugin;
