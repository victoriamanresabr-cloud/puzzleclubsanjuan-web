const T = {
  terracotta: '#C4623A',
  cream: '#FAF7F2',
}

const font = {
  body: "'Nunito', 'Helvetica Neue', Arial, sans-serif",
}

const outlets = [
  { name: 'Diario de Cuyo', src: '/press/diario-de-cuyo.svg' },
  { name: 'Tiempo de San Juan', src: '/press/tiempo-de-san-juan.svg' },
  { name: 'Canal 13', src: '/press/canal-13.svg' },
  { name: 'Telesol', src: '/press/telesol.png' },
  { name: 'El Zonda', src: '/press/el-zonda.svg' },
  { name: 'Conecta SJ', src: '/press/conecta-sj.webp' },
]

export default function PressSection() {
  return (
    <section className="press-section" aria-label="Medios que cubrieron Puzzle Club San Juan" style={{ backgroundColor: T.cream, padding: '36px 80px 100px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <span style={{ display: 'block', fontFamily: font.body, fontSize: 11, fontWeight: 700, color: T.terracotta, letterSpacing: '0.16em', textAlign: 'center', textTransform: 'uppercase', marginBottom: 32 }}>
          Aparecimos en
        </span>

        <div className="press-section__outlets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28 }}>
          {outlets.map(({ name, src }) => (
            <div className="press-section__outlet" key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 0' }}>
              <img className="press-section__logo" src={src} alt={name} style={{ display: 'block', maxWidth: 150, maxHeight: 34, width: 'auto', height: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
