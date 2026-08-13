/**
 * Generates one Svelte component per react-icons icon actually used by the
 * Next.js site, by lifting the exact GenIcon payload out of the installed
 * react-icons package. The output mirrors react-icons' own IconBase so the
 * rendered SVG is attribute-for-attribute identical — same viewBox, same paths,
 * same 1em sizing, same currentColor behaviour — with no runtime library.
 */
import fs from 'node:fs'
import path from 'node:path'

import * as prettier from 'prettier'

// Defaults point at the sibling Next.js project, which is where react-icons is
// installed. Override both if it moves:
//   node scripts/generate-icons.mjs <path-to-react-icons> <output-dir>
const RI = process.argv[2] || '../portfolio-nextjs-web/node_modules/react-icons'
const OUT = process.argv[3] || 'src/lib/icons'

const WANTED = {
  bi: ['BiLogoPostgresql'],
  bs: ['BsArrowRight', 'BsLinkedin', 'BsMoon', 'BsSun', 'BsTwitterX'],
  cg: ['CgWorkAlt'],
  di: ['DiGoogleCloudPlatform', 'DiMsqlServer'],
  fa: [
    'FaAppStoreIos',
    'FaArrowLeft',
    'FaArrowRight',
    'FaBolt',
    'FaCalendarAlt',
    'FaCheckCircle',
    'FaChevronLeft',
    'FaChevronRight',
    'FaCloud',
    'FaCode',
    'FaCodeBranch',
    'FaDatabase',
    'FaDesktop',
    'FaDocker',
    'FaExpand',
    'FaExternalLinkAlt',
    'FaGitAlt',
    'FaGithub',
    'FaGithubSquare',
    'FaGlobe',
    'FaGooglePlay',
    'FaHeart',
    'FaImage',
    'FaInfoCircle',
    'FaLightbulb',
    'FaLock',
    'FaMobile',
    'FaNodeJs',
    'FaPalette',
    'FaPaperPlane',
    'FaPlay',
    'FaReact',
    'FaRocket',
    'FaRust',
    'FaStar',
    'FaTimes',
    'FaTools',
    'FaUserCog',
    'FaVideo',
  ],
  fa6: ['FaGolang'],
  fi: [
    'FiArrowLeft',
    'FiBookOpen',
    'FiBriefcase',
    'FiCalendar',
    'FiCheckCircle',
    'FiChevronDown',
    'FiClock',
    'FiExternalLink',
    'FiGithub',
    'FiHeart',
    'FiHome',
    'FiMail',
    'FiMenu',
    'FiMessageCircle',
    'FiStar',
    'FiUser',
    'FiX',
  ],
  hi: ['HiDownload'],
  io5: ['IoLogoFirebase'],
  lu: ['LuBoxes'],
  si: [
    'SiDart',
    'SiDotnet',
    'SiFlutter',
    'SiKotlin',
    'SiKubernetes',
    'SiNextdotjs',
    'SiRedis',
    'SiTypescript',
  ],
  tb: ['TbBrandReactNative'],
}

// SVG attributes the HTML parser keeps camelCase. Everything else that is
// camelCase in React's payload is a kebab-case attribute in markup.
const KEEP_CAMEL = new Set([
  'viewBox',
  'preserveAspectRatio',
  'gradientTransform',
  'gradientUnits',
  'patternContentUnits',
  'patternTransform',
  'patternUnits',
  'spreadMethod',
  'clipPathUnits',
  'maskContentUnits',
  'maskUnits',
  'markerHeight',
  'markerUnits',
  'markerWidth',
  'refX',
  'refY',
  'textLength',
  'lengthAdjust',
  'startOffset',
  'baseFrequency',
  'numOctaves',
  'stitchTiles',
  'surfaceScale',
  'specularConstant',
  'specularExponent',
  'diffuseConstant',
  'kernelMatrix',
  'kernelUnitLength',
  'edgeMode',
  'targetX',
  'targetY',
  'xChannelSelector',
  'yChannelSelector',
  'filterUnits',
  'primitiveUnits',
  'tableValues',
  'attributeName',
  'repeatCount',
  'keyTimes',
  'keySplines',
  'calcMode',
])

