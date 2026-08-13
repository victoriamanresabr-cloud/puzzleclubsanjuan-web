import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'

const ASSET = {
  logo: '/optimized/images/logo-icon-pcsj.webp',
  complete: '/tesoro/piezas/coloraditas_completa.webp',
  character: (number: number) => `/tesoro/personaje/personaje-${number}.webp`,
  piece: (number: number) => `/tesoro/piezas/coloraditas_pieza_${number}.webp`,
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
  return <Layout progress={pieceSafe ? 1 : 0}><section className="treasure-page hero-treasure"><div><p className="eyebrow">Especial Día del Niño</p><h1>El Tesoro<br /><em>Fragmentado</em></h1><Speech><p>¡Necesito su ayuda!</p><p>Estaba armando un rompecabezas de uno de mis lugares favoritos de San Juan cuando empezó a soplar el Zonda.</p><p>Primero se movieron un par de piezas. Después algunas salieron volando. Y cuando quise darme cuenta... mi rompecabezas había quedado desparramado por la ciudad.</p><p>Alcancé a salvar una sola pieza. Sé más o menos dónde fueron a parar las demás, pero voy a necesitar ayuda para recuperarlas. ¿Me acompañan?</p></Speech></div><Character pose={1} /></section>{pieceSafe && <section className="treasure-page piece-safe-flow"><PieceReveal piece={5} letter="P" count={1} safe /><Speech><p>Esta es la única que pude salvar.</p><p>No tengo idea de qué significa. Mejor acordémonos.</p><p>Ahora sí: creo que sé dónde cayó otra de las piezas...</p></Speech><article className="clue-card"><p className="eyebrow">Primera pista</p><p>Buscá un gigante sanjuanino de marcado estilo arquitectónico.</p><p>Acá se viven historias que no vas a encontrar en Instagram.</p><p>Hay tablas, pero no son de multiplicar; hay escenarios, pero nadie está actuando para TikTok.</p><p>¿Ya sabés dónde estoy?</p></article>{hint ? <p className="gentle-note">Cuando lleguen al lugar correcto, busquen el fragmento y escaneen su QR.</p> : <PrimaryButton onClick={() => setHint(true)}>Salir a buscarla</PrimaryButton>}</section>}</Layout>
}

function ImageChoice({ src, label, onClick, selected, disabled = false }: { src: string, label: string, onClick: () => void, selected?: boolean, disabled?: boolean }) {
  return <button type="button" className={`image-choice${selected ? ' selected' : ''}`} onClick={onClick} disabled={disabled}><img src={src} alt={`Opción ${label}`} loading="lazy" decoding="async" /><span>Opción {label}</span></button>
}

function PostaOne() {
  const [result, setResult] = useState<'idle' | 'error' | 'correct'>('idle')
  const choose = (label: string) => { if (label === 'D') { remember(progressKeys.one); setResult('correct') } else setResult('error') }
  return <Layout progress={result === 'correct' ? 2 : 1}><section className="treasure-page"><Character pose={3} /><Speech><p>¡Me encontraron!</p><p>Y creo que la pieza está cerca... Pero el Zonda dejó esta imagen hecha un desastre.</p><p>¿Cuál de estas piezas completa correctamente la escena?</p></Speech><img className="challenge-main theater" src="/tesoro/desafios/teatro/teatro-incompleto.webp" alt="Escena incompleta" decoding="async" /><div className="choice-grid square">{['a', 'b', 'c', 'd'].map((x) => <ImageChoice key={x} src={`/tesoro/desafios/teatro/opcion-${x}.webp`} label={x.toUpperCase()} onClick={() => choose(x.toUpperCase())} disabled={result === 'correct'} />)}</div>{result === 'error' && <p className="feedback error">Casi... Mirá bien las líneas y los colores. ¿Todo continúa donde debería?</p>}{result === 'correct' && <section className="after-challenge"><Speech><p>¡Encaja perfecto! ¡Miren lo que estaba escondido!</p></Speech><PieceReveal piece={2} letter="I" count={2} /><p className="letter-line">I · P...</p><Speech><p>Esto empieza a ser sospechoso.</p></Speech><article className="clue-card"><p className="eyebrow">Próxima pista</p><p>Hace más de 50 años empezaron a imaginarme en este mismo lugar y tengo algunas de las mejores vistas de la ciudad.</p><p>Desde acá veo un teatro, un puente y la Legislatura. Y, como si fuera poco, dos de las avenidas más importantes de San Juan pasan muy cerca de mí.</p><p>¿Quién soy?</p></article></section>}</section></Layout>
}

