import './dir'
import './dir' with {type: 'json'}

import './dir/'
import './dir/' with {type: 'json'}

import './dir/index'
import './dir/index' with {type: 'json'}

import './dir/index.js'
import './dir/index.json' with {type: 'json'}

import './dir/ext'

import '#sub/rel'

console.log('✅ \x1b[32m%s\x1b[0m', 'Loaded all the modules successfully.')
