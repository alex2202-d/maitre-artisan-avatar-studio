import type { CSSProperties } from 'react'

export type Avatar2DConfig = {
  skin: string
  expression: string
  hair: string
  hairColor: string
  headwear: string
  top: string
  bottom: string
  gloves: string
  shoes: string
  accessory: string
}

const skinMap: Record<string, [string, string]> = {
  clair: ['#FFD7B8', '#E8A879'],
  peche: ['#F8C39D', '#DA8F62'],
  medium: ['#C98B63', '#955C3F'],
  brun: ['#8A573D', '#5E3526'],
  fonce: ['#5B382A', '#382018'],
}

const hairMap: Record<string, string> = {
  brun: '#6B3D2E',
  chatain: '#8B5A3C',
  blond: '#D7A441',
  noir: '#26211F',
  cuivre: '#A85632',
}

const topColors: Record<string, string> = {
  'tank-gray': '#D8DADF',
  'tee-navy': '#243E73',
  'jacket-blue': '#1665D8',
  'jacket-olive': '#5E6853',
  'painter-top': '#F4F4F2',
  'hivis-orange': '#FF7A16',
}

const bottomColors: Record<string, string> = {
  'shorts-gray': '#D1D3D8',
  'pants-blue': '#176AD9',
  'overalls-blue': '#1E68C8',
  'cargo-olive': '#66704F',
  'painter-pants': '#F4F4F2',
  'cargo-dark': '#2F333B',
}

function Eye({ cx }: { cx: number }) {
  return (
    <g>
      <ellipse cx={cx} cy="205" rx="48" ry="61" fill="url(#eyeGrad)" stroke="#D4D8DE" strokeWidth="2" />
      <circle cx={cx + 5} cy="210" r="12" fill="#151515" />
      <ellipse cx={cx - 19} cy="179" rx="11" ry="18" fill="rgba(255,255,255,.86)" />
    </g>
  )
}

function Face({ expression }: { expression: string }) {
  const surprised = expression === 'surprised'
  const sad = expression === 'sad'
  const determined = expression === 'determined'
  return (
    <g>
      <Eye cx={248} />
      <Eye cx={352} />
      {determined && (
        <>
          <path d="M198 140 L278 168" stroke="#1B1B1B" strokeWidth="10" strokeLinecap="round" />
          <path d="M402 140 L322 168" stroke="#1B1B1B" strokeWidth="10" strokeLinecap="round" />
        </>
      )}
      {sad && (
        <>
          <path d="M207 160 Q240 128 272 152" fill="none" stroke="#1B1B1B" strokeWidth="8" strokeLinecap="round" />
          <path d="M328 152 Q360 128 393 160" fill="none" stroke="#1B1B1B" strokeWidth="8" strokeLinecap="round" />
        </>
      )}
      {surprised ? (
        <ellipse cx="300" cy="295" rx="18" ry="25" fill="#341711" />
      ) : sad ? (
        <path d="M267 315 Q300 282 333 315" fill="none" stroke="#1B1B1B" strokeWidth="8" strokeLinecap="round" />
      ) : determined ? (
        <path d="M270 300 Q300 312 332 294" fill="none" stroke="#1B1B1B" strokeWidth="7" strokeLinecap="round" />
      ) : expression === 'happy' ? (
        <path d="M254 286 Q300 335 347 285" fill="none" stroke="#1B1B1B" strokeWidth="9" strokeLinecap="round" />
      ) : (
        <path d="M267 294 Q300 319 334 294" fill="none" stroke="#1B1B1B" strokeWidth="7" strokeLinecap="round" />
      )}
    </g>
  )
}

