import { trackEvent } from '../utils/analytics'

const CONTACT_URL = 'https://www.instagram.com/puzzleclubsj'

export default function HomeRentalSection() {
  return (
    <section id="en-casa" className="home-rental" aria-labelledby="home-rental-title">
      <div className="home-rental__inner">
        <header className="home-rental__header">
          <span className="home-rental__eyebrow">Una nueva forma de disfrutar</span>
          <h2 id="home-rental-title">Puzzle Club en Casa</h2>
          <p>Los rompecabezas también se disfrutan en casa. Alquilá uno o varios y disfrutalos a tu ritmo, solo, en familia o con amigos.</p>
        </header>

        <figure className="home-rental__photo">
          <img src="/optimized/images/puzzle-club-en-casa.webp" alt="Un grupo de personas armando un rompecabezas alrededor de una mesa" width="1600" height="1067" loading="lazy" />
          <figcaption>Imagen ilustrativa · Foto de <a href="https://www.pexels.com/photo/collaborative-group-solving-puzzle-together-33044624/" target="_blank" rel="noopener noreferrer">Tahir Xəlfəquliyev en Pexels</a></figcaption>
        </figure>

        <div className="home-rental__grid">
          <div>
            <span className="home-rental__eyebrow">Alquiler de rompecabezas</span>
            <h3>La Puna de El Jacarandá</h3>
            <p className="home-rental__pieces">100 piezas para disfrutar a tu ritmo.</p>
            <dl className="home-rental__facts">
              <div><dt>Por unidad</dt><dd>$10.000 <small>ARS</small></dd></div>
              <div><dt>Duración</dt><dd>48 <small>horas</small></dd></div>
            </dl>
            <p>Una o varias unidades, según disponibilidad.</p>
          </div>

          <div className="home-rental__coordination">
            <h3>Lo coordinamos con vos</h3>
            <p>Reservas, retiro y devolución: a coordinar directamente con Puzzle Club San Juan.</p>
            <p>Pago anticipado, sin depósito de garantía.</p>
            <p>Si el vencimiento de las 48 horas cae domingo, se extiende hasta el lunes, con un máximo de 72 horas y sin costo adicional.</p>
          </div>
        </div>

        <details className="home-rental__conditions">
          <summary>Condiciones de alquiler y cuidado</summary>
          <p>Daños o piezas faltantes comprobados: cargo adicional de $10.000 por unidad afectada. Este cargo se informa y debe ser aceptado antes de reservar.</p>
        </details>

        <div className="home-rental__actions">
          <a className="home-rental__cta" href={CONTACT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('click_instagram', {
            link_text: 'Consultar disponibilidad',
            link_location: 'home_rental',
            destination_url: CONTACT_URL,
          })}>Consultar disponibilidad</a>
          <p>Escribinos por Instagram para coordinar.</p>
        </div>
      </div>
    </section>
  )
}
