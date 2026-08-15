import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toPng } from 'html-to-image'

const ASSET = {
  logo: '/optimized/images/logo-icon-pcsj.webp',
  complete: '/tesoro/piezas/cabeza-indio-completa.webp',
  character: (number: number) => `/tesoro/personaje/personaje-${number}.webp`,
  piece: (number: number) => `/tesoro/piezas/cabeza-indio-pieza_${number}.webp`,
}

const routes = {
  home: '/tesoro',
  one: '/tesoro/posta-1',
  two: '/tesoro/posta-2',
  three: '/tesoro/posta-3',
  four: '/tesoro/posta-4',
  final: '/tesoro/final',
  winners: '/tesoro/ganadores',
  certificate: '/tesoro/certificado',
}

const progressKeys = {
  start: 'tesoroPiece5',
  one: 'tesoroPosta1',
  two: 'tesoroPosta2',
  three: 'tesoroPosta3',
  four: 'tesoroPosta4',
  final: 'tesoroFinal',
  team: 'tesoroTeamName',
  raffleSubmitted: 'tesoroRaffleSubmitted',
  raffleId: 'tesoroRaffleId',
}

const RAFFLE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzJpmroCNcxy5yUM2-SCiqcqcV8SCVCVFP5egbJpqct617T_krWklr7x0hTsiyc_1XDfg/exec'
const RAFFLE_REQUEST_ERROR = 'request-failed'
const scanSources = new Set([
  'calle-a1', 'calle-a2', 'calle-b1', 'calle-b2', 'calle-c1', 'calle-c2',
  'p1-a', 'p1-b', 'p2-a', 'p2-b', 'p3-a', 'p3-b', 'p4-a', 'p4-b',
])
const scanRoutes = new Set([routes.home, routes.one, routes.two, routes.three, routes.four])
const scansInFlight = new Set<string>()

function remember(key: string) {
  try { localStorage.setItem(key, 'true') } catch { /* localStorage can be unavailable */ }
}

function savedTeam() {
  try { return localStorage.getItem(progressKeys.team) ?? '' } catch { return '' }
}

function raffleWasSubmitted() {
  try { return localStorage.getItem(progressKeys.raffleSubmitted) === 'true' } catch { return false }
}

function scanWasRecorded(src: string) {
  try { return localStorage.getItem(`tesoroScan_${src}`) === 'true' } catch { return false }
}

function trackScan(src: string, ruta: string) {
  if (scanWasRecorded(src) || scansInFlight.has(src)) return
  scansInFlight.add(src)

  void fetch(RAFFLE_ENDPOINT, {
    method: 'POST',
    // text/plain avoids a CORS preflight while preserving the JSON payload for Apps Script.
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ type: 'scan', src, ruta }),
  })
    .then(async (response) => {
      if (!response.ok) return false
      const data: unknown = await response.json()
      return typeof data === 'object' && data !== null && 'ok' in data && data.ok === true
    })
    .then((wasRecorded) => {
      if (!wasRecorded) return
      try { localStorage.setItem(`tesoroScan_${src}`, 'true') } catch { /* Tracking stays optional. */ }
    })
    .catch(() => { /* Tracking failures never affect the experience. */ })
    .finally(() => scansInFlight.delete(src))
}

function certificateFilename(teamName: string) {
  const normalized = teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `certificado-${normalized || 'puzzle-club'}.png`
}

async function waitForCertificateResources(node: HTMLElement) {
  if ('fonts' in document) await document.fonts.ready
  const images = Array.from(node.querySelectorAll('img'))

  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => reject(new Error('image-load-failed')), { once: true })
      })
    }

    if (image.naturalWidth === 0) throw new Error('image-load-failed')
    try { await image.decode() } catch { /* A decoded image is optional after a successful load. */ }
  }))
}

function nav(to: string) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function currentTesoroLocation() {
  return {
    path: window.location.pathname.replace(/\/$/, '') || routes.home,
    search: window.location.search,
  }
}

function Brand() {
  return <header className="treasure-brand"><a href="/" aria-label="Volver a Puzzle Club San Juan"><img src={ASSET.logo} alt="" /><span>Puzzle Club <small>San Juan</small></span></a></header>
}

function Layout({ children, progress = 0 }: { children: React.ReactNode, progress?: number }) {
  return <main className="treasure-app"><Brand /><div className="treasure-progress" aria-label={`${progress} de 6 piezas recuperadas`}><span>{progress} de 6 piezas</span><div><i style={{ width: `${(progress / 6) * 100}%` }} /></div></div>{children}</main>
}

function Character({ pose = 1 }: { pose?: number }) {
  return <img className="treasure-character" src={ASSET.character(pose)} alt="Ilustración del personaje de Puzzle Club" decoding="async" />
}

