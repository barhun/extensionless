import {register} from 'module'
import {argv, execArgv} from 'process'

register('./index.js', import.meta.url, {data: {argv, execArgv}})
