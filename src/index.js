import {extname} from 'path'
import {getConfig} from './config.js'

let initPromise
export function globalPreload({port}) {
  port.onmessage = e => initPromise = initialize({argv1: e.data})

  return 'port.postMessage(process.argv[1])'
}

let indexFiles, candidates
export async function initialize(data) {
  let {lookFor} = await getConfig(data)

  indexFiles = [lookFor.map(e => `index.${e}`), ['index.json']]
  candidates = indexFiles.map(i => i.map(f => extname(f)).concat(i.map(f => `/${f}`)))
}

let winAbsPath = /^[/\\]?[a-z]:[/\\]/i, relSpecs = ['.', '..']
let specStarts = ['./', '../', '/', 'file://', 'https://', '.\\', '..\\', '\\']
let knownExts = ['.js', '.cjs', '.mjs', '.json', '.node', '.wasm'], empty = [[], []]

export async function resolve(specifier, context, nextResolve) {
  let error, prefix = winAbsPath.test(specifier) ? 'file://' : ''

  if (!prefix && !relSpecs.includes(specifier) && !specStarts.some(s => specifier.startsWith(s))) {
    try {return await nextResolve(specifier)} catch (e) {error = e}
  }

  let {type} = context.importAttributes ?? context.importAssertions
  let trySpec = error ? specifier : new URL(prefix + specifier, context.parentURL).href
  let postfixes = (await initPromise, trySpec.endsWith('/') ? indexFiles : knownExts.includes(extname(trySpec)) ? empty : candidates)

  for (let postfix of postfixes[+(type === 'json')]) {
    try {return await nextResolve(trySpec + postfix)} catch {}
  }

  if (error) throw error
  return await nextResolve(trySpec)
}