function Speech({ children }: { children: React.ReactNode }) {
  return <div className="treasure-speech">{children}</div>
}

function PrimaryButton({ children, onClick, type = 'button', disabled = false }: { children: React.ReactNode, onClick?: () => void, type?: 'button' | 'submit', disabled?: boolean }) {
  return <button className="treasure-button" type={type} onClick={onClick} disabled={disabled}>{children}</button>
}

function PieceReveal({ piece, letter, count, safe = false }: { piece: number, letter?: string, count: number, safe?: boolean }) {
  return <section className="piece-reveal"><img src={ASSET.piece(piece)} alt={`Pieza ${piece} del rompecabezas`} decoding="async" /><p className="eyebrow">{safe ? 'Pieza a salvo' : 'Pieza recuperada'} · {count} de 6</p>{letter && <><p className="behind">Había algo escrito detrás</p><strong className="secret-letter">{letter}</strong></>}</section>
}

function PuzzlePreview({ includeFirst = false }: { includeFirst?: boolean }) {
  const pieces = [1, 2, 3, 4, 5, 6]
  return <div className="puzzle-preview" aria-label="Rompecabezas recuperado">{pieces.map((piece) => <div key={piece} className={!includeFirst && piece === 1 ? 'puzzle-slot empty' : 'puzzle-slot'}>{includeFirst || piece !== 1 ? <img src={ASSET.piece(piece)} alt="" decoding="async" /> : <span>Falta<br />una</span>}</div>)}</div>
}

function Home() {
  const [pieceSafe, setPieceSafe] = useState(false)
  useEffect(() => {
    const reveal = window.setTimeout(() => { remember(progressKeys.start); setPieceSafe(true) }, 700)
    return () => window.clearTimeout(reveal)
  }, [])
  const [hint, setHint] = useState(false)
  return <Layout progress={pieceSafe ? 1 : 0}><section className="treasure-page hero-treasure"><div><p className="eyebrow">Especial Día de las Infancias</p><h1>El Tesoro<br /><em>Fragmentado</em></h1><Speech><p>¡Necesito su ayuda!</p><p>Estaba armando un rompecabezas de uno de mis lugares favoritos de San Juan cuando empezó a soplar el Zonda.</p><p>Primero se movieron un par de piezas. Después algunas salieron volando. Y cuando quise darme cuenta... mi rompecabezas había quedado desparramado por la ciudad.</p><p>Alcancé a salvar una sola pieza. Sé más o menos dónde fueron a parar las demás, pero voy a necesitar ayuda para recuperarlas. ¿Me acompañan?</p></Speech><aside className="practical-note"><p>📍 El recorrido se realiza a pie por la zona del Centro Cívico y Parque de Mayo. No necesitás auto.</p><p>📱 Sólo necesitás un celular con internet para escanear los fragmentos.</p><p>🗓️ Disponible el 15, 16 y 17 de agosto de 2026, hasta el lunes 17 a las 18:00.</p></aside></div><Character pose={1} /></section><section className="treasure-page start-points"><h2>¿Dónde puedo empezar? 🔎</h2><p>Buscá uno de nuestros carteles por la ciudad y escaneá su QR.<br />¡Cualquiera de ellos sirve para comenzar la aventura!</p><h3>Puntos de inicio:</h3><ul><li>Las Heras, casi Av. Central</li><li>Las Heras, casi Córdoba</li><li>España y Santa Fe</li><li>España y Av. Libertador</li><li>San Luis y Las Heras</li><li>Las Heras, casi Laprida</li></ul><p className="start-points-note">Cuando encuentres uno, escaneá el QR y seguí las pistas. 🧩</p></section>{pieceSafe && <section className="treasure-page piece-safe-flow"><PieceReveal piece={5} letter="P" count={1} safe /><Speech><p>Esta es la única que pude salvar.</p><p>No tengo idea de qué significa. Mejor acordémonos.</p><p>Ahora sí: creo que sé dónde cayó otra de las piezas...</p></Speech><article className="clue-card"><p className="eyebrow">Primera pista</p><p>Buscá un gigante sanjuanino de marcado estilo arquitectónico.</p><p>Acá se viven historias que no vas a encontrar en Instagram.</p><p>Hay tablas, pero no son de multiplicar; hay escenarios, pero nadie está actuando para TikTok.</p><p>¿Ya sabés dónde estoy?</p></article>{hint ? <p className="gentle-note">Cuando lleguen al lugar correcto, busquen el fragmento y escaneen su QR.</p> : <PrimaryButton onClick={() => setHint(true)}>Salir a buscarla</PrimaryButton>}</section>}</Layout>
}

