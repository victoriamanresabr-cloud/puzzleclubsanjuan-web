import { useState, useEffect } from 'react'

// ─── IMAGE REGISTRY ──────────────────────────────────────────────────────────
const IMG = {
  hero:       '/optimized/images/hero.webp',
  fullBleed1: '/optimized/images/experiencia.webp',
  altPuzzle:  '/optimized/images/comunidad.webp',
  altTable:   '/optimized/images/encuentro.webp',
  altJoy:     '/optimized/images/evento.webp',
  fullBleed2: '/optimized/images/encuentro-secundario.webp',
  ctaBg:      '/optimized/images/invitacion.webp',
}

const PRIORITY_FORM_URL = 'https://forms.gle/etgyLXzQyXknKxfw9'

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  terracotta:  '#C4623A',
  olive:       '#5A6B3A',
  charcoal:    '#2A2A2A',
  dark:        '#1A1A1A',
  cream:       '#FAF7F2',
  creamWarm:   '#EFE7DB',
  white:       '#FFFFFF',
  textBody:    '#3A3A3A',
  textMuted:   '#7A7A7A',
  warmBorder:  '#E3D9CE',
}

const font = {
  display: "'Fraunces', Georgia, serif",
  body:    "'Nunito', 'Helvetica Neue', Arial, sans-serif",
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      className="site-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.5s ease',
        backgroundColor: scrolled
          ? 'rgba(250,247,242,0.96)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(227,217,206,0.5)'
          : 'none',
        padding: '0 48px',
      }}
    >
      <div
        className="site-nav__inner"
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 90,
        }}
      >
<a
  className="site-nav__brand"
  href="#"
  style={{
    display: "flex",
    alignItems: "center",
    gap: 14,
    textDecoration: "none",
  }}
>
  <img
    src="/optimized/images/logo-icon-pcsj.webp"
    alt="Puzzle Club"
    style={{
      width: 56,
      height: 56,
      display: "block",
    }}
  />

  <div style={{ lineHeight: 1 }}>
    <div
      style={{
        fontFamily: font.display,
        fontSize: 36,
        fontWeight: 700,
        color: scrolled ? T.charcoal : T.white,
      }}
    >
      Puzzle Club
    </div>

    <div
      style={{
        fontFamily: font.body,
        fontSize: 18,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: T.terracotta,
        marginTop: 2,
      }}
    >
      San Juan
    </div>
  </div>
