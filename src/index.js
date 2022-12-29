import {access, existsSync, readFileSync} from 'fs'
import {dirname, extname, isAbsolute, join, normalize, sep} from 'path'
import {cwd} from 'process'
import {fileURLToPath} from 'url'

let entrypoint = process.argv[1]

let pkgJson, curDir, upDir = isAbsolute(entrypoint ?? '') ? dirname(entrypoint) : cwd()
do {
  let filePath = join(curDir = upDir, 'package.json')
  if (existsSync(filePath)) {
    pkgJson = JSON.parse(readFileSync(filePath, 'utf8'))
  }
} while (!pkgJson && curDir !== (upDir = dirname(curDir)))

let {
  lookFor = ['js', 'json'],
  resolveDirs = false
} = pkgJson?.extensionless ?? {}

Array.isArray(lookFor) && lookFor.length && lookFor.every(a => typeof a === 'string' && a.length)
  || (console.error('\x1b[33m%s\x1b[0m', `The package.json field 'extensionless.lookFor' must be an array of strings that are not empty!`), process.exit(1))

typeof resolveDirs === 'boolean'
  || (console.error('\x1b[33m%s\x1b[0m', `The package.json field 'extensionless.resolveDirs' must be a boolean value!`), process.exit(1))

let extToSkip = ['.wasm', '.cjs', '.mjs', '.js', '.json']
let indexFiles = resolveDirs ? lookFor.map(e => `index.${e}`) : []
let extensions = lookFor.map(e => `.${e}`).concat(indexFiles.map(p => `${sep}${p}`))
let findPostfix = async (specifier, context, isAbs) => {
  let postfixes = specifier.endsWith(sep) ? indexFiles : extToSkip.includes(extname(specifier)) ? [] : extensions

  for (let postfix of postfixes) {
    let path = isAbs ? specifier + postfix : join(dirname(fileURLToPath(context.parentURL)), specifier + postfix)

    if (await new Promise(resolve => access(path, e => resolve(!e)))) {
      return postfix
    }
  }
}

let relPrefixes = [...new Set(['./', '../', `.${sep}`, `..${sep}`])]
export async function resolve(specifier, context, nextResolve) {
  let spec = specifier.startsWith('file://') ? fileURLToPath(specifier) : specifier
  let isAbs = isAbsolute(spec)

  let postfix = (isAbs || relPrefixes.some(p => spec.startsWith(p)))
    && await findPostfix(normalize(spec), context, isAbs) || ''

  return await nextResolve(specifier + postfix)
}