const unknownCamel = new Set()

const attrName = (name) => {
  if (KEEP_CAMEL.has(name)) return name
  if (!/[A-Z]/.test(name)) return name
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  unknownCamel.add(`${name} -> ${kebab}`)
  return kebab
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

const renderNode = (node, indent) => {
  const pad = '  '.repeat(indent)
  const attrs = Object.entries(node.attr || {})
    .map(([k, v]) => `${attrName(k)}="${esc(v)}"`)
    .join(' ')
  const open = attrs ? `<${node.tag} ${attrs}` : `<${node.tag}`
  const children = node.child || []
  if (children.length === 0) return `${pad}${open} />`
  const inner = children.map((c) => renderNode(c, indent + 1)).join('\n')
  return `${pad}${open}>\n${inner}\n${pad}</${node.tag}>`
}

const extract = (pack, name) => {
  const src = fs.readFileSync(path.join(RI, pack, 'index.mjs'), 'utf8')
  // `export function FiMenu (props) {\n  return GenIcon({...})(props);\n};`
  const marker = `export function ${name} (props) {`
  const start = src.indexOf(marker)
  if (start === -1) throw new Error(`${pack}/${name}: not found`)
  const callStart = src.indexOf('GenIcon(', start) + 'GenIcon('.length
  // Walk braces to find the end of the JSON argument — the payload contains
  // path data with braces in it only inside strings, so track string state.
  let depth = 0
  let i = callStart
  let inStr = false
  let escaped = false
  for (; i < src.length; i++) {
    const ch = src[i]
    if (inStr) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') inStr = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        i++
        break
      }
    }
  }
  return JSON.parse(src.slice(callStart, i))
}

fs.mkdirSync(OUT, { recursive: true })

// Resolved from the project's .prettierrc.json, not the output directory —
// OUT may point somewhere outside the repo when diffing a regeneration.
const prettierOptions =
  (await prettier.resolveConfig('src/lib/icons/x.svelte')) ?? {}

let count = 0
const names = []

for (const [pack, icons] of Object.entries(WANTED)) {
  for (const name of icons) {
    const data = extract(pack, name)

    // IconBase's base attributes, then the icon's own attr overriding them.
    const base = {
      stroke: 'currentColor',
      fill: 'currentColor',
      strokeWidth: '0',
    }
    const merged = { ...base, ...data.attr }
    const svgAttrs = Object.entries(merged)
      .map(([k, v]) => `${attrName(k)}="${esc(v)}"`)
      .join('\n  ')

    const children = (data.child || []).map((c) => renderNode(c, 1)).join('\n')

    const body = `<!-- Generated from react-icons/${pack} ${name}. Do not edit by hand. -->
<script lang="ts">
  let { class: className = '', ...rest }: { class?: string; [key: string]: unknown } =
    $props()
</script>

<svg
  ${svgAttrs}
  class={className}
  height="1em"
  width="1em"
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
${children}
</svg>
`
    // Run the project's own Prettier config over the output rather than trying
    // to match its wrapping by hand — long `path d="…"` attributes get broken
    // onto their own lines and reproducing that heuristic is not worth it.
    // This way a regenerated tree is byte-identical to the committed one.
    const formatted = await prettier.format(body, {
      ...prettierOptions,
      parser: 'svelte',
    })
    fs.writeFileSync(path.join(OUT, `${name}.svelte`), formatted)
    names.push(name)
    count++
  }
}

// Barrel so components can `import { FiMenu } from '$icons'`.
const barrel = names
  .sort()
  .map((n) => `export { default as ${n} } from './${n}.svelte'`)
  .join('\n')
fs.writeFileSync(path.join(OUT, 'index.ts'), `${barrel}\n`)

console.log(`generated ${count} icons`)
if (unknownCamel.size) {
  console.log('camelCase attrs kebab-cased:', [...unknownCamel].join(', '))
}