</a>

        <div className="site-nav__links" style={{ display: 'flex', gap: 64 }}>
          {[
            { label: 'La experiencia', href: '#experiencia' },
            { label: 'Próxima fecha', href: '#fecha' },
            { label: 'Testimonios', href: '#testimonios' },
          ].map(({ label, href }) => (
            <a
  key={label}
  href={href}
  style={{
    fontFamily: font.body,
    fontSize: 16,
    fontWeight: 700,
    color: scrolled ? T.textBody : 'rgba(255,255,255,0.82)',
    letterSpacing: '0.01em',
    transition: 'color 0.4s',
  }}
>
              {label}
            </a>
          ))}
        </div>

        <a
          className="site-nav__cta"
          href="#fecha"
          style={{
            fontFamily: font.body,
            fontSize: 14,
            fontWeight: 700,
            color: T.white,
            backgroundColor: scrolled
              ? T.terracotta
              : 'rgba(255,255,255,0.14)',
            backdropFilter: !scrolled ? 'blur(12px)' : 'none',
            border: scrolled
              ? 'none'
              : '1px solid rgba(255,255,255,0.35)',
            padding: '12px 24px',
            borderRadius: 100,
            transition: 'all 0.4s',
          }}
        >
          Reservá tu lugar
        </a>
      </div>
    </nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero-section" style={{ position: 'relative', width: '100%', height: '100vh', minHeight: 720, overflow: 'hidden', backgroundColor: '#221c18' }}>
      <img
        src={IMG.hero}
        alt="Cuatro amigos celebrando con alegría alrededor de una merienda"
        className="hero-section__image"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 28%' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(175deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.04) 35%, rgba(15,10,6,0.75) 100%)' }} />

      <div className="hero-section__content" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 80px 100px' }}>
        <div style={{ maxWidth: 680 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 36, height: 1, backgroundColor: 'rgba(255,255,255,0.45)' }} />
            <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.14em', textTransform: 'uppercase' as const }}>
              San Juan, Argentina
            </span>
          </div>

          <h1 className="hero-section__title" style={{ fontFamily: font.display, fontSize: 58, fontWeight: 700, color: T.white, lineHeight: 1.06, letterSpacing: '-0.025em', marginBottom: 24 }}>
            ¿Qué te parece pasar<br />un sábado{' '}
            <em style={{ fontStyle: 'italic', color: '#F5C98A' }}>distinto?</em>
          </h1>

          <p className="hero-section__body" style={{ fontFamily: font.body, fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.78)', lineHeight: 1.75, maxWidth: 500, marginBottom: 48 }}>
            Descubrí la experiencia de armar rompecabezas que está reuniendo a cientos de sanjuaninos para vivir una tarde especial.
          </p>

          <div className="hero-section__actions" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <a href="#fecha" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, backgroundColor: T.terracotta, color: T.white, padding: '14px 34px', borderRadius: 100 }}>
              Conocé cuándo es la próxima
            </a>
            <a href="#experiencia" style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.white }}>
              <span style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
                  <path d="M4 2L9.5 6.5L4 11" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Mirá cómo se vive
            </a>
          </div>
        </div>
      </div>

      <div className="hero-section__scroll-cue" style={{ position: 'absolute', bottom: 44, right: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 1, height: 52, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
        <span style={{ fontFamily: font.body, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.36)', letterSpacing: '0.18em', textTransform: 'uppercase' as const, writingMode: 'vertical-rl' }}>Scroll</span>
      </div>
    </section>
  )
}

// ─── SOCIAL PROOF ────────────────────────────────────────────────────────────
function SocialProof() {
  const highlights = [
    { value: '7 ediciones', detail: 'realizadas en San Juan' },
    { value: '+225 participaciones', detail: 'alrededor de una mesa y un rompecabezas' },
    { value: 'Parejas y equipos', detail: 'dos maneras de vivir la experiencia' },
  ]

  return (
    <section
      className="social-proof-section"
      aria-label="La experiencia de Puzzle Club en números"
      style={{ backgroundColor: T.cream, padding: '68px 80px 48px' }}
    >
      <dl
        className="social-proof-section__grid"
        style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
      >
        {highlights.map(({ value, detail }) => (
          <div
            className="social-proof-section__item"
            key={value}
            style={{ padding: '8px 56px', textAlign: 'center' }}
          >
            <dt style={{ fontFamily: font.display, fontSize: 36, fontWeight: 600, color: T.charcoal, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 12 }}>
              {value}
            </dt>
            <dd style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.terracotta, lineHeight: 1.55, margin: 0 }}>
              {detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

// ─── MANIFESTO ────────────────────────────────────────────────────────────────
function ManifestoSection() {
  return (
    <section className="manifesto-section" style={{ backgroundColor: T.cream, padding: '96px 80px 128px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div className="manifesto-section__body" style={{ marginBottom: 56 }}>
          <p style={{ fontFamily: font.body, fontSize: 18, fontWeight: 400, color: T.textMuted, lineHeight: 1.9 }}>
            Puzzle Club San Juan nació para crear un espacio donde es posible desconectarse de las pantallas y encontrarse con otras personas. Cada encuentro reúne a amigos, familias y desconocidos alrededor de un mismo desafío: completar un rompecabezas y disfrutar el proceso.
          </p>
          <p style={{ fontFamily: font.body, fontSize: 18, fontWeight: 400, color: T.textMuted, lineHeight: 1.9, marginTop: 24 }}>
            No hace falta experiencia, solo ganas de pasar una tarde diferente.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
          <div style={{ height: 1, width: 48, backgroundColor: T.warmBorder }} />
          <span style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 700, color: '#ACACAC', letterSpacing: '0.14em', textTransform: 'uppercase' as const }}>
              San Juan, Argentina
          </span>
          <div style={{ height: 1, width: 48, backgroundColor: T.warmBorder }} />
        </div>
      </div>
    </section>
  )
}

// ─── FULL-BLEED PHOTO ─────────────────────────────────────────────────────────
function FullBleedPhoto({ src, alt, height = '68vh', position = 'center' }: { src: string; alt: string; height?: string; position?: string }) {
  return (
    <section className="full-bleed-photo" style={{ width: '100%', height, overflow: 'hidden', backgroundColor: '#221c18', display: 'block' }}>
      <img src={src} alt={alt} style={{ width: '120%', height: '100%', objectFit: 'cover', objectPosition: position }} />
    </section>
  )
}

// ─── ALTERNATING SECTION ──────────────────────────────────────────────────────
interface AlternatingSectionProps {
  reversed: boolean
  eyebrow: string
  headline: string
  body: string
  img: string
  alt: string
  id?: string
}

function AlternatingSection({ reversed, eyebrow, headline, body, img, alt, id }: AlternatingSectionProps) {
  const textPad = reversed
    ? { padding: '140px 88px 140px 120px' }
    : { padding: '140px 120px 140px 88px' }

  const TextSide = () => (
    <div className="alternating-section__text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', ...textPad, backgroundColor: T.cream }}>
      <div style={{ maxWidth: 400 }}>
        <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 700, color: T.olive, letterSpacing: '0.14em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 28 }}>
          {eyebrow}
        </span>
        <h2 style={{ fontFamily: font.display, fontSize: 70, fontWeight: 700, color: T.charcoal, lineHeight: 1.12, letterSpacing: '-0.02em', marginBottom: 28 }}>
          {headline}
        </h2>
        <p style={{ fontFamily: font.body, fontSize: 20, fontWeight: 400, color: T.textMuted, lineHeight: 1.85 }}>
          {body}
        </p>
      </div>
    </div>
  )

  const PhotoSide = () => (
    <div className="alternating-section__photo" style={{ overflow: 'hidden', backgroundColor: '#2a2520' }}>
      <img src={img} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block', background: '#f5f1eb' }} />
    </div>
  )

  return (
    <section className="alternating-section" id={id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '88vh' }}>
      {reversed ? <><PhotoSide /><TextSide /></> : <><TextSide /><PhotoSide /></>}
    </section>
  )
}

// ─── PULL QUOTE ───────────────────────────────────────────────────────────────
function PullQuoteSection({ quote, name, detail }: { quote: string; name: string; detail: string }) {
  return (
    <section className="pull-quote-section" style={{ backgroundColor: T.cream, padding: '160px 80px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ fontFamily: font.display, fontSize: 72, fontWeight: 700, color: T.terracotta, lineHeight: 0.75, marginBottom: 36, opacity: 0.35 }}>"</div>
        <p style={{ fontFamily: font.display, fontSize: 32, fontWeight: 400, fontStyle: 'italic', color: T.charcoal, lineHeight: 1.5, letterSpacing: '-0.015em', marginBottom: 44 }}>
          {quote}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 36, height: 1, backgroundColor: T.warmBorder }} />
          <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.charcoal }}>{name}</span>
          <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 400, color: T.textMuted }}>— {detail}</span>
        </div>
      </div>
    </section>
  )
}