function ImageLightbox({ src, alt, onClose }: { src: string, alt: string, onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const pointersRef = useRef(new Map<number, { x: number, y: number }>())
  const transformRef = useRef({ scale: 1, x: 0, y: 0 })
  const gestureRef = useRef({ scale: 1, x: 0, y: 0, pointerX: 0, pointerY: 0, distance: 0, midpointX: 0, midpointY: 0 })
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const updateTransform = (next: { scale: number, x: number, y: number }) => { transformRef.current = next; setTransform(next) }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown) }
  }, [onClose])

  const beginGesture = () => {
    const points = [...pointersRef.current.values()]
    const currentTransform = transformRef.current
    if (points.length === 1) {
      gestureRef.current = { ...gestureRef.current, scale: currentTransform.scale, x: currentTransform.x, y: currentTransform.y, pointerX: points[0].x, pointerY: points[0].y }
    }
    if (points.length === 2) {
      const [first, second] = points
      gestureRef.current = {
        ...gestureRef.current,
        scale: currentTransform.scale,
        x: currentTransform.x,
        y: currentTransform.y,
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        midpointX: (first.x + second.x) / 2,
        midpointY: (first.y + second.y) / 2,
      }
    }
  }

  const updateGesture = () => {
    const points = [...pointersRef.current.values()]
    const gesture = gestureRef.current
    if (points.length === 1) {
      updateTransform({ scale: gesture.scale, x: gesture.x + points[0].x - gesture.pointerX, y: gesture.y + points[0].y - gesture.pointerY })
    }
    if (points.length === 2 && gesture.distance > 0) {
      const [first, second] = points
      const midpointX = (first.x + second.x) / 2
      const midpointY = (first.y + second.y) / 2
      updateTransform({
        scale: Math.min(4, Math.max(1, gesture.scale * Math.hypot(second.x - first.x, second.y - first.y) / gesture.distance)),
        x: gesture.x + midpointX - gesture.midpointX,
        y: gesture.y + midpointY - gesture.midpointY,
      })
    }
  }

  return createPortal(<div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`Vista ampliada: ${alt}`} onClick={onClose}>
    <div className="image-lightbox-stage" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => { pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId); beginGesture() }} onPointerMove={(event) => { if (!pointersRef.current.has(event.pointerId)) return; pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); updateGesture() }} onPointerUp={(event) => { pointersRef.current.delete(event.pointerId); beginGesture() }} onPointerCancel={(event) => { pointersRef.current.delete(event.pointerId); beginGesture() }}>
      <img src={src} alt={alt} draggable={false} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }} />
    </div>
    <button ref={closeButtonRef} type="button" className="image-lightbox-close" onClick={onClose} aria-label="Cerrar imagen ampliada">×</button>
  </div>, document.body)
}

function ZoomableImage({ src, alt, className = '', width, height, loading }: { src: string, alt: string, className?: string, width?: number, height?: number, loading?: 'lazy' | 'eager' }) {
  const [isOpen, setIsOpen] = useState(false)
  return <><button type="button" className={`image-preview ${className}`} onClick={() => setIsOpen(true)} aria-label={`Ampliar imagen: ${alt}`}><img src={src} alt={alt} width={width} height={height} loading={loading} decoding="async" /></button>{isOpen && <ImageLightbox src={src} alt={alt} onClose={() => setIsOpen(false)} />}</>
}

function ImageChoice({ src, label, onClick, selected, disabled = false }: { src: string, label: string, onClick: () => void, selected?: boolean, disabled?: boolean }) {
  return <div className={`image-choice${selected ? ' selected' : ''}`}><ZoomableImage className="image-choice-preview" src={src} alt={`Opción ${label}`} loading="lazy" /><button type="button" className="image-choice-select" onClick={onClick} disabled={disabled}>Opción {label}</button></div>
}

function DidYouKnow({ children }: { children: React.ReactNode }) {
  return <aside className="did-you-know"><strong>💡 ¿Sabían que...?</strong><p>{children}</p></aside>
}

function NextClue({ children }: { children: React.ReactNode }) {
  return <><article className="clue-card"><p className="eyebrow">Próxima pista</p>{children}</article><p className="gentle-note">Cuando lleguen al lugar correcto, busquen el fragmento y escaneen su QR.</p></>
}