function Hair({ style, color }: { style: string; color: string }) {
  if (style === 'none') return null
  const common = { fill: color, stroke: '#4A2B23', strokeWidth: 3 }
  if (style === 'short') return <path d="M145 133 Q176 62 299 47 Q414 57 455 134 Q415 116 382 137 Q349 103 316 130 Q282 99 246 131 Q210 101 177 139 Z" {...common} />
  if (style === 'side') return <path d="M145 136 Q180 57 305 48 Q402 55 450 124 Q385 102 342 116 Q297 132 226 174 Q181 169 145 136 Z" {...common} />
  if (style === 'spiky') return (
    <g {...common}>
      <path d="M151 135 Q174 88 221 70 L206 30 L250 61 L271 20 L300 59 L337 17 L351 62 L398 28 L388 75 Q431 94 449 137 Q377 110 300 111 Q222 111 151 135 Z" />
    </g>
  )
  if (style === 'curly') return (
    <g fill={color} stroke="#4A2B23" strokeWidth="3">
      {[[175,100],[215,77],[260,66],[305,63],[350,67],[395,83],[425,112],[195,130],[240,116],[286,112],[333,115],[380,128]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={33-(i%3)*3} />)}
    </g>
  )
  if (style === 'bob') return <path d="M144 139 Q173 53 300 48 Q428 54 456 140 L448 312 Q421 334 398 302 L395 171 Q359 123 300 116 Q241 123 204 171 L202 303 Q179 335 151 311 Z" {...common} />
  if (style === 'middle') return <path d="M147 139 Q180 53 299 48 Q420 54 452 140 Q397 114 333 111 L304 138 L294 138 L266 111 Q200 116 147 139 Z" {...common} />
  if (style === 'classic') return <path d="M151 134 Q190 56 301 48 Q396 55 447 128 Q377 110 340 120 Q303 132 269 119 Q224 105 151 134 Z" {...common} />
  return (
    <g {...common}>
      <path d="M155 139 Q188 63 299 52 Q407 63 445 139 Q393 112 351 123 Q300 137 250 121 Q210 109 155 139 Z" />
      <circle cx="375" cy="49" r="50" />
    </g>
  )
}

function Headwear({ kind }: { kind: string }) {
  if (kind === 'none') return null
  if (kind.startsWith('hardhat-')) {
    const color = kind.endsWith('yellow') ? '#FFD129' : kind.endsWith('blue') ? '#1974E9' : '#FF7A16'
    return (
      <g>
        <path d="M130 162 Q142 27 300 18 Q458 27 470 162 Q430 143 300 143 Q170 143 130 162 Z" fill={color} stroke="rgba(0,0,0,.16)" strokeWidth="3" />
        <rect x="118" y="145" width="364" height="29" rx="15" fill={color} />
        <path d="M300 23 L300 142" stroke="rgba(255,255,255,.34)" strokeWidth="16" strokeLinecap="round" />
        <path d="M218 53 Q200 92 203 143 M382 53 Q400 92 397 143" fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="9" />
      </g>
    )
  }
  if (kind === 'cap-white' || kind === 'cap-gray') {
    const c = kind === 'cap-white' ? '#F7F7F5' : '#D9DCE2'
    return (
      <g>
        <path d="M157 138 Q178 54 300 51 Q421 54 443 138 Q378 110 300 112 Q222 110 157 138 Z" fill={c} stroke="#BEC4CD" strokeWidth="3" />
        <path d="M305 129 Q394 112 463 146 Q391 170 304 154 Z" fill={c} stroke="#BEC4CD" strokeWidth="3" />
      </g>
    )
  }
  return <path d="M154 139 Q172 55 300 51 Q429 55 447 139 L437 164 Q300 142 163 164 Z" fill="#31343B" stroke="#1F2227" strokeWidth="3" />
}

function Top({ kind }: { kind: string }) {
  const color = topColors[kind] ?? '#D8DADF'
  if (kind === 'tank-gray') {
    return <path d="M232 397 Q257 378 277 379 L323 379 Q347 380 370 398 L388 565 Q300 590 212 565 Z" fill={color} stroke="rgba(0,0,0,.12)" strokeWidth="3" />
  }
  const jacket = kind.includes('jacket') || kind === 'hivis-orange'
  return (
    <g>
      <path d="M217 405 Q254 376 278 379 L322 379 Q348 379 383 405 L400 579 Q300 600 200 579 Z" fill={color} stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      <path d="M219 416 Q190 427 165 465 L181 511 Q206 481 230 470 Z" fill={color} />
      <path d="M381 416 Q410 427 435 465 L419 511 Q394 481 370 470 Z" fill={color} />
      {jacket && <>
        <path d="M300 390 L300 575" stroke="rgba(0,0,0,.22)" strokeWidth="4" />
        <rect x="235" y="439" width="48" height="37" rx="8" fill="rgba(0,0,0,.08)" />
        <rect x="317" y="439" width="48" height="37" rx="8" fill="rgba(0,0,0,.08)" />
      </>}
      {kind === 'jacket-blue' && <>
        <rect x="205" y="492" width="190" height="16" rx="6" fill="#D5D9DF" />
        <rect x="170" y="468" width="50" height="12" rx="5" fill="#D5D9DF" transform="rotate(-18 170 468)" />
        <rect x="380" y="468" width="50" height="12" rx="5" fill="#D5D9DF" transform="rotate(18 380 468)" />
      </>}
      {kind === 'hivis-orange' && <>
        <rect x="204" y="474" width="192" height="17" rx="5" fill="#E4E7EA" />
        <rect x="206" y="506" width="188" height="17" rx="5" fill="#E4E7EA" />
        <path d="M251 398 L263 568 M349 398 L337 568" stroke="#E4E7EA" strokeWidth="15" />
      </>}
      {kind === 'painter-top' && <>
        <rect x="252" y="404" width="96" height="126" rx="16" fill="#F8F8F6" stroke="#B7BBC2" strokeWidth="3" />
        <circle cx="268" cy="474" r="7" fill="#1C75E8" /><circle cx="330" cy="500" r="9" fill="#FFD429" /><circle cx="302" cy="448" r="5" fill="#1C75E8" />
      </>}
    </g>
  )
}

