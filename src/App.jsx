import { useState, useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const OPINIONS = [
  { value: 'I am not good enough',                    sub: 'Tends to create perfectionism, over-working, needing external validation, never feeling finished.' },
  { value: 'I am not worthy of love / I don\'t matter', sub: 'Tends to create people-pleasing, self-abandonment, anxiety in relationships, shrinking yourself.' },
  { value: 'I am not safe',                           sub: 'Tends to create hypervigilance, control, difficulty trusting, always waiting for something to go wrong.' },
  { value: 'I am alone',                              sub: 'Tends to create isolation, over-independence, pushing people away before they can leave.' },
  { value: 'I am wrong',                              sub: 'Tends to create shame, hiding, difficulty speaking up, chronic self-doubt.' },
]

const SYSTEM_BASE = `You are Sol — a direct, precise, warm subconscious reprogramming coach. You are NOT a therapist and you don't speak like one. You don't use poetic or flowery language. You speak plainly and directly, like a sharp, caring friend who sees exactly what's happening and isn't afraid to name it.

Your job in per-blank reflections is simple: mirror back what the person said, add one layer of specificity or clarity that shows you really heard them, and optionally end with a short open question that invites them to go a little deeper. That's it.

Rules:
- NO structure labels like "Mirror:" "Reframe:" "Anchor:" — ever
- NO poetry. NO metaphors unless they're plain and conversational.
- NO reframing. NO advice. NO silver linings. Just reflection and deepening.
- Short sentences. Direct. Warm but not gushing.
- 3-4 sentences maximum.
- Never start with "I" — start with what they said, or an observation about it.
- Never say "it sounds like", "I can hear that", "I sense that", "what a powerful insight"
- Write the way a precise, grounded coach talks in a real session — not the way a chatbot tries to sound therapeutic.

Example of BAD output (do not do this):
"Your nervous system recognizes the storm before it breaks — that moment when their upset fills the air and your body locks into stillness. REFRAME: What if your freeze isn't failure..."

Example of GOOD output (do this):
"So your body shuts down first, and then you go into fix-it mode to make the discomfort stop. The fixing isn't really about them — it's about getting yourself out of the freeze. What happens inside you when you can't fix it fast enough?"`

// ─────────────────────────────────────────────────────────────────────────────
// STEP DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'pattern', label: 'The Pattern', icon: '◎',
    teaching: 'The pattern is the entry point. Your conscious mind already knows something is wrong — it just doesn\'t know why yet. We start here because the pattern is the symptom, and what we\'re looking for is the root. The fact that you\'ve ended up here, willing to look, is already an act of courage.',
    blanks: [
      { key: 'situation',  prompt: 'The situation that keeps repeating in my life is',      placeholder: 'describe it as specifically as you can...', example: 'Every time I start building real momentum in my business, I find a way to blow it up — a distraction, a spiral, a reason to start over.' },
      { key: 'feeling',    prompt: 'No matter how it starts, I always end up feeling',       placeholder: 'name the feeling, and where you feel it...', example: 'Like I was never going to make it anyway. Heavy in my chest. A quiet voice that says "see, you always knew."' },
      { key: 'duration',   prompt: 'This has been showing up in my life for',               placeholder: 'how long? in what different forms?', example: 'As long as I can remember — in relationships, in work, in the way I talk to myself when no one is watching.' },
    ]
  },
  {
    id: 'memory', label: 'The Memory', icon: '◈',
    teaching: 'Every pattern has an origin. Your subconscious stores experiences as emotional snapshots — and when something feels threatening, it runs the same protection protocol it learned long ago. This step is about finding the first time you felt this way. The memory doesn\'t have to be dramatic. Sometimes the quietest moments leave the deepest marks.',
    blanks: [
      { key: 'age',       prompt: 'When I sit with this feeling and follow it back, I find myself at age',  placeholder: 'how old were you?', example: 'Seven. Maybe eight. I\'m not entirely sure, but I remember the light in the room.' },
      { key: 'scene',     prompt: 'What was happening was',                                                  placeholder: 'describe the scene — who was there, what was said or done...', example: 'My dad walked out of my school play without saying anything. I don\'t even know if he saw me. I waited by the door for twenty minutes.' },
      { key: 'body',      prompt: 'In my body, I felt',                                                     placeholder: 'what physical sensation did you carry?', example: 'A collapsing feeling in my stomach. Like something that was held up just dropped. I remember making myself very still.' },
    ]
  },
  {
    id: 'opinion', label: 'Root Opinion', icon: '◉',
    teaching: 'This is the heart of the whole process. A child cannot process pain the way an adult can — so they make it mean something about themselves. That meaning becomes the operating system. It runs silently beneath every decision, every relationship, every moment of self-sabotage. We are making it conscious now — and what is conscious can be changed.',
    blanks: [
      { key: 'belief', prompt: 'The deepest story I made it mean about myself was', placeholder: 'choose from the options below, or write your own...', example: '' },
    ]
  },
  {
    id: 'benefits', label: 'Hidden Benefits', icon: '◆',
    teaching: 'This is the step most people skip — and it\'s exactly why most change doesn\'t stick. Every belief we hold serves us somehow. The subconscious doesn\'t hold onto things that don\'t work. If you\'ve kept this story this long, you\'ve been getting something from it. This isn\'t about blame. It\'s about understanding the intelligence behind the pattern — so you can finally release it.',
    blanks: [
      { key: 'avoid',     prompt: 'By believing this story, I got to avoid',     placeholder: 'failure? rejection? accountability? certain feelings?', example: 'Having to actually try. Because if I never fully commit, I can never fully fail. I get to stay in the safe zone of "almost."' },
      { key: 'notfeel',   prompt: 'I didn\'t have to feel',                       placeholder: 'what emotion or experience were you protected from?', example: 'The terror of being truly seen and found wanting. As long as I kept myself small, no one could see how scared I actually was.' },
      { key: 'honest',    prompt: 'If I\'m being completely honest, I also got to', placeholder: 'blame someone? feel righteous? stay comfortable?', example: 'Blame the circumstances. The economy. The algorithm. It\'s easier than admitting I\'ve been the one holding the door closed.' },
    ]
  },
  {
    id: 'oldstory', label: 'Old Story', icon: '◇',
    teaching: 'Now we write the full cost. Not to punish yourself — you\'ve done nothing wrong. But because you cannot throw away something you\'re still minimizing. You need to see the whole picture clearly. All of it. The truth has a weight, and carrying it consciously — even just once — is what makes it possible to finally set it down.',
    blanks: [
      { key: 'makes',     prompt: 'This thinking makes me',                          placeholder: 'what behaviors does it produce?', example: 'Procrastinate. Over-prepare. Start over. Disappear when things get real. Show up halfway so I have an excuse ready.' },
      { key: 'stops',     prompt: 'It stops me from',                                placeholder: 'what have you not done, not said, not tried?', example: 'Finishing things. Asking for what I actually want. Letting people see me working toward something in case I don\'t make it.' },
      { key: 'cost',      prompt: 'The real cost of this story in my life has been',  placeholder: 'relationships, money, time, self-worth — be specific', example: 'Years. Versions of myself I didn\'t let exist. At least one relationship where I left before they could. A business that almost was.' },
    ]
  },
  {
    id: 'aversion', label: 'Release It', icon: '✦',
    teaching: 'You\'ve seen it clearly now. The pattern, the root, the cost. Before you can choose something new, your body needs to register that this story is done. Not just intellectually understood — but viscerally, somatically rejected. What follows might feel strange. That\'s the point.',
    blanks: [] // aversion is handled separately
  },
  {
    id: 'newchoice', label: 'New Choice', icon: '◈',
    teaching: 'This is where most transformation work ends — with insight. Sol\'s process doesn\'t stop there. Insight without declaration is just interesting. You\'re not choosing to understand the old story. You\'re choosing to BE something different. Right now. Pure choice doesn\'t need a reason — it only needs desire. What do you want?',
    blanks: [
      { key: 'declare',   prompt: 'I declare that I am',                             placeholder: 'your new identity — state it simply and completely', example: 'Someone who finishes what they start. Not because I\'m perfect, but because I\'m no longer afraid of being seen trying.' },
      { key: 'usedto1',   prompt: 'I used to believe I wasn\'t enough, and now I',    placeholder: 'what can you do, be, or feel now?', example: 'Show up before I feel ready. I don\'t need permission. I never did.' },
      { key: 'usedto2',   prompt: 'I used to hide to stay safe, and now I',           placeholder: 'how does this new version move through the world?', example: 'Let myself be witnessed — in the work, in the process, in the becoming. The visibility is the point.' },
    ]
  },
  {
    id: 'remember', label: 'Remember When', icon: '✧',
    teaching: 'The subconscious doesn\'t distinguish between a vividly imagined future and a real memory. This is not metaphor — it\'s neuroscience. When you speak from the future in past tense, your nervous system begins to encode it as experience. You are not pretending. You are installing. Speak slowly. Feel it as you write.',
    blanks: [
      { key: 'rememberwhen', prompt: 'Remember when I used to',                         placeholder: 'look back at the old pattern from the future...', example: 'Remember when I used to disappear right before the breakthrough? I actually thought that was just who I was.' },
      { key: 'firstchange',  prompt: 'The first thing that changed was',                placeholder: 'what shifted first, when you started living differently?', example: 'I stopped apologizing for taking up space. Small things first — sending the email, keeping the commitment to myself.' },
      { key: 'nowlooks',     prompt: 'One year later, my life looks like',              placeholder: 'be specific — what are you doing, feeling, building?', example: 'I have clients who found me because I let myself be seen. I finish things. I sleep differently. I am not surprised by my own success anymore.' },
      { key: 'tellself',     prompt: 'What I want to tell my old self is',              placeholder: 'speak to the version of you who was stuck in the pattern', example: 'You were never broken. You were protected. And you don\'t need that protection anymore.' },
    ]
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <span className="loading-dots">
      {[0,1,2].map(i => (
        <span key={i} className="loading-dot" style={{ animation: `shimmer 1.2s ${i*0.2}s infinite` }} />
      ))}
    </span>
  )
}