function PostaOne() {
  const [result, setResult] = useState<'idle' | 'error' | 'correct'>('idle')
  const choose = (label: string) => { if (label === 'B') { remember(progressKeys.one); setResult('correct') } else setResult('error') }
  return <Layout progress={result === 'correct' ? 2 : 1}><section className="treasure-page"><Character pose={3} /><Speech><p>¡Primera misión! 👀</p><p>Esta foto muestra el lugar desde otra perspectiva.</p><p>Miren la imagen y después miren a su alrededor.</p><p>¿Qué estructura está junto al lado derecho del gran espejo de agua?</p></Speech><ZoomableImage className="challenge-main theater" src="/tesoro/desafios/teatro/teatro-panoramica.jpg" alt="Teatro del Bicentenario, espejo de agua, Puente del Bicentenario y Estación San Martín" width={782} height={440} /><div className="challenge-options">{[['A', 'Palmeras'], ['B', 'Puente del Bicentenario'], ['C', 'Fuente'], ['D', 'Otro edificio (Estación San Martín)']].map(([label, text]) => <button key={label} type="button" className="challenge-option" onClick={() => choose(label)} disabled={result === 'correct'}><strong>{label}.</strong> {text}</button>)}</div>{result === 'error' && <p className="feedback error">Mmm... miren otra vez 👀<br />Comparen la foto con lo que tienen alrededor y vuelvan a intentarlo.</p>}{result === 'correct' && <section className="after-challenge"><Speech><p>¡Eso era!</p><p>Miraron el lugar desde otra perspectiva y encontraron otra pieza.</p></Speech><DidYouKnow>El Teatro del Bicentenario abrió sus puertas en 2016 y es uno de los grandes espacios culturales del país. Su sala principal fue diseñada con tecnología y acústica para recibir espectáculos de gran escala.</DidYouKnow><PieceReveal piece={2} letter="I" count={2} /><NextClue><p>No tiene escenario, pero está lleno de obras. No tiene biblioteca, pero guarda historias.</p><p>Sus paredes cambian sin moverse y lleva el nombre de un artista sanjuanino.</p></NextClue></section>}</section></Layout>
}

function PostaTwo() {
  const [stage, setStage] = useState<'look' | 'choose' | 'error' | 'correct'>('look')
  const choose = (letter: string) => { if (letter === 'C') { remember(progressKeys.two); setStage('correct') } else setStage('error') }
  return <Layout progress={stage === 'correct' ? 3 : 2}><section className="treasure-page"><Character pose={3} /><Speech><p>¡Algo cambió en esta obra! 🎨</p><p>Esta pintura es <strong>Patio porteño en 1850</strong>, de Prilidiano Pueyrredón.</p><p>Sólo una de estas cuatro imágenes conserva todos los detalles de la obra original.</p><p>Miren con atención las personas, los animales, los edificios y el patio.</p><p>¿Cuál es la original?</p></Speech>{stage === 'look' ? <section className="art-view"><ZoomableImage src="/tesoro/desafios/bellas-artes/patio-original.webp" alt="Patio porteño en 1850, obra original" width={1400} height={991} /><ArtCredit /><PrimaryButton onClick={() => setStage('choose')}>Ver las opciones</PrimaryButton></section> : <><ArtCredit /><div className="image-detail-hint"><p>🔎 Tocá una imagen para verla más grande.</p><p>Cuando encuentren la correcta, toquen el botón “Opción A, B, C o D” debajo de la imagen para responder.</p></div><div className="choice-grid art">{['a', 'b', 'c', 'd'].map((x) => <ImageChoice key={x} src={`/tesoro/desafios/bellas-artes/bellas-artes-opcion-${x}.webp`} label={x.toUpperCase()} onClick={() => choose(x.toUpperCase())} disabled={stage === 'correct'} />)}</div>{stage === 'error' && <div className="feedback error">Mmm... hay un detalle que no pertenece a la obra. 👀<br />Miren otra vez. Pueden intentarlo de nuevo.<div className="feedback-actions"><button type="button" onClick={() => setStage('look')}>Volver a mirar</button><button type="button" onClick={() => setStage('choose')}>Intentar otra vez</button></div></div>}{stage === 'correct' && <section className="after-challenge"><Speech><p>¡Tienen ojo de artista! 🎨</p><p>Esa es la obra original.</p><p>Y mirando con tanta atención... ¡encontraron otra pieza!</p></Speech><DidYouKnow>La colección del museo comenzó a formarse alrededor de 1850, impulsada por Franklin Rawson, Domingo F. Sarmiento y Procesa Sarmiento. Su actual edificio abrió al público en 2011.</DidYouKnow><PieceReveal piece={6} letter="E" count={3} /><NextClue><p>La próxima pieza cayó en un lugar pensado para explorar, trepar, cruzar puentes y deslizarse.</p><p>Busquen torres, redes y toboganes entre los juegos del Parque de Mayo.</p></NextClue></section>}</>}</section></Layout>
}

const PARK_FOURTH_ELEMENT = '🦖 Un dinosaurio'
const parkExplorerItems = ['🌴 Una palmera', '🛝 Un tobogán', '🕸️ Una red para trepar', PARK_FOURTH_ELEMENT]

