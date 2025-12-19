import {readFile} from 'fs/promises'
import {dirname, isAbsolute, join} from 'path'
import {cwd} from 'process'

let warn = (field, desc) => console.warn('⚠️ \x1b[33m%s\x1b[0m',
  `Warning: The package.json field 'extensionless.${field}' must be ${desc}! Using the default value instead...`)

let getPkgJson = async dirPath => {
  do {
    try {
      return JSON.parse(await readFile(join(dirPath, 'package.json'), 'utf8'))
    } catch (e) {
      if (!['ENOTDIR', 'ENOENT', 'EISDIR'].includes(e.code)) {
        throw new Error('Cannot retrieve package.json', {cause: e})
      }
    }
  } while (dirPath !== (dirPath = dirname(dirPath)))
}

export async function getConfig({argv = [], execArgv = []} = {}) {
  let defaults = {
    lookFor: ['js']
  }, dirPath = isAbsolute(argv[1] ?? '') ? argv[1] : cwd(), {
    lookFor
  } = {...defaults, ...(await getPkgJson(dirPath))?.extensionless}

  Array.isArray(lookFor) && lookFor.length && lookFor.every(a => typeof a === 'string' && /^[a-z]\w*$/i.test(a)) || (
    lookFor = defaults.lookFor, warn('lookFor', 'an array of alphanumeric strings')
  )

  execArgv.includes('--experimental-transform-types') && !lookFor.includes('ts') && (lookFor = ['ts', ...lookFor])

  return {lookFor}
}
