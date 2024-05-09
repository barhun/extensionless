import {readFile} from 'fs/promises'
import {dirname, isAbsolute, join} from 'path'
import {cwd} from 'process'

let warn = (field, desc) => console.warn('⚠️ \x1b[33m%s\x1b[0m',
  `Warning: The package.json field 'extensionless.${field}' must be ${desc}! Using the default value instead...`)

let getPkgJson = async argv1 => {
  let path, dirPath = isAbsolute(argv1 ?? '') ? argv1 : cwd()

  do {
    try {
      return {body: JSON.parse(await readFile(path = join(dirPath, 'package.json'), 'utf8')), path}
    } catch (e) {
      if (!['ENOTDIR', 'ENOENT', 'EISDIR'].includes(e.code)) {
        throw new Error('Cannot retrieve package.json', {cause: e})
      }
    }
  } while (dirPath !== (dirPath = dirname(dirPath)))
}

export async function getConfig({argv1} = {}) {
  let defaults = {
    lookFor: ['js']
  }, pkgJson = await getPkgJson(argv1), {
    lookFor
  } = {...defaults, ...pkgJson?.body.extensionless}

  Array.isArray(lookFor) && lookFor.length && lookFor.every(a => typeof a === 'string' && /^[a-z]\w*$/i.test(a)) || (
    lookFor = defaults.lookFor, warn('lookFor', 'an array of alphanumeric strings')
  )

  return {lookFor, pkgJsonPath: pkgJson?.path}
}