function Bottom({ kind }: { kind: string }) {
  const color = bottomColors[kind] ?? '#D1D3D8'
  if (kind === 'shorts-gray') return <path d="M218 548 L382 548 L372 644 Q337 654 303 626 Q270 655 228 644 Z" fill={color} stroke="rgba(0,0,0,.14)" strokeWidth="3" />
  return (
    <g>
      <path d="M218 548 L382 548 L371 711 L315 711 L302 616 L288 711 L229 711 Z" fill={color} stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      {kind.includes('cargo') && <>
        <rect x="225" y="596" width="49" height="48" rx="8" fill="rgba(0,0,0,.08)" />
        <rect x="326" y="596" width="49" height="48" rx="8" fill="rgba(0,0,0,.08)" />
      </>}
      {kind === 'cargo-dark' && <>
        <rect x="224" y="659" width="58" height="15" rx="5" fill="#D8DCE1" />
        <rect x="318" y="659" width="58" height="15" rx="5" fill="#D8DCE1" />
      </>}
      {kind === 'painter-pants' && <>
        <circle cx="249" cy="621" r="7" fill="#1C75E8" /><circle cx="350" cy="646" r="8" fill="#FFD429" /><circle cx="330" cy="590" r="5" fill="#1C75E8" />
      </>}
      {kind === 'overalls-blue' && <>
        <rect x="245" y="405" width="110" height="176" rx="17" fill="#1E68C8" stroke="rgba(0,0,0,.16)" strokeWidth="3" />
        <path d="M250 410 L220 365 M350 410 L380 365" stroke="#1E68C8" strokeWidth="18" strokeLinecap="round" />
        <rect x="266" y="463" width="68" height="52" rx="9" fill="rgba(0,0,0,.08)" />
        <circle cx="250" cy="407" r="8" fill="#B7BBC2" /><circle cx="350" cy="407" r="8" fill="#B7BBC2" />
      </>}
    </g>
  )
}

function Gloves({ kind }: { kind: string }) {
  if (kind === 'none') return null
  const colors: Record<string,string> = { yellow:'#FFD028', black:'#2F3135', orange:'#FF7619', white:'#F3F3F1', blue:'#1D79E8' }
  const c = colors[kind] ?? '#FFD028'
  return (
    <g fill={c} stroke="rgba(0,0,0,.18)" strokeWidth="3">
      <path d="M133 502 Q108 509 104 535 Q101 567 131 578 Q162 584 177 559 L185 526 Q176 503 158 505 Q149 479 133 502 Z" />
      <path d="M467 502 Q492 509 496 535 Q499 567 469 578 Q438 584 423 559 L415 526 Q424 503 442 505 Q451 479 467 502 Z" />
    </g>
  )
}