function PostaThree() {
  const [foundItems, setFoundItems] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const complete = foundItems.length === parkExplorerItems.length
  const toggleItem = (item: string) => setFoundItems((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])
  const finish = () => { if (!complete) return; remember(progressKeys.three); setFinished(true) }
  return <Layout progress={finished ? 4 : 3}><section className="treasure-page"><Character pose={4} /><Speech><p>🔎 Misión de exploradores</p><p>¡Esta pieza cayó en el mejor lugar posible! 🛝</p><p>Miren alrededor y encuentren estas cuatro cosas:</p></Speech><div className="explorer-checklist" aria-label="Checklist de exploradores">{parkExplorerItems.map((item) => { const found = foundItems.includes(item); return <button key={item} type="button" aria-pressed={found} className={found ? 'checked' : ''} onClick={() => toggleItem(item)}><span aria-hidden="true">{found ? '✓' : '○'}</span>{item}</button> })}</div>{!finished && <PrimaryButton onClick={finish} disabled={!complete}>¡Sí, las encontramos!</PrimaryButton>}{finished && <section className="after-challenge"><Speech><p>¡Misión cumplida! 🎉</p><p>Parece que el Zonda no pudo esconderlas de ustedes.</p><p>Y entre tantos juegos... ¡apareció otra pieza!</p></Speech><DidYouKnow>Este sector de juegos fue inaugurado en 2025 y tiene espacios pensados para distintas edades. Sus estructuras incluyen torres, puentes, redes, toboganes y juegos de trepar.</DidYouKnow><PieceReveal piece={3} letter="Z" count={4} /><NextClue><p>La última pieza está cerca de una escultura que no se ve igual desde todos lados.</p><p>Busquen un monumento con un gran hueco en el centro, dedicado al deporte.</p></NextClue></section>}</section></Layout>
}

function ArtCredit() {
  return <p className="art-credit"><strong>Patio porteño en 1850</strong><br />Prilidiano Pueyrredón<br /><small>Imagen: Artvee · obra de dominio público</small></p>
}

function PostaFour() {
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<'idle' | 'error' | 'correct'>('idle')
  const monumentSteps = ['1. Miren el monumento de frente.', '2. Caminen hasta verlo desde uno de sus costados.', '3. Busquen el gran hueco del centro y miren a través de él.']
  const readyForQuestion = steps.length === monumentSteps.length
  const toggleStep = (step: string) => setSteps((current) => current.includes(step) ? current.filter((value) => value !== step) : [...current, step])
  const choose = (letter: string) => { if (letter === 'B') { remember(progressKeys.four); setResult('correct') } else setResult('error') }
  return <Layout progress={result === 'correct' ? 5 : 4}><section className="treasure-page"><Character pose={5} /><Speech><p>🌀 ¡Última misión!</p><p>Este monumento guarda un secreto: no se ve igual desde todos lados.</p><p>Para encontrar la última pieza, investiguen:</p></Speech><div className="explorer-checklist" aria-label="Pasos para observar el monumento">{monumentSteps.map((step) => { const complete = steps.includes(step); return <button key={step} type="button" aria-pressed={complete} className={complete ? 'checked' : ''} onClick={() => toggleStep(step)}><span aria-hidden="true">{complete ? '✓' : '○'}</span>{step}</button> })}</div>{readyForQuestion && <section className="after-challenge"><h2 className="challenge-question">Después de rodearlo, ¿qué descubrieron?</h2><div className="challenge-options">{[['A', 'Que se ve igual desde cualquier lado.'], ['B', 'Que su forma cambia según desde dónde lo miramos.'], ['C', 'Que el centro es completamente cerrado.']].map(([label, text]) => <button key={label} type="button" className="challenge-option" onClick={() => choose(label)} disabled={result === 'correct'}><strong>{label}.</strong> {text}</button>)}</div>{result === 'error' && <p className="feedback error">Mmm... miren el monumento una vez más 👀<br />Prueben cambiar de lugar y vuelvan a intentarlo.</p>}{result === 'correct' && <section className="after-challenge"><Speech><p>¡Exacto! 👀</p><p>La forma de una escultura cambia según el lugar desde donde la observamos.</p><p>Y mientras daban la vuelta... ¡encontraron la última pieza! 🧩</p></Speech><DidYouKnow>El ‘Rosetón de los Deportes’ fue inaugurado para el Mundial de Hockey sobre Patines de 1970. Pesa unas 70 toneladas y su forma representa los cinco anillos olímpicos, el movimiento, la velocidad y la fuerza.</DidYouKnow><PieceReveal piece={4} letter="A" count={5} /><section className="final-turn"><PuzzlePreview /><Speech><p><strong>Esperá...</strong></p><p>Una, dos, tres, cuatro, cinco.</p><p><strong>Falta una.</strong></p><p>Recuperamos todas las piezas que vi volar por la ciudad, pero el rompecabezas todavía no está completo...</p><p>Quizás esas letras que encontramos puedan decirnos algo.</p></Speech><PrimaryButton onClick={() => nav(routes.final)}>Juntar las piezas</PrimaryButton></section></section>}</section>}</section></Layout>
}