const pairs = [
  { left: 'ZON', right: 'DA', word: 'ZONDA' }, { left: 'CU', right: 'YO', word: 'CUYO' },
  { left: 'DI', right: 'QUE', word: 'DIQUE' }, { left: 'CE', right: 'RRO', word: 'CERRO' },
]

function PostaTwo() {
  const [left, setLeft] = useState<string | null>(null); const [done, setDone] = useState<string[]>([]); const [error, setError] = useState(false)
  const chooseRight = (right: string) => { if (!left) return; const match = pairs.find((pair) => pair.left === left && pair.right === right); if (match) { const next = [...done, match.word]; setDone(next); setLeft(null); setError(false); if (next.length === pairs.length) remember(progressKeys.two) } else { setError(true); setLeft(null) } }
  const complete = done.length === pairs.length
  return <Layout progress={complete ? 3 : 2}><section className="treasure-page"><Character pose={3} /><Speech><p>¡Llegaron!</p><p>Y... sí. Otra vez el Zonda. Parece que no se conformó con llevarse mis piezas.</p><p>También partió estas palabras por la mitad y las mezcló. ¿Pueden volver a unirlas?</p></Speech><section className="word-game" aria-label="Unir mitades de palabras"><div><p className="eyebrow">Primero elegí una mitad</p>{pairs.map(({ left: item, word }) => <button key={item} type="button" className={`word-half ${left === item ? 'selected' : ''} ${done.includes(word) ? 'done' : ''}`} disabled={done.includes(word)} onClick={() => { setLeft(item); setError(false) }}>{item}</button>)}</div><div><p className="eyebrow">Después completala</p>{['RRO', 'YO', 'DA', 'QUE'].map((item) => <button key={item} type="button" className="word-half" onClick={() => chooseRight(item)}>{item}</button>)}</div></section>{done.length > 0 && <div className="completed-words">{done.map((word) => <span key={word}>{word}</span>)}</div>}{error && <p className="feedback error">Esa combinación no forma una de las palabras. Probemos otra vez.</p>}{complete && <section className="after-challenge"><Speech><p>¡Lo hicieron! Parece que entre todo este lío había algo más...</p></Speech><PieceReveal piece={6} letter="E" count={3} /><p className="letter-line">I · P · E</p><Speech><p>Definitivamente esto no es casualidad. Guardemos las letras. Después vemos qué quieren decir.</p></Speech><article className="clue-card"><p className="eyebrow">Próxima pista</p><p>No tiene escenario, pero está lleno de obras. No tiene biblioteca, pero guarda historias.</p><p>Sus paredes cambian sin moverse y lleva el nombre de un artista sanjuanino. La próxima pieza voló hasta ahí.</p></article></section>}</section></Layout>
}

function PostaThree() {
  const [stage, setStage] = useState<'look' | 'choose' | 'error' | 'correct'>('look')
  const choose = (letter: string) => { if (letter === 'C') { remember(progressKeys.three); setStage('correct') } else setStage('error') }
  return <Layout progress={stage === 'correct' ? 4 : 3}><section className="treasure-page"><Character pose={4} /><Speech><p>¡Otra encontrada!</p><p>Pero antes de recuperar la pieza necesito que me ayuden con algo. En este lugar aprendí que mirar y observar no siempre son lo mismo.</p><p>Vamos a comprobar qué tan atentos estuvieron hoy.</p></Speech>{stage === 'look' ? <section className="art-view"><img src="/tesoro/desafios/bellas-artes/patio-original.webp" alt="Patio porteño en 1850, para memorizar" width={1400} height={991} decoding="async" /><ArtCredit /><p>Miren colores, formas, personas, objetos y pequeños detalles. Cuando crean que la memorizaron, continúen.</p><PrimaryButton onClick={() => setStage('choose')}>Ya la memorizamos</PrimaryButton></section> : <><ArtCredit /><div className="choice-grid art">{['a', 'b', 'c', 'd'].map((x) => <ImageChoice key={x} src={`/tesoro/desafios/bellas-artes/bellas-artes-opcion-${x}.webp`} label={x.toUpperCase()} onClick={() => choose(x.toUpperCase())} disabled={stage === 'correct'} />)}</div>{stage === 'error' && <div className="feedback error">Mmm... algo cambió. Pueden mirar la obra otra vez.<div className="feedback-actions"><button type="button" onClick={() => setStage('look')}>Volver a mirar</button><button type="button" onClick={() => setStage('choose')}>Intentar otra vez</button></div></div>}{stage === 'correct' && <section className="after-challenge"><Speech><p>¡Tienen ojo de artista! Y miren qué apareció...</p></Speech><PieceReveal piece={3} letter="Z" count={4} /><p className="letter-line">Z · I · P · E</p><Speech><p>Una letra más... Tengo la sensación de que estamos muy cerca.</p></Speech><article className="clue-card"><p className="eyebrow">Próxima pista</p><p>¡Otra más! El Zonda no se la llevó muy lejos esta vez...</p><p>Para encontrar la próxima pieza, buscá un rincón donde las protagonistas no necesitan escenario. Tienen espinas, pero nadie les teme. Una pérgola blanca las acompaña entre senderos y verde. Seguí su perfume.</p></article></section>}</>}</section></Layout>
}