function Shoes({ kind }: { kind: string }) {
  if (kind === 'bare') return null
  const cfg: Record<string,{base:string,accent:string,sole:string}> = {
    'boots-brown':{base:'#9A5A31',accent:'#D9974A',sole:'#3E302A'},
    'boots-black':{base:'#2B2D31',accent:'#4B4E54',sole:'#16171A'},
    'boots-white':{base:'#ECEFED',accent:'#C3C8CD',sole:'#80858B'},
    'boots-orange':{base:'#2A2C30',accent:'#FF7317',sole:'#16171A'},
    'shoes-blue':{base:'#243A5E',accent:'#60779C',sole:'#151A20'},
  }
  const c=cfg[kind] ?? cfg['boots-brown']
  return (
    <g>
      <path d="M192 683 Q219 661 263 678 L269 720 Q254 742 188 737 Q168 728 192 683 Z" fill={c.base} stroke={c.sole} strokeWidth="4" />
      <path d="M408 683 Q381 661 337 678 L331 720 Q346 742 412 737 Q432 728 408 683 Z" fill={c.base} stroke={c.sole} strokeWidth="4" />
      <path d="M188 724 Q226 733 269 720" fill="none" stroke={c.accent} strokeWidth="8" />
      <path d="M412 724 Q374 733 331 720" fill="none" stroke={c.accent} strokeWidth="8" />
      <path d="M207 691 L251 708 M207 704 L251 691 M393 691 L349 708 M393 704 L349 691" stroke={c.accent} strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

function Accessory({ kind }: { kind: string }) {
  if (kind === 'none') return null
  if (kind === 'harness') return <g fill="none" stroke="#D9F21A" strokeWidth="18"><path d="M241 413 L330 574 M359 413 L270 574" /><path d="M217 543 L383 543" /></g>
  const dark = kind === 'belt-brown' ? '#8A542F' : kind === 'belt-painter' ? '#E7DDCF' : '#25272C'
  return (
    <g>
      <rect x="203" y="551" width="194" height="24" rx="12" fill={dark} />
      <rect x="219" y="567" width="54" height="72" rx="10" fill={dark} stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      <rect x="327" y="567" width="54" height="72" rx="10" fill={dark} stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      <rect x="288" y="548" width="25" height="29" rx="5" fill="#B8BEC6" />
      {kind !== 'belt-brown' && <>
        <path d="M234 570 L234 533" stroke="#D74231" strokeWidth="10" strokeLinecap="round" />
        <path d="M252 570 L252 525" stroke="#FFD028" strokeWidth="10" strokeLinecap="round" />
        <path d="M348 570 L365 532" stroke="#C9CDD2" strokeWidth="10" strokeLinecap="round" />
      </>}
      {kind === 'belt-painter' && <>
        <circle cx="241" cy="604" r="7" fill="#1D79E8" /><circle cx="352" cy="615" r="8" fill="#FFD028" />
      </>}
      {kind === 'pouch-orange' && <rect x="215" y="576" width="166" height="50" rx="13" fill="#25272C" stroke="#FF7317" strokeWidth="6" />}
    </g>
  )
}

export default function Avatar2D({ config, className = '', style }: { config: Avatar2DConfig; className?: string; style?: CSSProperties }) {
  const [skinLight, skinDark] = skinMap[config.skin] ?? skinMap.peche
  const hairColor = hairMap[config.hairColor] ?? hairMap.brun
  return (
    <svg className={className} style={style} viewBox="0 0 600 760" role="img" aria-label="Avatar 2D Maître Artisan">
      <defs>
        <radialGradient id="skinGrad" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FFF1E4" />
          <stop offset="34%" stopColor={skinLight} />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8EBEF" />
        </radialGradient>
      </defs>

      <ellipse cx="300" cy="728" rx="160" ry="19" fill="rgba(28,51,77,.12)" />

      <g fill="url(#skinGrad)" stroke="rgba(93,55,34,.12)" strokeWidth="3">
        <rect x="274" y="344" width="52" height="60" rx="24" />
        <path d="M224 411 Q176 423 147 481 Q129 516 134 542 Q139 567 164 569 Q188 570 202 538 L237 468 Z" />
        <path d="M376 411 Q424 423 453 481 Q471 516 466 542 Q461 567 436 569 Q412 570 398 538 L363 468 Z" />
        <path d="M244 617 L289 617 L281 704 Q253 724 213 706 Q205 691 218 670 Z" />
        <path d="M356 617 L311 617 L319 704 Q347 724 387 706 Q395 691 382 670 Z" />
      </g>

      <Top kind={config.top} />
      <Bottom kind={config.bottom} />
      <Accessory kind={config.accessory} />
      <Gloves kind={config.gloves} />
      <Shoes kind={config.shoes} />

      <circle cx="300" cy="210" r="174" fill="url(#skinGrad)" stroke="rgba(93,55,34,.15)" strokeWidth="3" />
      <Face expression={config.expression} />
      <Hair style={config.hair} color={hairColor} />
      <Headwear kind={config.headwear} />
    </svg>
  )
}
