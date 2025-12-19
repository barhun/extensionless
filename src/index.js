import {extname} from 'path'
import {getConfig} from './config.js'

let initPromise
export function globalPreload({port}) {
  port.onmessage = e => initPromise = initialize(e.data)

  return 'port.postMessage({argv: process.argv, execArgv: process.execArgv})'
}

let defaultPostfixes, postfixesByType = {json: [['index.json'], ['.json', '/index.json']]}
export async function initialize(data) {
  let {lookFor} = await getConfig(data)

  defaultPostfixes = [lookFor.map(e => `index.${e}`), lookFor.map(e => `.${e}`).concat(lookFor.map(e => `/index.${e}`))]
}

let winAbsPath = /^[/\\]?[a-z]:[/\\]/i, relSpecs = ['.', '..']
let specStarts = ['./', '../', '/', 'file://', 'https://', '.\\', '..\\', '\\']
let knownExts = ['.ts', '.js', '.cjs', '.mjs', '.json', '.node', '.wasm'], empty = []

export async function resolve(specifier, context, nextResolve) {
  let error, prefix = winAbsPath.test(specifier) ? 'file://' : ''

  if (!prefix && !relSpecs.includes(specifier) && !specStarts.some(s => specifier.startsWith(s))) {
    try {return await nextResolve(specifier)} catch (e) {error = e}
  }

  let {type} = context.importAttributes ?? context.importAssertions
  let trySpec = error ? specifier : new URL(prefix + specifier, context.parentURL).href

  let postfixes = trySpec.endsWith('/')
    ? postfixesByType[type]?.[0] ?? (await initPromise, defaultPostfixes[0]) : knownExts.includes(extname(trySpec)) ? empty
    : postfixesByType[type]?.[1] ?? (await initPromise, defaultPostfixes[1])

  for (let postfix of postfixes) {
    try {return await nextResolve(trySpec + postfix)} catch {}
  }

  if (error) throw error
  return await nextResolve(trySpec)
}