function ArtCredit() {
  return <p className="art-credit"><strong>Patio porteño en 1850</strong><br />Prilidiano Pueyrredón<br /><small>Imagen: Artvee · obra de dominio público</small></p>
}

function PostaFour() {
  const [result, setResult] = useState<'idle' | 'error' | 'correct'>('idle')
  const choose = (letter: string) => { if (letter === 'C') { remember(progressKeys.four); setResult('correct') } else setResult('error') }
  return <Layout progress={result === 'correct' ? 5 : 4}><section className="treasure-page"><Character pose={5} /><Speech><p>¡Llegaron!</p><p>Estoy casi seguro de que vi una pieza caer entre las flores. Pero este jardín también quedó un poquito desordenado...</p></Speech><section className="garden-game"><div className="garden-grid" aria-label="Cuadrícula de flores"><span>ROSA</span><span>MARGARITA</span><span>TULIPÁN</span><span>TULIPÁN</span><span>ROSA</span><span>MARGARITA</span><span>MARGARITA</span><strong>?</strong><span>ROSA</span></div><p>Cada fila y cada columna debe tener una vez cada tipo de flor.</p><div className="choice-grid flowers">{['a', 'b', 'c', 'd'].map((x) => <ImageChoice key={x} src={`/tesoro/desafios/rosedal/opcion-${x}.webp`} label={x.toUpperCase()} onClick={() => choose(x.toUpperCase())} disabled={result === 'correct'} />)}</div></section>{result === 'error' && <p className="feedback error">Esa dejaría el jardín un poquito desordenado. Fijate qué flores aparecen en cada fila y en cada columna.</p>}{result === 'correct' && <section className="after-challenge"><Speech><p>¡Eso es! Cada flor volvió a su lugar. Y entre ellas estaba...</p></Speech><PieceReveal piece={4} letter="A" count={5} /><p className="letter-line">Z · A · I · P · E</p><section className="final-turn"><PuzzlePreview /><Speech><p><strong>Esperá...</strong></p><p>Una, dos, tres, cuatro, cinco.</p><p><strong>Falta una.</strong></p><p>Recuperamos todas las piezas que vi volar por la ciudad, pero el rompecabezas todavía no está completo...</p><p>Quizás esas letras que encontramos puedan decirnos algo.</p></Speech><PrimaryButton onClick={() => nav(routes.final)}>Juntar las piezas</PrimaryButton></section></section>}</section></Layout>
}

function Final() {
  const [answer, setAnswer] = useState(''); const [result, setResult] = useState<'idle' | 'error' | 'correct'>('idle')
  const submit = (event: FormEvent) => { event.preventDefault(); if (answer.trim().toLocaleUpperCase('es-AR') === 'PIEZA') { remember(progressKeys.final); setResult('correct') } else setResult('error') }
  return <Layout progress={result === 'correct' ? 6 : 5}><section className="treasure-page final-answer"><Character pose={6} /><p className="letter-line large">Z · A · I · P · E</p><Speech><p>Encontramos una letra detrás de cada fragmento.</p><p>Separadas no parecían decir demasiado...</p><p><strong>¿Qué palabra esconden estas cinco letras?</strong></p></Speech><form onSubmit={submit} className="answer-form"><label htmlFor="answer">La palabra secreta</label><input id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escribí la palabra" autoCapitalize="characters" /><PrimaryButton type="submit">Descubrir</PrimaryButton></form>{result === 'error' && <p className="feedback error">Mmm... todavía no. Probá ordenando las letras de otra manera.</p>}{result === 'correct' && <section className="after-challenge"><Speech><p>¡PIEZA! Claro... ¡Eso es exactamente lo que nos falta!</p></Speech><div className="final-puzzle"><img className="completed-piece" src={ASSET.piece(1)} alt="Última pieza encontrada" decoding="async" /><img src={ASSET.complete} alt="Rompecabezas completo de la Cueva de las Coloraditas" width={1072} height={1350} decoding="async" /></div><PrimaryButton onClick={() => nav(routes.winners)}>Ver el tesoro</PrimaryButton></section>}</section></Layout>
}

