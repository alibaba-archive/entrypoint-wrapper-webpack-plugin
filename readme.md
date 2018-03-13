# Entrypoint wrapper webpack plugin

## Description

一款用于包装 Entry 配置的 Webpack 插件。

## Install

```bash
npm i -D entrypoint-wrapper-webpack-plugin
```

## Usage

```js
const EntryPoint = require('entrypoint-wrapper-webpack-plugin');
module.exports = {
  plugins: [
	new EntryPoint({
	  include: /.*\.vue$/,
	  file: './default_index.js' // wrapper file
	})
  ]
}
```


```js
const EntryPoint = require('entrypoint-wrapper-webpack-plugin');
module.exports = {
  plugins: [
	new EntryPoint({
	  include: /.*\.vue$/,
	  // template string
	  template: 'import Main from '<%= origin %>';Main.el = '#root';new Vue(Main)'
	})
  ]
}
```


```js
const EntryPoint = require('entrypoint-wrapper-webpack-plugin');
module.exports = {
  plugins: [
	new EntryPoint({
	  include: /.*\.vue$/,
	  // template function
	  template: function(params){
	    return `import Main from '${params.origin}';Main.el = '#root';new Vue(Main)`
	  }
	})
  ]
}
```

## Options

|Name|Type|Description|
|:--:|:--:|:----------|
|`include`|`{RegExp}`|included files|
|`file`|`{String}`|wrapper path|
|`template`|`{Function\|String}`|wrapper template|