function Final() {
  const [answer, setAnswer] = useState(''); const [result, setResult] = useState<'idle' | 'error' | 'correct'>('idle')
  const submit = (event: FormEvent) => { event.preventDefault(); if (answer.trim().toLocaleUpperCase('es-AR') === 'PIEZA') { remember(progressKeys.final); setResult('correct') } else setResult('error') }
  return <Layout progress={result === 'correct' ? 6 : 5}><section className="treasure-page final-answer"><Character pose={6} /><p className="letter-line large">Z · A · I · P · E</p><Speech><p>Encontramos una letra detrás de cada fragmento.</p><p>Separadas no parecían decir demasiado...</p><p><strong>¿Qué palabra esconden estas cinco letras?</strong></p></Speech><form onSubmit={submit} className="answer-form"><label htmlFor="answer">La palabra secreta</label><input id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escribí la palabra" autoCapitalize="characters" /><PrimaryButton type="submit">Descubrir</PrimaryButton></form>{result === 'error' && <p className="feedback error">Mmm... todavía no. Probá ordenando las letras de otra manera.</p>}{result === 'correct' && <section className="after-challenge"><Speech><p>¡PIEZA! Claro... ¡Eso es exactamente lo que nos falta!</p></Speech><div className="final-puzzle completed-puzzle"><img src={ASSET.complete} alt="Rompecabezas reconstruido de Cabeza del Indio" width={1072} height={1350} decoding="async" /><svg className="completed-puzzle-outline" viewBox="0 0 100 126" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0V15c-6 0-6 12 0 12v15M50 42v15c6 0 6 12 0 12v15M50 84v15c-6 0-6 12 0 12v15" /><path d="M0 42h17c0-6 12-6 12 0h21M50 42h17c0 6 12 6 12 0h21" /><path d="M0 84h17c0 6 12 6 12 0h21M50 84h17c0-6 12-6 12 0h21" /></svg></div><PrimaryButton onClick={() => nav(routes.winners)}>Ver el tesoro</PrimaryButton></section>}</section></Layout>
}

function Winners() {
  return <Layout progress={6}><section className="treasure-page winners"><img className="treasure-photo" src={ASSET.complete} alt="Cabeza del Indio, Sierra de Marquesado, San Juan" width={1072} height={1350} fetchPriority="high" decoding="async" /><p className="eyebrow">Tesoro reconstruido</p><h1>¡Encontraron el<br /><em>Tesoro Fragmentado!</em></h1><h2>Cabeza del Indio <small>Sierra de Marquesado · San Juan</small></h2><div className="tourist-note"><p><strong>¿Sabías que...?</strong></p><p>La Cabeza del Indio se encuentra en la Sierra de Marquesado y representa la presencia originaria en la Quebrada. Aunque suele atribuirse al escultor Luis Perlotti, no existen datos certeros que confirmen su autoría.</p><p>Esta aventura no funciona como guía de acceso: no recomendamos intentar llegar usando únicamente la información del juego. Para una visita cuidada, consulten opciones oficiales, prestadores habilitados e información turística adecuada.</p></div><p className="treasure-logistics">La Cabeza del Indio es el tesoro descubierto al final del juego. No es necesario trasladarse hasta allí para completar la experiencia.</p><Speech><p>Gracias por recorrer San Juan conmigo y ayudarme a reconstruir mi rompecabezas.</p><p>Antes de cerrar esta aventura, quiero que se lleven un recuerdo.</p></Speech><PrimaryButton onClick={() => nav(routes.certificate)}>Crear nuestro certificado</PrimaryButton></section></Layout>
}

