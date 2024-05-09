Node.js loader for import specifiers as file paths without extensions or as directory paths

&nbsp;

Install:

```
npm i extensionless
```

&nbsp;

Start `node` with one of the following flags added. If you're running on a version of node older than `20.6.0`, use:

```
--experimental-loader=extensionless
```

or else, use the newer one instead:

```
--import=extensionless/register
```

&nbsp;

You can now use import specifiers as file paths without extensions or as directory paths:

```js
// imports from the first existing file in the candidates list as follows

import mod from './mod'
// ['./mod.js', './mod/index.js']

import mod from '../mod' with {type: 'json'}
// ['../mod.json', '../mod/index.json']

import api from '/apps/api'
// ['/apps/api.js', '/apps/api/index.js']

import web from 'file:///apps/web'
// ['file:///apps/web.js', 'file:///apps/web/index.js']
```

&nbsp;

To configure this module, add the field `extensionless` to your project's `package.json`:

```json
"extensionless": {
  "lookFor": ["js", "mjs", "cjs"]
}
```

|   Field   | Default Value |
| --------- | ------------- |
| `lookFor` | `["js"]`      |

&nbsp;

When it can be deduced from the specifier that its target is a directory, the resolver looks for only the index files:

```js
// imports from the first existing file in the candidates list as follows

import cur from '.'
// ['./index.js']

import up from '..'
// ['../index.js']

import mod from './mod/'
// ['./mod/index.js']

import mod from '../mod/' with {type: 'json'}
// ['../mod/index.json']

import api from '/apps/api/'
// ['/apps/api/index.js']

import web from 'file:///apps/web/'
// ['file:///apps/web/index.js']
```

&nbsp;

This loader also adds support for Windows path resolution with which you can use forward or backward slashes as separators.

```js
import mod from '.\\mod'
// ['./mod.js', './mod/index.js']

import mod from '..\\mod\\' with {type: 'json'}
// ['../mod/index.json']

import api from 'C:/apps/api'
// ['/C:/apps/api.js', '/C:/apps/api/index.js']

import web from 'C:\\apps\\web\\'
// ['/C:/apps/web/index.js']
```
