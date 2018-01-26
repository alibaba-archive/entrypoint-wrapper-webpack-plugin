const path = require('path');
const _ = require('lodash');

exports.replaceExt = (npath, ext) => {
    const nFileName = path.basename(npath, path.extname(npath)) + ext;
    return `${path.dirname(npath)}/${nFileName}`;
};

exports.compileTemplate = (template, data) => {
    const compiled = _.template(template);
    return compiled(data);
};