function Winners() {
  return <Layout progress={6}><section className="treasure-page winners"><img className="treasure-photo" src={ASSET.complete} alt="Cueva de las Coloraditas, Ullum, San Juan" width={1072} height={1350} fetchPriority="high" decoding="async" /><p className="eyebrow">Tesoro reconstruido</p><h1>¡Encontraron el<br /><em>Tesoro Fragmentado!</em></h1><h2>Cueva de las Coloraditas <small>Ullum, San Juan</small></h2><div className="tourist-note"><p>La Cueva de las Coloraditas está en la zona de Ullum y forma parte de un entorno de trekking de gran belleza natural.</p><p>Esta aventura no funciona como guía de acceso: no recomendamos intentar llegar usando únicamente la información del juego. Para una visita cuidada, consulten opciones oficiales, prestadores habilitados e información turística adecuada.</p></div><Speech><p>Gracias por recorrer San Juan conmigo y ayudarme a reconstruir mi rompecabezas.</p><p>Antes de cerrar esta aventura, quiero que se lleven un recuerdo.</p></Speech><PrimaryButton onClick={() => nav(routes.certificate)}>Crear nuestro certificado</PrimaryButton></section></Layout>
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
  return <Layout progress={6}><section className="treasure-page certificate-page">{step === 'name' && <><Character pose={1} /><Speech><p>Antes de irnos... ¿Cómo se llama su equipo?</p></Speech><form onSubmit={saveName} className="answer-form"><label htmlFor="team">Nombre del equipo o familia</label><input id="team" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Los Rompecocos" maxLength={64} required /><small className="field-help">Así aparecerá en su certificado.</small><PrimaryButton type="submit">Continuar</PrimaryButton></form></>}{step === 'photo' && <section className="photo-step"><Character pose={6} /><h1>¿Quieren sumar una foto al recuerdo?</h1><p>Es opcional. El certificado se verá genial de todas formas.</p><input className="visually-hidden" id="camera-photo" type="file" accept="image/*" capture="environment" onChange={onPhoto} /><input className="visually-hidden" id="gallery-photo" type="file" accept="image/*" onChange={onPhoto} /><div className="photo-actions"><label className="treasure-button" htmlFor="camera-photo">Sacar foto</label><label className="treasure-button secondary" htmlFor="gallery-photo">Elegir de la galería</label><PrimaryButton onClick={() => setStep('certificate')}>Prefiero sin foto</PrimaryButton></div>{photoError && <p className="feedback error">{photoError}</p>}<p className="privacy-note">La foto se usa únicamente en tu dispositivo para crear el certificado. Puzzle Club no la guarda ni la recibe.</p></section>}{step === 'certificate' && <><section ref={certificateRef} className="certificate"><div className="certificate-top"><img src={ASSET.logo} alt="" /><span>Puzzle Club San Juan</span></div><div className="certificate-content"><p className="eyebrow">Tesoro Fragmentado · Especial Día del Niño</p><h1>Certificado de<br /><em>Exploradores</em></h1><p>Se reconoce a</p><h2>{team}</h2><p>por haber completado<br /><strong>El Tesoro Fragmentado: Especial Día del Niño</strong></p><p>recuperando las piezas perdidas por San Juan y descubriendo el tesoro final.</p>{photo ? <img className="certificate-photo" src={photo} alt="Recuerdo del equipo" /> : <div className="certificate-art"><Character pose={3} /><img src={ASSET.piece(5)} alt="" /></div>}<p className="certificate-date">16 de agosto de 2026</p><span className="certificate-seal">Tesoro reconstruido · Edición 001</span></div><footer>Puzzle Club San Juan</footer></section><div className="certificate-controls"><section className="certificate-reward"><h2>Su recuerdo de la aventura</h2><PrimaryButton onClick={downloadCertificate} disabled={exportState === 'preparing'}>{exportState === 'preparing' ? 'Preparando certificado...' : 'Descargar certificado'}</PrimaryButton>{canShareCertificate && <PrimaryButton onClick={shareCertificate} disabled={exportState === 'preparing'}>Compartir</PrimaryButton>}{exportError && <p className="feedback error" role="alert">{exportError}</p>}<div className="certificate-share"><h2>Compartí su aventura 🧩</h2><p>Suban el certificado a sus historias y, si quieren, etiqueten a <strong>@puzzleclubsj</strong> para que podamos verlo. 💛</p></div></section><section className="raffle-invitation"><h2>¿Quieren participar por un premio de Puzzle Club?</h2><PrimaryButton onClick={() => setRaffle(true)}>Participar del sorteo</PrimaryButton></section></div>{raffle && <Raffle team={team} />}</>}</section></Layout>
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
