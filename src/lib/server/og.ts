import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

import geistMono from '@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff?inline'
import geistBold from '@fontsource/geist/files/geist-latin-700-normal.woff?inline'
import geistRegular from '@fontsource/geist/files/geist-latin-400-normal.woff?inline'
import avatar from '#lib/assets/avatar-og.png?inline'

/**
 * Open Graph cards in the site's own visual language (CLAUDE_CODE_PROMPT
 * step 9): the grid, a glow, a mono shell command, a big Geist headline with
 * the signature gradient on its second line.
 *
 * Rendered at build time by prerendered routes under /og, so nothing here
 * ever runs per request. Fonts and the avatar are inlined into the server
 * bundle with `?inline`, the same trick /download-cv uses, so there is no
 * filesystem path to get wrong between `vite build` and Docker.
 *
 * satori has no oklch(), so the accent tokens appear here as their sRGB
 * equivalents (converted exactly, not eyeballed).
 */

const C = {
  bg: '#fafaf8',
  grid: '#ececea',
  ink: '#15171c',
  ink3: '#6b6b66',
  ink4: '#9a9a94',
  border: '#dcdcd6',
  green: '#2e9e52',
  blue: '#0094ce',
  purple: '#956ed2',
  glow: {
    green: '#9ee1ab',
    blue: '#85daff',
    purple: '#d8bfff',
    orange: '#ffbb92',
  },
}

export type OgHue = keyof typeof C.glow

export interface OgCard {
  command: string
  title: string
  accent?: string
  hue?: OgHue
}

const dataUrlBytes = (dataUrl: string) =>
  Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined

const loadFonts = () =>
  (fonts ??= [
    {
      name: 'Geist',
      data: dataUrlBytes(geistRegular),
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Geist',
      data: dataUrlBytes(geistBold),
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Geist Mono',
      data: dataUrlBytes(geistMono),
      weight: 400,
      style: 'normal',
    },
  ])

type Node = {
  type: string
  props: Record<string, unknown> & {
    style?: Record<string, unknown>
    children?: unknown
  }
}

const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  props: Record<string, unknown> = {}
): Node => ({ type, props: { ...props, style, children } })

const WIDTH = 1200
const HEIGHT = 630

export const renderOgCard = async ({
  command,
  title,
  accent,
  hue = 'green',
}: OgCard) => {
  // Each headline line must fit on one line: Geist Bold at -0.045em averages
  // about 0.56em per character, across the 1056px between the margins.
  const longest = Math.max(title.length, accent?.length ?? 0)
  const titleSize = Math.min(92, Math.floor(1056 / (0.56 * longest)))

  const tree = h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      // satori sizes boxes like CSS's default content-box, so without this
      // the padding would push the footer off the bottom of the card.
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      position: 'relative',
      backgroundColor: C.bg,
      backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      fontFamily: 'Geist',
      color: C.ink,
    },
    [
      h('div', {
        position: 'absolute',
        top: -260,
        right: -160,
        width: 820,
        height: 620,
        borderRadius: '50%',
        backgroundImage: `radial-gradient(ellipse at center, ${C.glow[hue]} 0%, rgba(250,250,248,0) 65%)`,
      }),
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'Geist Mono',
          fontSize: 26,
        },
        [
          h('img', { width: 52, height: 52, borderRadius: 26 }, undefined, {
            src: avatar,
            width: 52,
            height: 52,
          }),
          h('span', { display: 'flex' }, 'pranta'),
          h('span', { display: 'flex', color: C.ink4 }, '/'),
          h('span', { display: 'flex' }, 'portfolio'),
          h(
            'span',
            {
              display: 'flex',
              marginLeft: 8,
              padding: '2px 14px',
              border: `2px solid ${C.border}`,
              borderRadius: 999,
              fontSize: 18,
              color: C.ink3,
            },
            'public'
          ),
        ]
      ),
      h('div', { display: 'flex', flexDirection: 'column', gap: 18 }, [
        h(
          'div',
          {
            display: 'flex',
            fontFamily: 'Geist Mono',
            fontSize: 28,
            color: C.ink3,
          },
          command
        ),
        h(
          'div',
          {
            display: 'flex',
            flexDirection: 'column',
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.02,
          },
          [
            h('div', { display: 'flex', whiteSpace: 'nowrap' }, title),
            accent
              ? h(
                  'div',
                  {
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    backgroundImage: `linear-gradient(90deg, ${C.green}, ${C.blue}, ${C.purple})`,
                    backgroundClip: 'text',
                    color: 'transparent',
                  },
                  accent
                )
              : null,
          ].filter(Boolean)
        ),
      ]),
      h(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Geist Mono',
          fontSize: 24,
          color: C.ink3,
        },
        [
          h(
            'span',
            { display: 'flex' },
            'Pranta Dutta · Flutter & Mobile Engineer'
          ),
          h('span', { display: 'flex', color: C.ink }, 'pranta.dev'),
        ]
      ),
    ]
  )

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: loadFonts(),
  })

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
    .render()
    .asPng()

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
