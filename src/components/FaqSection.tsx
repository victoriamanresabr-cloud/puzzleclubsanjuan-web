import { useState } from 'react'

const T = {
  terracotta: '#C4623A',
  charcoal: '#2A2A2A',
  cream: '#FAF7F2',
  textMuted: '#7A7A7A',
  warmBorder: '#E3D9CE',
}

const font = {
  display: "'Fraunces', Georgia, serif",
  body: "'Nunito', 'Helvetica Neue', Arial, sans-serif",
}

const questions = [
  {
    question: '¿Necesito experiencia?',
    answer: 'No. Puzzle Club está pensado para cualquier persona, incluso si es su primer rompecabezas.',
  },
  {
    question: '¿Hay premios?',
    answer: 'Sí. Las categorías de parejas y equipos premian a los mejores tiempos, además de sorteos y sorpresas en algunas ediciones.',
  },
  {
    question: '¿Puedo participar solo?',
    answer: 'Actualmente podés inscribirte en pareja o en la categoría de equipos.',
  },
  {
    question: '¿Qué incluye la inscripción?',
    answer: 'La participación en el torneo, el rompecabezas del desafío, acceso al evento y todo lo necesario para vivir la experiencia.',
  },
  {
    question: '¿Cuánto dura?',
    answer: 'Depende de la categoría, pero los encuentros suelen durar entre 2 y 4 horas, incluyendo la premiación.',
  },
  {
    question: '¿Qué pasa si no terminamos el rompecabezas?',
    answer: 'No pasa nada. Lo importante es disfrutar la experiencia. El tiempo final se registra según las reglas del evento.',
  },
  {
    question: '¿Dónde se realiza?',
    answer: 'Cada edición se realiza en un espacio diferente de San Juan. El lugar se informa junto con la apertura de inscripciones.',
  },
  {
    question: '¿Hay límite de edad?',
    answer: 'No hay un límite estricto. Puede participar cualquier persona que se sienta cómoda con la modalidad elegida.',
  },
]

interface FaqItemProps {
  answer: string
  index: number
  isOpen: boolean
  onToggle: () => void
  question: string
}

function FaqItem({ answer, index, isOpen, onToggle, question }: FaqItemProps) {
  const answerId = `faq-answer-${index}`

  return (
    <article className="faq-section__item" style={{ borderTop: `1px solid ${T.warmBorder}` }}>
      <h3>
        <button
          type="button"
          className="faq-section__trigger"
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            border: 0,
            backgroundColor: 'transparent',
            padding: '26px 0',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span className="faq-section__question" style={{ fontFamily: font.display, fontSize: 24, fontWeight: 500, color: T.charcoal, lineHeight: 1.3, letterSpacing: '-0.015em' }}>
            {question}
          </span>
          <span className="faq-section__icon" aria-hidden="true" style={{ fontFamily: font.body, fontSize: 25, fontWeight: 400, color: T.terracotta, lineHeight: 1, flexShrink: 0 }}>
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h3>

      <div
        id={answerId}
        className="faq-section__answer"
        aria-hidden={!isOpen}
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          opacity: isOpen ? 1 : 0,
          transition: 'grid-template-rows 300ms ease, opacity 220ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <p className="faq-section__answer-inner" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 400, color: T.textMuted, lineHeight: 1.8, padding: '0 64px 28px 0' }}>
            {answer}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq-section" aria-labelledby="faq-title" style={{ backgroundColor: T.cream, padding: '140px 80px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <header className="faq-section__header" style={{ maxWidth: 640, margin: '0 auto 64px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontFamily: font.body, fontSize: 11, fontWeight: 700, color: T.terracotta, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20 }}>
            Preguntas frecuentes
          </span>
          <h2 id="faq-title" className="faq-section__title" style={{ fontFamily: font.display, fontSize: 50, fontWeight: 600, color: T.charcoal, lineHeight: 1.15, letterSpacing: '-0.025em' }}>
            Todo lo que necesitás saber antes de venir
          </h2>
        </header>

        <div className="faq-section__list" style={{ borderBottom: `1px solid ${T.warmBorder}` }}>
          {questions.map((item, index) => (
            <FaqItem
              key={item.question}
              {...item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
