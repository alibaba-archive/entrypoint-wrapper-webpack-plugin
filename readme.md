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

	  // wrapper file
	  file: './default_index.js',

	  // String
	  template: 'import Main from '<%= origin %>';Main.el = '#root';new Vue(Main)',
	    
	  // Function
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
|`file`|`{String}`|wrapper path|
|`template`|`{Function\|String}`|wrapper template|