// ─── NEXT EVENT ───────────────────────────────────────────────────────────────
function NextEventSection() {
  return (
    <section
      id="fecha"
      className="next-event-section"
      style={{
        backgroundColor: T.creamWarm,
        padding: '150px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: font.body,
            fontSize: 12,
            fontWeight: 700,
            color: T.olive,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 30,
          }}
        >
          Próxima edición
        </span>

        <h2
          style={{
            fontFamily: font.display,
            fontSize: 54,
            fontWeight: 700,
            color: T.charcoal,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            marginBottom: 14,
          }}
        >
          Sábado 29 de agosto
        </h2>

        <p
          style={{
            fontFamily: font.body,
            fontSize: 14,
            fontStyle: 'italic',
            color: T.textMuted,
            marginBottom: 42,
          }}
        >
          Fecha estimada
        </p>

        <p
          style={{
            fontFamily: font.body,
            fontSize: 19,
            fontWeight: 400,
            color: T.textBody,
            lineHeight: 1.8,
            maxWidth: 680,
            margin: '0 auto 42px',
          }}
        >
          Estamos preparando una nueva edición de Puzzle Club.
          <br />
          Las inscripciones abrirán en los próximos días.
        </p>

        <a
          href={PRIORITY_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontFamily: font.body,
            fontSize: 17,
            fontWeight: 700,
            backgroundColor: T.terracotta,
            color: T.white,
            padding: '18px 46px',
            borderRadius: 100,
            marginBottom: 18,

            boxShadow: '0 12px 30px rgba(204,104,53,.22)',
                transition: 'all .3s ease',

          }}
        >
          Quiero mi lugar
        </a>

        <p
          style={{
            fontFamily: font.body,
            fontSize: 13,
            color: T.textMuted,
            margin: 0,
          }}
        >
          Sin compromiso. Solo te avisaremos antes que al resto.
        </p>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const quotes = [
    { text: "Nunca pensé que armar un rompecabezas podía ser tan emocionante. La competencia fue increíble y ya quiero volver.", name: 'Marcos L.', detail: 'Edición #6' },
    { text: "El ambiente es súper cálido. El equipo lo hace sentir especial desde que llegás. Ya reservé para la próxima.", name: 'Sofía M.', detail: 'Asistente frecuente' },
  ]

  return (
    <section id="testimonios" className="testimonials-section" style={{ backgroundColor: T.charcoal, padding: '160px 80px' }}>
      <div className="testimonials-section__grid" style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
        {quotes.map((q, i) => (
          <div key={i} style={{ paddingTop: i === 1 ? 72 : 0 }}>
            <div style={{ fontFamily: font.display, fontSize: 56, fontWeight: 700, color: T.terracotta, lineHeight: 0.75, marginBottom: 28, opacity: 0.38 }}>"</div>
            <p style={{ fontFamily: font.display, fontSize: 24, fontWeight: 400, fontStyle: 'italic', color: T.white, lineHeight: 1.6, letterSpacing: '-0.01em', marginBottom: 36 }}>
              {q.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 28, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.48)' }}>
                {q.name} · {q.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FINAL INVITATION ─────────────────────────────────────────────────────────
function FinalInvitation() {
  return (
    <section className="final-invitation" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#221c18' }}>
      <img
        src={IMG.ctaBg}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', opacity: 0.4 }}
      />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(22,15,10,0.72)' }} />

      <div className="final-invitation__grid" style={{ position: 'relative', maxWidth: 1440, margin: '0 auto', padding: '180px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 128, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 36, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase' as const }}>
              Una invitación
            </span>
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: 48, fontWeight: 700, color: T.white, lineHeight: 1.08, letterSpacing: '-0.025em' }}>
            Tu próximo sábado<br />distinto te está<br />
            <em style={{ fontStyle: 'italic', color: '#F5C98A' }}>esperando.</em>
          </h2>
        </div>

        <div>
          <p style={{ fontFamily: font.body, fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, marginBottom: 56 }}>
            No hacen falta habilidades especiales.<br />
            Solo ganas de pasar una tarde diferente.
          </p>

          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#fecha" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, backgroundColor: T.terracotta, color: T.white, padding: '15px 36px', borderRadius: 100 }}>
              Sumate a la próxima tarde
            </a>
            <a
              href="https://www.instagram.com/puzzleclubsj/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '15px 28px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.18)' }}
            >
              Mirá más en Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="site-footer" style={{ backgroundColor: T.dark, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '80px 80px 52px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div className="site-footer__grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 72, paddingBottom: 56, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: T.white, lineHeight: 1.1, marginBottom: 18 }}>
              Puzzle Club San Juan
            </div>
            <p style={{ fontFamily: font.body, fontSize: 15, color: 'rgba(255,255,255,0.56)', lineHeight: 1.8, maxWidth: 300 }}>
              Una tarde distinta, una pieza a la vez.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: font.body, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.36)', letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginBottom: 20 }}>
              Contacto
            </div>
            <div className="site-footer__links" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href="https://www.instagram.com/puzzleclubsj" target="_blank" rel="noopener noreferrer" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.68)' }}>
                Instagram
              </a>
              <a href="mailto:puzzleclubsj.com.ar" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.68)' }}>
                Email
              </a>
              <a href={PRIORITY_FORM_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.68)' }}>
                Lista de prioridad
              </a>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: font.body, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Puzzle Club San Juan. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 56)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app-shell" style={{ minHeight: '100vh', backgroundColor: T.cream }}>
      <Navbar scrolled={scrolled} />

      <HeroSection />

      <SocialProof />

      <ManifestoSection />

      <FullBleedPhoto
        src={IMG.fullBleed1}
        alt="Grupo de personas riendo y conectando alrededor de una mesa"
        height="68vh"
        position="center 58%"
      />

      <AlternatingSection
        id="experiencia"
        reversed={false}
        eyebrow="01 · Concentración"
        headline="Un momento para estar presente"
        body="Sin pantallas, sin notificaciones. Solo vos, las piezas y el placer de encontrar el lugar justo."
        img={IMG.altPuzzle}
        alt="Manos sosteniendo con cuidado piezas de rompecabezas"
      />

      <AlternatingSection
        reversed={true}
        eyebrow="02 · Conexión"
        headline="Junto a los que más querés, o con los que todavía no conocés"
        body="La mesa es el pretexto. La tarde hace el resto. Hay algo en la concentración compartida que acelera el vínculo entre personas."
        img={IMG.altTable}
        alt="Dos personas conectando naturalmente en una mesa de madera"
      />

      <AlternatingSection
        reversed={false}
        eyebrow="03 · Celebración"
        headline="Y si terminás primero, mejor todavía"
        body="Hay premios para los equipos más veloces, pero nadie se va sin haberse llevado algo. Esa sensación de tarde bien aprovechada es el premio mayor."
        img={IMG.altJoy}
        alt="Persona celebrando con alegría genuina en un evento"
      />

      <PullQuoteSection
        quote="Fui sola sin saber qué esperar y terminó siendo la mejor tarde en meses. Es exactamente lo que uno necesita para desconectarse."
        name="Valentina R."
        detail="Edición #4"
      />

      <FullBleedPhoto
        src={IMG.fullBleed2}
        alt="Cuatro personas concentradas alrededor de una mesa larga de madera"
        height="62vh"
        position="center 60%"
      />

      <NextEventSection />

      <TestimonialsSection />

      <FinalInvitation />

      <Footer />
    </div>
  )
}