function TypingText({ text, speed = 16, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed(''); setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++
      if (i >= text.length) { clearInterval(id); setDone(true); onDone?.() }
    }, speed)
    return () => clearInterval(id)
  }, [text])
  return <span>{displayed}{!done && <span style={{ opacity: 0.35, animation: 'shimmer 0.9s infinite' }}>|</span>}</span>
}

function BreathingCircle() {
  return (
    <div className="breathe-wrap">
      <div className="breathe-outer"><div className="breathe-inner" /></div>
      <p className="breathe-label">Breathe... let yourself go back...</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

async function callClaude(systemPrompt, userMessage) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.[0]?.text || ''
}

// ─────────────────────────────────────────────────────────────────────────────
// BLANK FIELD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function BlankField({ blank, stepContext, allAnswers, onConfirm }) {
  const [value, setValue] = useState('')
  const [state, setState] = useState('idle') // idle | reflecting | reflected | confirmed
  const [reflection, setReflection] = useState('')
  const [history, setHistory] = useState([])
  const [showExample, setShowExample] = useState(false)
  const [confirmedValue, setConfirmedValue] = useState('')
  const [synthReady, setSynthReady] = useState(false)

  async function reflect() {
    if (!value.trim()) return
    setState('reflecting')
    setReflection('')
    try {
      const contextStr = Object.entries(allAnswers)
        .filter(([,v]) => v)
        .map(([k,v]) => `${k}: ${v}`)
        .join('\n')

      const prompt = `CONTEXT FROM THIS PERSON'S JOURNEY SO FAR:
${contextStr || 'This is the beginning of their journey.'}

CURRENT STEP: ${stepContext.stepLabel}
CURRENT PROMPT: "${blank.prompt}"
THEIR ANSWER: "${value}"

${history.length > 0 ? `PREVIOUS REFLECTIONS ON THIS SAME BLANK:\n${history.map(h => `- They wrote: "${h.answer}" and received: "${h.reflection}"`).join('\n')}\n\nThey have chosen to go deeper. Honor that. Go further than before.` : ''}

Give them a per-blank reflection following the mirror → reframe → anchor structure. 3-4 sentences. Make it personal to exactly what they wrote.`

      const text = await callClaude(SYSTEM_BASE, prompt)
      setReflection(text)
      setState('reflected')
    } catch(e) {
      setReflection('Something in this answer deserves to sit with you longer. Take a breath, and try again.')
      setState('reflected')
    }
  }

  function goDeeper() {
    setHistory(h => [...h, { answer: value, reflection }])
    setReflection('')
    setState('idle')
  }

  function confirm() {
    setConfirmedValue(value)
    setState('confirmed')
    onConfirm(blank.key, value, reflection)
  }

  function revisit() {
    setState('idle')
  }

  if (state === 'confirmed') return (
    <div className="blank-group">
      <p className="blank-sentence"><em>{blank.prompt}...</em></p>
      <div className="blank-confirmed">
        <span className="blank-confirmed-text">"{confirmedValue}"</span>
        <span className="blank-check">✦</span>
      </div>
      <button className="blank-revisit" onClick={revisit}>revisit →</button>
    </div>
  )

  return (
    <div className="blank-group fade-in">
      <p className="blank-sentence serif"><em>{blank.prompt}...</em></p>
      <textarea
        className="blank-input"
        placeholder={blank.placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={3}
        disabled={state === 'reflecting'}
      />
      {blank.example && (
        <>
          <button className="example-toggle" onClick={() => setShowExample(s => !s)}>
            {showExample ? 'hide example ↑' : 'see an example ↓'}
          </button>
          {showExample && (
            <div className="example-box slide-down">
              <p>"{blank.example}"</p>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 14 }}>
        {state === 'idle' && (
          <button className="btn" onClick={reflect} disabled={!value.trim()}>
            Reflect on this →
          </button>
        )}
        {state === 'reflecting' && (
          <button className="btn" disabled>
            <LoadingDots />
          </button>
        )}
      </div>

      {(state === 'reflected') && (
        <div className="reflection-card slide-down">
          <div className="reflection-label">
            <span style={{ color: '#c4a882' }}>✦</span> Sol's Reflection
          </div>
          <p className="reflection-text">
            <TypingText text={reflection} speed={14} />
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <button className="btn-ghost" onClick={goDeeper}>Go deeper</button>
            <button className="btn" onClick={confirm}>This feels true ✓</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AVERSION STEP
// ─────────────────────────────────────────────────────────────────────────────

function AversionStep({ onComplete }) {
  const [phase, setPhase] = useState('intro') // intro | disgust | done

  return (
    <div className="fade-up">
      {phase === 'intro' && (
        <>
          <p className="serif" style={{ fontSize: 20, color: 'var(--teal)', fontStyle: 'italic', lineHeight: 1.75, marginBottom: 20 }}>
            The Stinky Spaghetti
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 18, fontSize: 15 }}>
            Imagine a container of spaghetti left in a microwave for three weeks. Green-black mold has completely consumed it. The smell hits you before the door is even open — rotting, fermenting, acrid. It coats the back of your throat.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 18, fontSize: 15 }}>
            That is your old story. You've been choosing it. Not because you're broken — but because no one ever showed you it had gone rotten.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 32, fontSize: 15 }}>
            You wouldn't keep that spaghetti in your house. You wouldn't keep serving it to yourself. Sit with the disgust. Let your body register it fully.
          </p>
          <button className="btn" onClick={() => setPhase('disgust')}>I can feel it →</button>
        </>
      )}

      {phase === 'disgust' && (
        <div style={{ textAlign: 'center', padding: '16px 0 40px' }}>
          <div className="aversion-pulse">🗑</div>
          <p className="serif" style={{ fontSize: 24, color: 'var(--teal)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 16 }}>
            Say it out loud. Mean it.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 24, fontSize: 16 }}>
            "I am <strong style={{ color: 'var(--teal)' }}>DONE</strong> with this story.<br />
            I throw it away. I do not need it anymore."
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 36, fontSize: 14, fontStyle: 'italic' }}>
            Keep sitting with the disgust until something in your body shifts.<br />
            Until it settles. There's no rush. Take your time.
          </p>
          <button className="btn" onClick={() => setPhase('done')}>I am done with it →</button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
          <span style={{ fontSize: 28, display: 'block', marginBottom: 20, color: 'var(--gold-light)' }}>✦</span>
          <p className="serif" style={{ fontSize: 24, color: 'var(--teal)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 16 }}>
            The old story is gone.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 40, fontSize: 15 }}>
            Something is different now. There is space where there wasn't before.<br />
            That space is yours to fill.
          </p>
          <button className="btn" onClick={onComplete}>Now I choose something new →</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function Step({ step, stepIndex, allAnswers, onStepComplete, onAnswerUpdate }) {
  const [confirmedBlanks, setConfirmedBlanks] = useState({})
  const [synthesis, setSynthesis] = useState('')
  const [synthLoading, setSynthLoading] = useState(false)
  const [synthDone, setSynthDone] = useState(false)
  const [canContinue, setCanContinue] = useState(false)
  const synthRef = useRef(null)

  const allConfirmed = step.blanks.length === 0 || step.blanks.every(b => confirmedBlanks[b.key])

  function handleConfirm(key, value, reflection) {
    setConfirmedBlanks(prev => ({ ...prev, [key]: { value, reflection } }))
    onAnswerUpdate(step.id, key, value)
  }

  useEffect(() => {
    if (step.id === 'aversion') return
    if (!allConfirmed || synthesis) return
    generateSynthesis()
  }, [allConfirmed])

  async function generateSynthesis() {
    setSynthLoading(true)
    try {
      const blankSummary = step.blanks.map(b => {
        const c = confirmedBlanks[b.key]
        return `Prompt: "${b.prompt}"\nAnswer: "${c?.value}"\nLast reflection: "${c?.reflection}"`
      }).join('\n\n')

      const contextStr = Object.entries(allAnswers)
        .filter(([,v]) => v)
        .map(([k,v]) => `${k}: ${v}`)
        .join('\n')

      const prompt = `FULL JOURNEY CONTEXT:
${contextStr}

STEP JUST COMPLETED: ${step.label}
STEP TEACHING: "${step.teaching}"

WHAT THEY UNCOVERED IN THIS STEP:
${blankSummary}

Write a step synthesis reflection (4-5 sentences). This is a ceremonial moment.
- Acknowledge everything they just uncovered in this step as a whole
- Name the specific courage this step required
- Weave their answers together into one felt truth
- Plant one seed for what's coming next without telling them what it is
- End with something that lands in the body

Speak in second person. Slow. Reverent. This should feel earned.`

      const text = await callClaude(SYSTEM_BASE, prompt)
      setSynthesis(text)
    } catch(e) {
      setSynthesis('What you\'ve uncovered here is real. Sit with it before you move forward.')
    }
    setSynthLoading(false)
  }

  function handleSynthDone() {
    setSynthDone(true)
    setTimeout(() => {
      setCanContinue(true)
      synthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 600)
  }

  if (step.id === 'aversion') return (
    <div>
      <div className="teaching-card">
        <span className="teaching-card-title">Why this step matters</span>
        <p className="teaching-card-text">{step.teaching}</p>
      </div>
      <AversionStep onComplete={onStepComplete} />
    </div>
  )

  return (
    <div>
      <div className="teaching-card">
        <span className="teaching-card-title">Why this step matters</span>
        <p className="teaching-card-text">{step.teaching}</p>
      </div>

      {step.id === 'memory' && <BreathingCircle />}

      {step.id === 'opinion' && (
        <div style={{ marginBottom: 32 }}>
          <p className="serif" style={{ fontSize: 19, color: 'var(--teal)', fontStyle: 'italic', lineHeight: 1.75, marginBottom: 20 }}>
            Which of these feels most true — the story that's been running underneath everything?
          </p>
          <OpinionSelector
            onSelect={(val) => handleConfirm('belief', val, '')}
            confirmed={confirmedBlanks['belief']}
          />
          {!confirmedBlanks['belief'] && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Or write your own:</p>
              <BlankField
                blank={{ key: 'belief', prompt: 'The deepest story I made it mean about myself was', placeholder: 'write your own root belief...', example: '' }}
                stepContext={{ stepLabel: step.label }}
                allAnswers={allAnswers}
                onConfirm={handleConfirm}
              />
            </div>
          )}
        </div>
      )}

      {step.id !== 'opinion' && step.blanks.map((blank, i) => {
        const prevConfirmed = i === 0 || confirmedBlanks[step.blanks[i-1].key]
        if (!prevConfirmed) return null
        return (
          <BlankField
            key={blank.key}
            blank={blank}
            stepContext={{ stepLabel: step.label }}
            allAnswers={allAnswers}
            onConfirm={handleConfirm}
          />
        )
      })}

      {allConfirmed && (
        <div>
          <div className="divider-sm" />
          {synthLoading && (
            <div className="synthesis-card">
              <p className="synthesis-label">Step Complete — Sol's Reflection</p>
              <p className="synthesis-text"><LoadingDots /></p>
            </div>
          )}
          {synthesis && (
            <div className="synthesis-card" ref={synthRef}>
              <p className="synthesis-label">✦ Step Complete ✦</p>
              <p className="synthesis-text">
                <TypingText text={synthesis} speed={20} onDone={handleSynthDone} />
              </p>
            </div>
          )}
          {canContinue && (
            <div style={{ textAlign: 'center', marginTop: 24 }} className="fade-in">
              <button className="btn" style={{ padding: '14px 40px', letterSpacing: 3 }} onClick={onStepComplete}>
                Continue →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OPINION SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function OpinionSelector({ onSelect, confirmed }) {
  const [selected, setSelected] = useState('')
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [reflected, setReflected] = useState(false)

  if (confirmed) return (
    <div className="blank-confirmed">
      <span className="blank-confirmed-text">"{confirmed.value}"</span>
      <span className="blank-check">✦</span>
    </div>
  )

  async function reflect() {
    setLoading(true)
    try {
      const text = await callClaude(SYSTEM_BASE,
        `The person has identified their root subconscious belief: "${selected}". This is a profound moment of self-recognition. Reflect back how this belief made total sense to the child they were — it was survival, not weakness. Acknowledge the intelligence of the protection. And gently note how much energy they've spent living from this single story. 3-4 sentences.`)
      setReflection(text)
      setReflected(true)
    } catch(e) {
      setReflection('This recognition is significant. The child who formed this belief was doing their best to survive.')
      setReflected(true)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="opinion-grid">
        {OPINIONS.map(op => (
          <div key={op.value} className={`opinion-card${selected === op.value ? ' selected' : ''}`} onClick={() => { setSelected(op.value); setReflected(false); setReflection('') }}>
            <p className="opinion-card-title">{op.value}</p>
            <p className="opinion-card-sub">{op.sub}</p>
          </div>
        ))}
      </div>
      {selected && !reflected && (
        <button className="btn" onClick={reflect} disabled={loading}>
          {loading ? <LoadingDots /> : 'Reflect on this →'}
        </button>
      )}
      {reflected && reflection && (
        <div className="reflection-card slide-down">
          <div className="reflection-label"><span style={{ color: '#c4a882' }}>✦</span> Sol's Reflection</div>
          <p className="reflection-text"><TypingText text={reflection} speed={14} /></p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <button className="btn-ghost" onClick={() => { setSelected(''); setReflected(false); setReflection('') }}>Choose differently</button>
            <button className="btn" onClick={() => onSelect(selected)}>This feels true ✓</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFORMATION STORY
// ─────────────────────────────────────────────────────────────────────────────

function TransformationStory({ allAnswers, onNext }) {
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendoff, setSendoff] = useState('')
  const [sendoffLoading, setSendoffLoading] = useState(false)
  const [storyDone, setStoryDone] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { generateStory() }, [])

  async function generateStory() {
    try {
      const a = allAnswers
      const prompt = `Write a transformation story for this person. Use second person ("you"), past-to-present tense. This is not a summary — it is a narrative arc. It should read like something they will want to read again years from now.

Their journey:
- Pattern: ${a.situation} / Emotion: ${a.feeling} / Duration: ${a.duration}
- Earliest memory: Age ${a.age} — ${a.scene} — Body felt: ${a.body}
- Root belief: ${a.belief}
- Hidden benefits: Avoided ${a.avoid} / Didn't have to feel ${a.notfeel} / Also got to ${a.honest}
- Old story cost: Made them ${a.makes} / Stopped them from ${a.stops} / Real cost: ${a.cost}
- New declaration: ${a.declare}
- New story: ${a.usedto1} / ${a.usedto2}
- Future vision: ${a.rememberwhen} / First change: ${a.firstchange} / Now: ${a.nowlooks} / To old self: ${a.tellself}

Write 4-5 paragraphs. Begin with the pattern they arrived carrying. Move through what they found at the root. Name what it cost. Describe the moment of release. End with who they are now and where they're going. Make it beautiful. Make it true. Make it theirs.

Use only paragraph breaks — no headers, no bullets.`

      const text = await callClaude(SYSTEM_BASE, prompt)
      setStory(text)
    } catch(e) {
      setStory('Something profound happened here today. The story you arrived with, and the one you\'re leaving with, are not the same.')
    }
    setLoading(false)
  }

  async function generateSendoff() {
    setSendoffLoading(true)
    try {
      const prompt = `Write a send-off for this person as they complete The Easy Button process.

Their declaration: "${allAnswers.declare}"
Their new story: "${allAnswers.usedto1}"
Their future vision: "${allAnswers.nowlooks}"
What they told their old self: "${allAnswers.tellself}"

Write one paragraph (4-5 sentences). Name what they've done. Acknowledge that the new identity won't feel completely real yet — and that's normal. Give them something specific and grounded to do in the next hour, the next conversation, the next moment the old pattern shows up. End with one simple, direct, loving send-off. No signature. No "good luck." Just truth.`

      const text = await callClaude(SYSTEM_BASE, prompt)
      setSendoff(text)
    } catch(e) {
      setSendoff('The work you did here is real. Go live it — not perfectly, just consciously.')
    }
    setSendoffLoading(false)
  }

  function handleStoryDone() {
    setStoryDone(true)
    generateSendoff()
  }

  function copyStory() {
    navigator.clipboard.writeText(story).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const paragraphs = story.split('\n').filter(p => p.trim())

  return (
    <div className="fade-up" style={{ maxWidth: 680, margin: '0 auto' }}>
      <span style={{ fontSize: 28, color: 'var(--gold-light)', display: 'block', textAlign: 'center', marginBottom: 24 }}>✦</span>
      <h2 className="serif" style={{ fontSize: 38, fontWeight: 300, color: 'var(--teal)', marginBottom: 8, textAlign: 'center' }}>Your Transformation Story</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 32, letterSpacing: 1 }}>What happened here today</p>
      <div className="divider" />

      <div className="story-card">
        <p className="story-label">✦ For You</p>
        {loading ? (
          <div style={{ padding: '20px 0', textAlign: 'center' }}><LoadingDots /></div>
        ) : (
          <div className="story-text">
            {paragraphs.map((p, i) => (
              <p key={i}>
                {i === 0 ? <TypingText text={p} speed={12} onDone={handleStoryDone} /> : (storyDone ? p : '')}
              </p>
            ))}
          </div>
        )}
      </div>

      {storyDone && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 40 }} className="fade-in">
          <button className="copy-btn" onClick={copyStory}>
            {copied ? '✓ Copied' : '⎘ Copy your story'}
          </button>
        </div>
      )}

      {sendoffLoading && (
        <div className="synthesis-card fade-in">
          <p className="synthesis-label">A word before you go</p>
          <p className="synthesis-text"><LoadingDots /></p>
        </div>
      )}

      {sendoff && (
        <div className="synthesis-card fade-in">
          <p className="synthesis-label">✦ A word before you go</p>
          <p className="synthesis-text"><TypingText text={sendoff} speed={18} onDone={() => setTimeout(onNext, 2000)} /></p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase]       = useState('intro')   // intro | steps | story | final
  const [stepIndex, setStepIndex] = useState(0)
  const [allAnswers, setAllAnswers] = useState({})
  const topRef = useRef(null)

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' })

  function handleAnswerUpdate(stepId, key, value) {
    setAllAnswers(prev => ({ ...prev, [key]: value }))
  }

  function handleStepComplete() {
    scrollTop()
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      setPhase('story')
    }
  }

  function reset() {
    setPhase('intro'); setStepIndex(0); setAllAnswers({})
  }

  const currentStep = STEPS[stepIndex]

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="page-center">
      <div className="ticker">
        <div className="ticker-inner">
          {Array(10).fill('THE EASY BUTTON  ♦  ').map((t,i) => <span key={i} className="ticker-item">{t}</span>)}
        </div>
      </div>
      <div className="fade-up" style={{ maxWidth: 560, textAlign: 'center', marginTop: 40 }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 20 }}>A process by Sol</p>
        <h1 style={{ fontSize: 'clamp(48px, 9vw, 80px)', fontWeight: 300, color: 'var(--teal)', lineHeight: 1.1, marginBottom: 28 }}>
          The Easy<br /><em>Button</em>
        </h1>
        <div className="divider" />
        <p style={{ fontSize: 17, lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>You've been here before.</p>
        <p style={{ fontSize: 17, lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>
          The pattern that keeps showing up. The same story wearing different faces. The version of you that keeps getting in your own way — not because you're broken, but because somewhere in your subconscious, there's a story that hasn't been rewritten yet.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.9, color: 'var(--muted)', marginBottom: 40 }}>
          This process will take you through it — gently, deliberately, completely.
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 44 }}>
          Find a quiet space. Give yourself 30–45 minutes. Move slowly.
        </p>
        <button className="btn" onClick={() => { setPhase('steps'); scrollTop() }} style={{ fontSize: 12, letterSpacing: 3, padding: '16px 52px' }}>
          Begin →
        </button>
      </div>
    </div>
  )

  // ── TRANSFORMATION STORY ─────────────────────────────────────────────────
  if (phase === 'story') return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '80px 24px' }}>
      <div ref={topRef} />
      <TransformationStory allAnswers={allAnswers} onNext={() => setPhase('final')} />
    </div>
  )

  // ── FINAL SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'final') return (
    <div className="final-screen fade-in">
      <span className="final-mark">✦</span>
      <p className="final-declaration">
        "{allAnswers.declare || 'I am ready.'}"
      </p>
      <div style={{ marginTop: 60 }}>
        <button className="btn-ghost" style={{ color: 'var(--cream)', borderColor: 'rgba(245,240,232,0.3)' }} onClick={reset}>
          Begin Again
        </button>
      </div>
    </div>
  )

  // ── STEPS ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      <div ref={topRef} />

      <div className="ticker">
        <div className="ticker-inner">
          {Array(10).fill('THE EASY BUTTON  ♦  ').map((t,i) => <span key={i} className="ticker-item">{t}</span>)}
        </div>
      </div>

      <div className="progress-bar">
        <p className="progress-title">The Easy Button</p>
        <div className="progress-dots">
          {STEPS.map((s, i) => (
            <div key={s.id} className="progress-dot" style={{
              flex: i === stepIndex ? 1.6 : 1,
              height: i === stepIndex ? 8 : 5,
              background: i < stepIndex ? 'var(--teal)' : i === stepIndex ? 'var(--gold-light)' : 'rgba(26,74,69,0.15)',
            }} />
          ))}
        </div>
        <p className="progress-count">{stepIndex + 1} / {STEPS.length}</p>
      </div>

      <div className="content-wrap">
        <div className="step-header">
          <span className="step-icon">{currentStep.icon}</span>
          <div>
            <p className="step-label-sm">Step {stepIndex + 1} of {STEPS.length}</p>
            <h2 className="step-title">{currentStep.label}</h2>
          </div>
        </div>

        <Step
          key={currentStep.id}
          step={currentStep}
          stepIndex={stepIndex}
          allAnswers={allAnswers}
          onStepComplete={handleStepComplete}
          onAnswerUpdate={handleAnswerUpdate}
        />
      </div>
    </div>
  )
}