function Certificate() {
  const certificateRef = useRef<HTMLElement>(null)
  const isExportingRef = useRef(false)
  const [team, setTeam] = useState(savedTeam); const [step, setStep] = useState<'name' | 'photo' | 'certificate'>('name'); const [photo, setPhoto] = useState<string | null>(null); const [photoError, setPhotoError] = useState(''); const [raffle, setRaffle] = useState(false); const [exportState, setExportState] = useState<'idle' | 'preparing'>('idle'); const [exportError, setExportError] = useState(''); const [canShareCertificate, setCanShareCertificate] = useState(false)
  const saveName = (event: FormEvent) => { event.preventDefault(); const value = team.trim(); if (!value) return; try { localStorage.setItem(progressKeys.team, value) } catch { /* optional persistence */ }; setTeam(value); setStep('photo') }
  const onPhoto = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; setPhotoError(''); if (!file) return; if (!file.type.startsWith('image/')) { setPhotoError('Elegí un archivo de imagen.') ; return } if (file.size > 8 * 1024 * 1024) { setPhotoError('Elegí una foto de hasta 8 MB para cuidarnos de problemas de memoria.') ; return } const reader = new FileReader(); reader.onload = () => { setPhoto(String(reader.result)); setStep('certificate') }; reader.readAsDataURL(file) }
  useEffect(() => {
    const shareNavigator = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
    if (!shareNavigator.share || !shareNavigator.canShare) return
    const probe = new File([''], 'certificado.png', { type: 'image/png' })
    setCanShareCertificate(shareNavigator.canShare({ files: [probe] }))
  }, [])
  const createCertificatePng = async () => {
    const node = certificateRef.current
    if (!node) throw new Error('certificate-not-ready')
    await waitForCertificateResources(node)
    const dataUrl = await toPng(node, { backgroundColor: '#FAF7F2', cacheBust: true, pixelRatio: 2 })
    const blob = await fetch(dataUrl).then((response) => response.blob())
    if (!blob.size) throw new Error('certificate-not-ready')
    return { dataUrl, blob, filename: certificateFilename(team) }
  }
  const prepareCertificate = async () => {
    if (isExportingRef.current) return null
    isExportingRef.current = true
    setExportError('')
    setExportState('preparing')
    try { return await createCertificatePng() } catch { setExportError('No pudimos preparar el certificado. Intentá nuevamente.'); return null } finally { isExportingRef.current = false; setExportState('idle') }
  }
  const downloadCertificate = async () => {
    const png = await prepareCertificate()
    if (!png) return
    const link = document.createElement('a')
    link.href = png.dataUrl
    link.download = png.filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  const shareCertificate = async () => {
    const png = await prepareCertificate()
    if (!png) return
    const file = new File([png.blob], png.filename, { type: 'image/png' })
    const shareNavigator = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
    if (!shareNavigator.share || !shareNavigator.canShare?.({ files: [file] })) return
    try {
      await shareNavigator.share({ title: 'El Tesoro Fragmentado', text: '¡Completamos El Tesoro Fragmentado de Puzzle Club San Juan! 🧩', files: [file] })
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setExportError('No pudimos preparar el certificado. Intentá nuevamente.')
    }
  }
  return <Layout progress={6}><section className="treasure-page certificate-page">{step === 'name' && <><Character pose={1} /><Speech><p>Antes de irnos... ¿Cómo se llama su equipo?</p></Speech><form onSubmit={saveName} className="answer-form"><label htmlFor="team">Nombre del equipo o familia</label><input id="team" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Los Rompecocos" maxLength={64} required /><small className="field-help">Así aparecerá en su certificado.</small><PrimaryButton type="submit">Continuar</PrimaryButton></form></>}{step === 'photo' && <section className="photo-step"><Character pose={6} /><h1>¿Quieren sumar una foto al recuerdo?</h1><p>Es opcional. El certificado se verá genial de todas formas.</p><input className="visually-hidden" id="camera-photo" type="file" accept="image/*" capture="environment" onChange={onPhoto} /><input className="visually-hidden" id="gallery-photo" type="file" accept="image/*" onChange={onPhoto} /><div className="photo-actions"><label className="treasure-button" htmlFor="camera-photo">Sacar foto</label><label className="treasure-button secondary" htmlFor="gallery-photo">Elegir de la galería</label><PrimaryButton onClick={() => setStep('certificate')}>Prefiero sin foto</PrimaryButton></div>{photoError && <p className="feedback error">{photoError}</p>}<p className="privacy-note">La foto se usa únicamente en tu dispositivo para crear el certificado. Puzzle Club no la guarda ni la recibe.</p></section>}{step === 'certificate' && <><section ref={certificateRef} className="certificate"><div className="certificate-top"><img src={ASSET.logo} alt="" /><span>Puzzle Club San Juan</span></div><div className="certificate-content"><p className="eyebrow">Tesoro Fragmentado · Especial Día de las Infancias</p><h1>Certificado de<br /><em>Exploradores</em></h1><p>Se reconoce a</p><h2>{team}</h2><p>por haber completado<br /><strong>El Tesoro Fragmentado: Especial Día de las Infancias</strong></p><p>recuperando las piezas perdidas por San Juan y descubriendo el tesoro final.</p>{photo ? <img className="certificate-photo" src={photo} alt="Recuerdo del equipo" /> : <div className="certificate-art"><Character pose={3} /><img src={ASSET.piece(5)} alt="" /></div>}<p className="certificate-date">15, 16 y 17 de agosto de 2026</p><span className="certificate-seal">Tesoro reconstruido · Edición 001</span></div><footer>Puzzle Club San Juan</footer></section><div className="certificate-controls"><section className="certificate-reward"><h2>Su recuerdo de la aventura</h2><PrimaryButton onClick={downloadCertificate} disabled={exportState === 'preparing'}>{exportState === 'preparing' ? 'Preparando certificado...' : 'Descargar certificado'}</PrimaryButton>{canShareCertificate && <PrimaryButton onClick={shareCertificate} disabled={exportState === 'preparing'}>Compartir</PrimaryButton>}{exportError && <p className="feedback error" role="alert">{exportError}</p>}<div className="certificate-share"><h2>Compartí su aventura 🧩</h2><p>Suban el certificado a sus historias y, si quieren, etiqueten a <strong>@puzzleclubsj</strong> para que podamos verlo. 💛</p></div></section><section className="raffle-invitation"><h2>¿Quieren participar por un premio de Puzzle Club?</h2><PrimaryButton onClick={() => setRaffle(true)}>Participar del sorteo</PrimaryButton></section></div>{raffle && <Raffle team={team} />}</>}</section></Layout>
}

function Raffle({ team }: { team: string }) {
  const [responsible, setResponsible] = useState('')
  const [contact, setContact] = useState('')
  const [members, setMembers] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>(raffleWasSubmitted() ? 'success' : 'idle')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (status === 'loading') return

    const cleanTeam = team.trim()
    const cleanResponsible = responsible.trim()
    const cleanContact = contact.trim()
    const parsedMembers = Number(members)

    if (!cleanTeam || !cleanResponsible || !cleanContact || !Number.isInteger(parsedMembers) || parsedMembers < 2) {
      setError('Completen todos los campos. La cantidad de integrantes debe ser un número entero de al menos 2.')
      return
    }

    setError('')
    setStatus('loading')

    try {
      // Google Apps Script rejects CORS preflight requests. The JSON body is kept intact,
      // while text/plain makes this a CORS-safelisted POST and avoids that preflight.
      const response = await fetch(RAFFLE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({
          equipo: cleanTeam,
          responsable: cleanResponsible,
          contacto: cleanContact,
          integrantes: parsedMembers,
        }),
      })

      let data: unknown
      try {
        data = await response.json()
      } catch {
        throw new Error(RAFFLE_REQUEST_ERROR)
      }
      if (!response.ok || typeof data !== 'object' || data === null || !('ok' in data) || data.ok !== true) throw new Error(RAFFLE_REQUEST_ERROR)

      try {
        localStorage.setItem(progressKeys.raffleSubmitted, 'true')
        if ('id' in data && typeof data.id === 'string' && data.id.trim()) localStorage.setItem(progressKeys.raffleId, data.id)
      } catch { /* The confirmation remains visible even when storage is unavailable. */ }
      setStatus('success')
    } catch {
      setStatus('idle')
      setError('No pudimos registrar su participación. Revisen la conexión e intenten nuevamente.')
    }
  }

  return <section className="raffle"><h2>Participen por el premio de Puzzle Club</h2><p>Cada equipo que haya completado El Tesoro Fragmentado puede participar una vez. El sorteo se realizará en vivo por Instagram el lunes 17 a las 19 h.</p>{status === 'success' ? <div className="raffle-success"><h3>🎉 ¡Ya están participando!</h3><p>Su equipo quedó anotado para el sorteo.</p><p>Nos vemos en el vivo de Instagram el lunes 17 a las 19 h.</p></div> : <form onSubmit={submit} noValidate><label>Nombre del equipo o familia<input value={team} readOnly /></label><label>Nombre de una persona responsable<input value={responsible} onChange={(event) => setResponsible(event.target.value)} disabled={status === 'loading'} required /></label><label>WhatsApp o Instagram<input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="264... o @usuario" disabled={status === 'loading'} required /></label><label>Cantidad de personas que hicieron el recorrido<input value={members} onChange={(event) => setMembers(event.target.value)} type="number" min="2" step="1" inputMode="numeric" disabled={status === 'loading'} required /></label>{error && <p className="feedback error" role="alert">{error}</p>}<PrimaryButton type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Registrando participación...' : error ? 'Intentar de nuevo' : 'Participar del sorteo'}</PrimaryButton></form>}<div className="mission-end"><h2>¡Misión cumplida!</h2><p>Gracias por jugar.</p><p>Y si se cruzan con el Zonda... no le presten ningún rompecabezas.</p></div></section>
}

export default function TesoroApp() {
  const [location, setLocation] = useState(currentTesoroLocation)
  const { path, search } = location
  useEffect(() => { const update = () => setLocation(currentTesoroLocation()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update) }, [])
  useEffect(() => {
    const src = new URLSearchParams(search).get('src')
    if (!src || !scanSources.has(src) || !scanRoutes.has(path)) return
    trackScan(src, path)
  }, [path, search])
  const Page = useMemo(() => ({ [routes.home]: Home, [routes.one]: PostaOne, [routes.two]: PostaTwo, [routes.three]: PostaThree, [routes.four]: PostaFour, [routes.final]: Final, [routes.winners]: Winners, [routes.certificate]: Certificate }[path] ?? Home), [path])
  return <Page />
}
