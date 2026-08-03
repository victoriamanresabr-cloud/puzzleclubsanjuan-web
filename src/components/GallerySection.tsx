const T = {
  terracotta: '#C4623A',
  charcoal: '#2A2A2A',
  cream: '#FAF7F2',
}

const font = {
  display: "'Fraunces', Georgia, serif",
  body: "'Nunito', 'Helvetica Neue', Arial, sans-serif",
}

const galleryImages = [
  {
    src: '/gallery/ambiente-01.jpg',
    alt: 'Grupo de participantes compartiendo una mesa de rompecabezas',
  },
  {
    src: '/gallery/ambiente-03.jpg',
    alt: 'Familia participando alrededor de una mesa con rompecabezas',
  },
  {
    src: '/gallery/ambiente-06.jpg',
    alt: 'Participantes celebrando una premiación con sus diplomas',
  },
  {
    src: '/gallery/ambiente-08.jpg',
    alt: 'Dos participantes concentradas armando un rompecabezas',
  },
  {
    src: '/gallery/ambiente-09.jpg',
    alt: 'Dos amigas sonriendo junto a un rompecabezas',
  },
  {
    src: '/gallery/ambiente-12.jpg',
    alt: 'Participantes armando rompecabezas en una tarde de Puzzle Club',
  },
  {
    src: '/gallery/ambiente-13.jpg',
    alt: 'Equipo concentrado resolviendo un rompecabezas',
  },
]

export default function GallerySection() {
  return (
    <section className="gallery-section" aria-labelledby="gallery-title" style={{ backgroundColor: T.cream, padding: '132px 80px 120px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header className="gallery-section__header" style={{ maxWidth: 620, margin: '0 auto 60px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontFamily: font.body, fontSize: 11, fontWeight: 700, color: T.terracotta, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20 }}>
            Así se vive
          </span>
          <h2 id="gallery-title" className="gallery-section__title" style={{ fontFamily: font.display, fontSize: 50, fontWeight: 600, color: T.charcoal, lineHeight: 1.15, letterSpacing: '-0.025em' }}>
            Una tarde alrededor de un rompecabezas
          </h2>
        </header>

        <div className="gallery-section__grid" style={{ columnCount: 3, columnGap: 16 }}>
          {galleryImages.map(({ src, alt }) => (
            <figure className="gallery-section__item" key={src} style={{ breakInside: 'avoid', marginBottom: 16 }}>
              <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
