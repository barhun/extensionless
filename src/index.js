import {extname} from 'path'
import {getConfig} from './config.js'

let initPromise
export function globalPreload({port}) {
  port.onmessage = e => initPromise = initialize({argv1: e.data})

  return 'port.postMessage(process.argv[1])'
}

let indexFiles, candidates, pkgJsonURL, aliases
export async function initialize(data) {
  let {lookFor, pkgJsonPath, imports} = await getConfig(data)

  indexFiles = [lookFor.map(e => `index.${e}`), ['index.json']], candidates = indexFiles.map(i => i.map(f => extname(f)).concat(i.map(f => `/${f}`)))
  pkgJsonURL = 'file://' + pkgJsonPath, aliases = Object.entries(imports ?? {}).map(([k, v]) => [k.split('*'), (v.node ?? v.default ?? v).split('*')]).filter(([k, v]) => k.length < 3 && k.length === v.length).sort(([k1], [k2]) => k1.length < k2.length || k1[0].length > k2[0].length || k1[0].length === k2[0].length && k1[1]?.length > k2[1]?.length ? -1 : 1)
}

let winAbsPath = /^[/\\]?[a-z]:[/\\]/i, relSpecs = ['.', '..']
let specStarts = ['./', '../', '/', 'file://', 'https://', '.\\', '..\\', '\\']
let knownExts = ['.js', '.cjs', '.mjs', '.json', '.node', '.wasm'], empty = [[], []]

export async function resolve(specifier, context, nextResolve) {
  let alias = specifier.startsWith('#') && (await initPromise, aliases.find(([k]) => k[1] !== undefined ? specifier.length > k[0].length + k[1].length && specifier.startsWith(k[0]) && specifier.endsWith(k[1]) : specifier === k[0]))
  let spec = alias ? alias[1][0] + (alias[0][1] !== undefined ? specifier.substring(alias[0][0].length, specifier.length - alias[0][1].length) + alias[1][1] : '') : specifier
  let error, prefix = winAbsPath.test(spec) ? 'file://' : ''

  if (!prefix && !relSpecs.includes(spec) && !specStarts.some(s => spec.startsWith(s))) {
    try {return await nextResolve(spec)} catch (e) {error = e}
  }

  let trySpec = error ? spec : new URL(prefix + spec, alias ? pkgJsonURL : context.parentURL).href
  let {type} = context.importAttributes ?? context.importAssertions
  let postfixes = (await initPromise, trySpec.endsWith('/') ? indexFiles : knownExts.includes(extname(trySpec)) ? empty : candidates)

  for (let postfix of postfixes[+(type === 'json')]) {
    try {return await nextResolve(trySpec + postfix)} catch {}
  }

  if (error) throw error
  return await nextResolve(trySpec)
}
