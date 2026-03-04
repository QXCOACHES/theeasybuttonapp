import { useState, useRef, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_REFLECT = `You are assisting a subconscious reprogramming journaling process. Reflect back what someone wrote — warmly, plainly, specifically to what THEY wrote.

Write exactly 3 sentences:
1. Restate what they said in your own words so they feel heard — specific, not generic.
2. Name one thing underneath what they said — implied but not quite named.
3. A plain grounded observation that closes the reflection — no question, no advice.

Rules: No headers, no bold, no asterisks, no labels. Warm but not gushing. No spiritual or poetic language. No metaphors about storms, shores, ancient wisdom. Short sentences. Plain words.

Example: "When your partner gets angry, you go still — and then immediately shift into making it okay so you can breathe again. That fixing isn't really about them, it's about getting yourself out of the discomfort of the freeze. The pattern ends the same way every time: you smaller, them managed, the real thing still unsaid."`

async function callClaude(system, message) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: message }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.[0]?.text || ''
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Dots() {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#c4a882', display:'inline-block', animation:`shimmer 1.2s ${i*0.2}s infinite` }} />
      ))}
    </span>
  )
}

function Typing({ text, speed=16, onDone }) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setShown(''); setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      setShown(text.slice(0, i+1)); i++
      if (i >= text.length) { clearInterval(id); setDone(true); onDone?.() }
    }, speed)
    return () => clearInterval(id)
  }, [text])
  return <span>{shown}{!done && <span style={{ opacity:0.35, animation:'shimmer 0.9s infinite' }}>|</span>}</span>
}

function TeachingCard({ text }) {
  return (
    <div style={{ background:'var(--teal)', borderRadius:6, padding:'28px 32px', marginBottom:36 }}>
      <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--gold-light)', marginBottom:10, fontFamily:'Lato,sans-serif' }}>Why this step matters</p>
      <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, lineHeight:1.75, color:'rgba(245,240,232,0.95)', fontStyle:'italic' }}>{text}</p>
    </div>
  )
}

function Q({ text }) {
  return <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, color:'var(--teal)', fontStyle:'italic', lineHeight:1.7, marginBottom:10 }}>{text}</p>
}

function Box({ placeholder, value, onChange, minH=100 }) {
  return (
    <textarea
      style={{ width:'100%', background:'rgba(255,255,255,0.65)', border:'none', borderBottom:'1.5px solid rgba(26,74,69,0.25)', padding:'10px 2px', fontFamily:'Cormorant Garamond,serif', fontSize:18, color:'var(--text)', outline:'none', resize:'none', minHeight:minH, lineHeight:1.6, marginBottom:24, transition:'border-color 0.3s' }}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={e => e.target.style.borderBottomColor='#1a4a45'}
      onBlur={e => e.target.style.borderBottomColor='rgba(26,74,69,0.25)'}
    />
  )
}

function Synth({ text, loading, onDone }) {
  return (
    <div style={{ background:'var(--cream-dark)', borderTop:'1px solid var(--gold-light)', borderBottom:'1px solid var(--gold-light)', padding:32, margin:'32px 0', textAlign:'center' }}>
      <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--gold)', marginBottom:16, fontFamily:'Lato,sans-serif' }}>✦ Reflection</p>
      <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, lineHeight:1.9, color:'var(--teal)', fontStyle:'italic' }}>
        {loading ? <Dots /> : <Typing text={text} speed={18} onDone={onDone} />}
      </p>
    </div>
  )
}

function Breathe({ label='Breathe... let yourself go back...', size=130 }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 0' }}>
      <div style={{ width:size, height:size, borderRadius:'50%', margin:'0 auto 24px', border:'2px solid var(--gold-light)', display:'flex', alignItems:'center', justifyContent:'center', animation:'breathe 5s ease-in-out infinite', background:'rgba(26,74,69,0.04)' }}>
        <div style={{ width:size*0.65, height:size*0.65, borderRadius:'50%', border:'1px solid rgba(26,74,69,0.2)', animation:'breathe 5s ease-in-out infinite 0.8s' }} />
      </div>
      <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, color:'var(--muted)', fontStyle:'italic' }}>{label}</p>
    </div>
  )
}

function Btn({ onClick, disabled, ghost, children, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: ghost?'transparent': disabled?'rgba(26,74,69,0.4)':'var(--teal)', color: ghost?'var(--teal)':'var(--cream)', border: ghost?'1px solid rgba(26,74,69,0.4)':'none', padding:'13px 28px', fontFamily:'Lato,sans-serif', fontSize:12, letterSpacing:2, textTransform:'uppercase', cursor:disabled?'not-allowed':'pointer', transition:'all 0.25s', borderRadius:2, ...style }}>
      {children}
    </button>
  )
}

function Shell({ n, icon, label, children }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32 }}>
        <span style={{ fontSize:20, color:'var(--gold-light)' }}>{icon}</span>
        <div>
          <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--muted)', marginBottom:4, fontFamily:'Lato,sans-serif' }}>Step {n} of 8</p>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, color:'var(--teal)', fontWeight:400 }}>{label}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}

const OPINIONS = [
  { value:'I am not good enough',                      sub:'Perfectionism, over-working, needing external validation, never feeling finished.' },
  { value:"I am not worthy of love / I don't matter",  sub:'People-pleasing, self-abandonment, anxiety in relationships, shrinking yourself.' },
  { value:'I am not safe',                             sub:'Hypervigilance, control, difficulty trusting, always waiting for something to go wrong.' },
  { value:'I am alone',                                sub:'Isolation, over-independence, pushing people away before they can leave.' },
  { value:'I am wrong',                                sub:'Shame, hiding, difficulty speaking up, chronic self-doubt.' },
]

const FOCUS = ['Love & relationships','Money & career','Body & health','Purpose & creativity','Home & safety','Other']

// ─────────────────────────────────────────────────────────────────────────────
// STEPS
// ─────────────────────────────────────────────────────────────────────────────

function Step1({ A, setA, next }) {
  const [phase, setPhase] = useState('pattern')
  const [synth, setSynth] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function reflect() {
    setLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Pattern: "${A.situation}"\nEmotion + body: "${A.emotion}"\nReflect back both the pattern and what it feels like in their body. 3 sentences, plain and warm.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setLoading(false)
  }

  if (phase === 'somatic') return (
    <Shell n={1} icon="◎" label="The Pattern">
      <Breathe label="Breathe into it. Let yourself actually feel it." size={150} />
      <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:24, fontSize:15, fontFamily:'Lato,sans-serif' }}>Don't rush past this. The pattern you just described lives somewhere in your body. You've felt it a hundred times before.</p>
      <Q text="When this pattern shows up, I feel..." />
      <Box placeholder="name the emotion, and where you feel it in your body..." value={A.emotion||''} onChange={v=>setA(a=>({...a,emotion:v}))} minH={80} />
      <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:32, fontSize:14, fontStyle:'italic', fontFamily:'Lato,sans-serif' }}>Take your time. Notice where it shows up — chest, throat, stomach. Let yourself be in it before you move on.</p>
      {!synth && !loading && <Btn onClick={reflect} disabled={!A.emotion?.trim()}>I can feel it →</Btn>}
      {(synth||loading) && <Synth text={synth} loading={loading} onDone={()=>setDone(true)} />}
      {done && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )

  return (
    <Shell n={1} icon="◎" label="The Pattern">
      <TeachingCard text="The pattern is the entry point. You already know something keeps repeating — the same feeling, different situations, different faces. We're not trying to fix it yet. We're just naming it clearly, so we can find where it started." />
      <Q text="The situation that keeps repeating in my life is..." />
      <Box placeholder="Be specific — what keeps happening? In relationships, work, with yourself..." value={A.situation||''} onChange={v=>setA(a=>({...a,situation:v}))} />
      <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:32, fontSize:14, fontStyle:'italic', fontFamily:'Lato,sans-serif' }}>Example: "Every time I get close to someone, I find a reason to pull away — or I push until they leave."</p>
      <Btn onClick={()=>setPhase('somatic')} disabled={!A.situation?.trim()}>I see the pattern →</Btn>
    </Shell>
  )
}

function Step2({ A, setA, next }) {
  const [synth, setSynth] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const ready = A.memAge?.trim() && A.memScene?.trim() && A.memMeaning?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Pattern: "${A.situation}"\nAge: "${A.memAge}"\nWhat happened: "${A.memScene}"\nWhat they made it mean: "${A.memMeaning}"\nAcknowledge what that child went through and how the conclusion they made was the only one that made sense at the time. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setLoading(false)
  }

  return (
    <Shell n={2} icon="◈" label="The Memory">
      <TeachingCard text="Every pattern has an origin. Somewhere back in your life, something happened — and the child you were made a conclusion about themselves to survive it. That conclusion became the operating system. We're going to find it." />
      <Breathe label="Close your eyes. Breathe. Follow the feeling back..." size={140} />
      <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:28, fontSize:15, fontFamily:'Lato,sans-serif' }}>
        Sit with the emotion from Step 1. Feel it. Now ask: <em>what is the earliest memory I have of feeling exactly this?</em> Trust what surfaces.
      </p>
      <Q text="When I follow this feeling back, I find myself at age..." />
      <Box placeholder="how old were you?" value={A.memAge||''} onChange={v=>setA(a=>({...a,memAge:v}))} minH={56} />
      {A.memAge?.trim() && (
        <div className="fade-in">
          <Q text="What was happening was..." />
          <Box placeholder="Who was there, what was said or done, what you remember of the scene..." value={A.memScene||''} onChange={v=>setA(a=>({...a,memScene:v}))} minH={120} />
        </div>
      )}
      {A.memScene?.trim() && (
        <div className="fade-in">
          <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:16, fontSize:15, fontFamily:'Lato,sans-serif' }}>This is the most important question — not what happened, but what the child you were <em>made it mean.</em> A child's conclusion. Raw, simple, protective.</p>
          <Q text="What I made this mean about me was..." />
          <Box placeholder="I decided that I was... / This proved that I... / I learned that I..." value={A.memMeaning||''} onChange={v=>setA(a=>({...a,memMeaning:v}))} minH={100} />
        </div>
      )}
      {ready && !synth && !loading && <Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading) && <Synth text={synth} loading={loading} onDone={()=>setDone(true)} />}
      {done && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
  var done2 = done; void done2
}

function Step3({ A, setA, next }) {
  const [synth, setSynth] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const belief = A.rootBelief || ''
  const ready = belief && A.isItTrue?.trim() && A.hasToBeTrue?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Memory: "${A.memScene}"\nRoot belief: "${belief}"\nIs it objectively true: "${A.isItTrue}"\nDoes it have to be true: "${A.hasToBeTrue}"\nAcknowledge how this belief made sense to the child they were, and validate the crack of awareness they just created. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setLoading(false)
  }

  return (
    <Shell n={3} icon="◉" label="Root Opinion">
      <TeachingCard text="A child can't process pain the way an adult can. So they make it mean something about themselves — a simple conclusion that explains the hurt and tells them how to stay safe. That meaning became the lens you've seen everything through since. We're naming it now. Because what's named can be changed." />
      <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, color:'var(--teal)', fontStyle:'italic', lineHeight:1.75, marginBottom:20 }}>Which of these feels most true — the story that's been running underneath everything?</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {OPINIONS.map(op => (
          <div key={op.value} onClick={()=>setA(a=>({...a,rootBelief:op.value,rootBeliefCustom:''}))}
            style={{ padding:'16px 20px', border:`1px solid ${belief===op.value?'var(--teal)':'rgba(26,74,69,0.2)'}`, borderLeft:`${belief===op.value?'4px':'1px'} solid ${belief===op.value?'var(--teal)':'rgba(26,74,69,0.2)'}`, borderRadius:4, cursor:'pointer', background:belief===op.value?'rgba(26,74,69,0.08)':'rgba(255,255,255,0.5)', transition:'all 0.25s' }}>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, color:'var(--teal)', marginBottom:4 }}>{op.value}</p>
            <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{op.sub}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize:13, color:'var(--muted)', marginBottom:8, fontFamily:'Lato,sans-serif' }}>Or write your own:</p>
      <Box placeholder="The story I made it mean was..." value={A.rootBeliefCustom||''} onChange={v=>setA(a=>({...a,rootBeliefCustom:v,rootBelief:v||A.rootBelief}))} minH={56} />
      {belief && (
        <div className="fade-in">
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)', margin:'24px 0' }} />
          <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:20, fontSize:15, fontFamily:'Lato,sans-serif' }}>Now look at this belief with adult eyes.</p>
          <Q text={`Is "${belief}" objectively true about you?`} />
          <Box placeholder="Look honestly. Is this actually, factually true?" value={A.isItTrue||''} onChange={v=>setA(a=>({...a,isItTrue:v}))} minH={80} />
          {A.isItTrue?.trim() && (
            <div className="fade-in">
              <Q text="Does this have to be true for you in the future?" />
              <Box placeholder="Does this story have to keep being yours? Does it have to follow you forward?" value={A.hasToBeTrue||''} onChange={v=>setA(a=>({...a,hasToBeTrue:v}))} minH={80} />
            </div>
          )}
        </div>
      )}
      {ready && !synth && !loading && <Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading) && <Synth text={synth} loading={loading} onDone={()=>setDone(true)} />}
      {done && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
  var done2 = done; void done2
}

function Step4({ A, setA, next }) {
  const [synth, setSynth] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const ready = A.bAvoid?.trim() && A.bNotFeel?.trim() && A.bBlame?.trim() && A.bWantIt?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Root belief: "${A.rootBelief}"\nAvoided: "${A.bAvoid}"\nDidn't have to feel: "${A.bNotFeel}"\nGot to blame: "${A.bBlame}"\nIs this what they want: "${A.bWantIt}"\nAcknowledge the intelligence of these adaptations — they made sense once. And name what they've honestly seen here. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setLoading(false)
  }

  return (
    <Shell n={4} icon="◆" label="Hidden Benefits">
      <TeachingCard text="This is the step most people skip — and exactly why most change doesn't stick. Every belief we hold serves us somehow. The subconscious doesn't hold onto things that don't work. If you've kept this story this long, you've been getting something from it. This isn't blame. It's understanding the intelligence behind the pattern — so you can finally let it go." />
      <Q text="By believing this story, I got to avoid..." />
      <Box placeholder="failure? rejection? accountability? having to really try?" value={A.bAvoid||''} onChange={v=>setA(a=>({...a,bAvoid:v}))} />
      {A.bAvoid?.trim() && (
        <div className="fade-in">
          <Q text="I didn't have to feel..." />
          <Box placeholder="what uncomfortable emotion or experience were you protected from?" value={A.bNotFeel||''} onChange={v=>setA(a=>({...a,bNotFeel:v}))} />
        </div>
      )}
      {A.bNotFeel?.trim() && (
        <div className="fade-in">
          <Q text="I got to blame..." />
          <Box placeholder="who or what did this story let you hold responsible instead of yourself?" value={A.bBlame||''} onChange={v=>setA(a=>({...a,bBlame:v}))} />
        </div>
      )}
      {A.bBlame?.trim() && (
        <div className="fade-in">
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)', margin:'8px 0 24px' }} />
          <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:16, fontSize:15, fontFamily:'Lato,sans-serif' }}>Now be honest with yourself.</p>
          <Q text="Is this really what I want? Am I proud of what this story has given me?" />
          <Box placeholder="Look at what you've actually gotten from this belief. Is this the life you want to keep building?" value={A.bWantIt||''} onChange={v=>setA(a=>({...a,bWantIt:v}))} />
        </div>
      )}
      {ready && !synth && !loading && <Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading) && <Synth text={synth} loading={loading} onDone={()=>setDone(true)} />}
      {done && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
  var done2 = done; void done2
}

function Step5({ A, setA, next }) {
  const [synth, setSynth] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const ready = A.oldMakes?.trim() && A.oldStops?.trim() && A.oldEvidence?.trim() && A.oldCost?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Root belief: "${A.rootBelief}"\nWhat it makes them do: "${A.oldMakes}"\nWhat it stops them from: "${A.oldStops}"\nHow it created evidence: "${A.oldEvidence}"\nWhat it cost: "${A.oldCost}"\nReflect the full weight of what this story has built — not to shame them, but to make the cost real and visible. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setLoading(false)
  }

  return (
    <Shell n={5} icon="◇" label="Old Story">
      <TeachingCard text="Now we write the full cost. Not to punish yourself — but because you can't throw away something you're still minimizing. You need to see what this story has actually built. All of it." />
      <Q text="This thinking makes me..." />
      <Box placeholder="what behaviors does this belief produce? What do you do, avoid, repeat?" value={A.oldMakes||''} onChange={v=>setA(a=>({...a,oldMakes:v}))} />
      {A.oldMakes?.trim() && (
        <div className="fade-in">
          <Q text="It stops me from..." />
          <Box placeholder="what haven't you done, said, tried, or let yourself have because of this belief?" value={A.oldStops||''} onChange={v=>setA(a=>({...a,oldStops:v}))} />
        </div>
      )}
      {A.oldStops?.trim() && (
        <div className="fade-in">
          <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:12, fontSize:15, fontFamily:'Lato,sans-serif' }}>Here's the insidious part: the belief made you act in ways that <em>proved it right.</em></p>
          <Q text='Because I believed this, I did _____, which created _____, which "proved" the belief was true...' />
          <Box placeholder="trace the loop — how did the belief create the evidence that kept it alive?" value={A.oldEvidence||''} onChange={v=>setA(a=>({...a,oldEvidence:v}))} minH={120} />
        </div>
      )}
      {A.oldEvidence?.trim() && (
        <div className="fade-in">
          <Q text="The real cost of this story in my life has been..." />
          <Box placeholder="relationships, money, time, missed opportunities, how you see yourself — be specific" value={A.oldCost||''} onChange={v=>setA(a=>({...a,oldCost:v}))} minH={120} />
        </div>
      )}
      {ready && !synth && !loading && <Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading) && <Synth text={synth} loading={loading} onDone={()=>setDone(true)} />}
      {done && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
  var done2 = done; void done2
}

function Step6({ A, next }) {
  const [phase, setPhase] = useState('contrast')
  const age = A.memAge || 'younger'
  const belief = A.rootBelief || 'this story'

  return (
    <Shell n={6} icon="✦" label="Release It">
      <TeachingCard text="You've seen it clearly now. The pattern, the root, the cost. Before you can choose something new, your whole system needs to register that this story is done. Not just understood — released." />

      {phase === 'contrast' && (
        <div className="fade-in">
          <div style={{ background:'rgba(26,74,69,0.06)', border:'1px solid rgba(196,168,130,0.3)', borderRadius:8, padding:32, marginBottom:32, textAlign:'center' }}>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'var(--teal)', fontStyle:'italic', lineHeight:1.75 }}>
              Do you want to keep being the {age}-year-old<br />who believes "{belief}"?
            </p>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, color:'var(--muted)', fontStyle:'italic', marginTop:16 }}>
              Or are you ready to make a different choice?
            </p>
          </div>
          <div style={{ textAlign:'center' }}><Btn onClick={()=>setPhase('spaghetti')}>I'm ready to choose differently →</Btn></div>
        </div>
      )}

      {phase === 'spaghetti' && (
        <div className="fade-in">
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:21, color:'var(--teal)', fontStyle:'italic', lineHeight:1.75, marginBottom:20 }}>The Stinky Spaghetti</p>
          <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:18, fontSize:15, fontFamily:'Lato,sans-serif' }}>Imagine a container of spaghetti left in a microwave for three weeks. Green-black mold. The smell hits you before the door is even open — rotting, fermenting, rancid. It coats the back of your throat.</p>
          <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:18, fontSize:15, fontFamily:'Lato,sans-serif' }}>That is your old story. You've been choosing it. Not because you're broken — but because no one ever showed you it had gone rotten.</p>
          <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:32, fontSize:15, fontFamily:'Lato,sans-serif' }}>You would not keep that spaghetti. You would not keep serving it to yourself. Sit with the disgust. Let your body register it. Let yourself squirm.</p>
          <div style={{ textAlign:'center' }}><Btn onClick={()=>setPhase('declare')}>I feel it →</Btn></div>
        </div>
      )}

      {phase === 'declare' && (
        <div className="fade-in" style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ width:96, height:96, borderRadius:'50%', margin:'0 auto 32px', background:'radial-gradient(circle,rgba(26,74,69,0.12),rgba(26,74,69,0.02))', border:'2px solid var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse 2s ease-in-out infinite', fontSize:32 }}>🗑</div>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, color:'var(--teal)', fontStyle:'italic', lineHeight:1.7, marginBottom:20 }}>Say this out loud. Mean it.</p>
          <p style={{ color:'var(--muted)', lineHeight:1.9, marginBottom:16, fontSize:17, fontFamily:'Lato,sans-serif' }}>"I am <strong style={{ color:'var(--teal)' }}>DONE</strong> with this story.<br />I throw it away. I do not need it anymore."</p>
          <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:36, fontSize:14, fontStyle:'italic', fontFamily:'Lato,sans-serif' }}>Stay here until something in you shifts. Take your time.</p>
          <Btn onClick={()=>setPhase('done')}>I am done with it →</Btn>
        </div>
      )}

      {phase === 'done' && (
        <div className="fade-in" style={{ textAlign:'center', padding:'20px 0 40px' }}>
          <span style={{ fontSize:28, display:'block', marginBottom:20, color:'var(--gold-light)' }}>✦</span>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, color:'var(--teal)', fontStyle:'italic', lineHeight:1.7, marginBottom:16 }}>The old story is gone.</p>
          <p style={{ color:'var(--muted)', lineHeight:1.85, marginBottom:40, fontSize:15, fontFamily:'Lato,sans-serif' }}>Something is different now. There is space where there wasn't before. That space is yours to fill.</p>
          <Btn onClick={next}>Now I choose something new →</Btn>
        </div>
      )}
    </Shell>
  )
}

function Step7({ A, setA, next }) {
  const [synth, setSynth] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const ready = A.declare?.trim() && A.ut1?.trim() && A.ut2?.trim() && A.ut3?.trim() && A.ut4?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Old belief: "${A.rootBelief}"\nNew declaration: "${A.declare}"\nI used to / now I:\n- ${A.ut1}\n- ${A.ut2}\n- ${A.ut3}\n- ${A.ut4}\nWrite a vivid, embodied reflection that paints who they are NOW. Specific to what they declared. 3 sentences, warm and plain.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setLoading(false)
  }

  const uts = [
    { k:'ut1', ph:"I used to believe I wasn't enough, and now..." },
    { k:'ut2', ph:"I used to need others' approval to feel okay, and now..." },
    { k:'ut3', ph:"I used to hide to stay safe, and now..." },
    { k:'ut4', ph:"I used to think I had to do it alone, and now..." },
  ]

  return (
    <Shell n={7} icon="◈" label="New Choice">
      <TeachingCard text="This is where most transformation work ends — with insight. Insight without declaration is just interesting. You're not choosing to understand the old story. You're choosing to BE something different. Right now. Pure choice doesn't need a reason — it only needs desire." />
      <Q text='I declare: "I am..."' />
      <Box placeholder="state your new identity — simply, completely, in present tense" value={A.declare||''} onChange={v=>setA(a=>({...a,declare:v}))} />
      {A.declare?.trim() && (
        <div className="fade-in">
          <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:20, fontSize:15, fontFamily:'Lato,sans-serif' }}>Now write the contrast. The old story vs who you are now.</p>
          {uts.map(({ k, ph }) => (
            <Box key={k} placeholder={ph} value={A[k]||''} onChange={v=>setA(a=>({...a,[k]:v}))} minH={64} />
          ))}
        </div>
      )}
      {ready && !synth && !loading && <Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading) && <Synth text={synth} loading={loading} onDone={()=>setDone(true)} />}
      {done && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
  var done2 = done; void done2
}

function Step8({ A, setA, next }) {
  const [focus, setFocus] = useState(A.focus||'')
  const [example, setExample] = useState('')
  const [exLoading, setExLoading] = useState(false)
  const [exDone, setExDone] = useState(false)
  const [synth, setSynth] = useState('')
  const [sLoading, setSLoading] = useState(false)
  const [sDone, setSDone] = useState(false)
  const ready = A.rwUsedTo?.trim() && A.rwFirst?.trim() && A.rwNow?.trim() && A.rwTell?.trim()

  async function genExample() {
    setExLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Write a "Remember When" example for this person. Speak in THEIR voice, first person, as if they're looking back from 2 years in the future on their old life.

Old belief: "${A.rootBelief}"
Old pattern: "${A.situation}"
New declaration: "${A.declare}"
Focus area: "${focus}"
I used to / now I: "${A.ut1}" and "${A.ut2}"

Write 5-6 "Remember When..." sentences in their voice, specific to the ${focus} area. Plain, warm, real — like someone telling a friend about the life they used to live. No headers. Just flowing sentences starting with "Remember when..." or natural variations.`)
      setExample(t)
    } catch(e) { setExample(`Error: ${e.message}`) }
    setExLoading(false)
  }

  async function reflect() {
    setSLoading(true)
    try {
      const t = await callClaude(SYSTEM_REFLECT,
        `Focus: "${focus}"\nOld belief: "${A.rootBelief}"\nDeclaration: "${A.declare}"\nRemember when: "${A.rwUsedTo}"\nFirst change: "${A.rwFirst}"\nNow looks like: "${A.rwNow}"\nTo old self: "${A.rwTell}"\nClose their journey — expand their vision and let them feel the future as real. 3 sentences, warm and plain.`)
      setSynth(t)
    } catch(e) { setSynth(`Error: ${e.message}`) }
    setSLoading(false)
  }

  return (
    <Shell n={8} icon="✧" label="Remember When">
      <TeachingCard text="The subconscious doesn't distinguish between a vividly imagined future and a real memory. When you speak from the future in past tense, your nervous system begins to encode it as experience. You're not pretending — you're installing. Speak slowly. Feel it as you write." />

      <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, color:'var(--teal)', fontStyle:'italic', lineHeight:1.75, marginBottom:20 }}>Walking through one area of life deeply is more powerful than touching everything lightly. Choose one area:</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:32 }}>
        {FOCUS.map(f => (
          <button key={f} onClick={()=>{ setFocus(f); setA(a=>({...a,focus:f})); setExample(''); setExDone(false) }}
            style={{ padding:'10px 18px', border:`1px solid ${focus===f?'var(--teal)':'rgba(26,74,69,0.25)'}`, borderRadius:20, cursor:'pointer', fontFamily:'Lato,sans-serif', fontSize:13, background:focus===f?'rgba(26,74,69,0.08)':'rgba(255,255,255,0.5)', color:focus===f?'var(--teal)':'var(--muted)', transition:'all 0.2s' }}>{f}</button>
        ))}
      </div>

      {focus && !example && !exLoading && (
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Btn onClick={genExample}>Generate my "Remember When" example →</Btn>
        </div>
      )}
      {exLoading && <div style={{ textAlign:'center', padding:'24px 0', marginBottom:32 }}><Dots /></div>}

      {example && (
        <div className="fade-in">
          <div style={{ background:'rgba(26,74,69,0.06)', borderLeft:'3px solid var(--gold-light)', padding:'24px 28px', borderRadius:'0 8px 8px 0', marginBottom:24 }}>
            <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--gold)', marginBottom:12, fontFamily:'Lato,sans-serif' }}>✦ Read this out loud — feel it as you speak</p>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, lineHeight:1.9, color:'var(--teal)', fontStyle:'italic' }}>
              {!exDone ? <Typing text={example} speed={14} onDone={()=>setExDone(true)} /> : example}
            </p>
          </div>

          {exDone && (
            <div className="fade-in">
              <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:24, fontSize:15, fontFamily:'Lato,sans-serif' }}>Now write your own. In your words. Speak from that future self.</p>
              <Q text="Remember when I used to..." />
              <Box placeholder="look back at the old pattern from your future self..." value={A.rwUsedTo||''} onChange={v=>setA(a=>({...a,rwUsedTo:v}))} />
              <Q text="The first thing that changed was..." />
              <Box placeholder="what shifted first when you started living differently?" value={A.rwFirst||''} onChange={v=>setA(a=>({...a,rwFirst:v}))} />
              <Q text={`One year later, my ${focus.toLowerCase()} looks like...`} />
              <Box placeholder="be specific — what are you doing, feeling, experiencing?" value={A.rwNow||''} onChange={v=>setA(a=>({...a,rwNow:v}))} minH={120} />
              <Q text="What I want to tell my old self is..." />
              <Box placeholder="speak directly to the version of you who was stuck in the pattern" value={A.rwTell||''} onChange={v=>setA(a=>({...a,rwTell:v}))} />
              {ready && !synth && !sLoading && <Btn onClick={reflect}>Reflect on this →</Btn>}
              {(synth||sLoading) && <Synth text={synth} loading={sLoading} onDone={()=>setSDone(true)} />}
              {sDone && <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={next}>Complete →</Btn></div>}
            </div>
          )}
        </div>
      )}
    </Shell>
  )
  var sDone2 = sDone; void sDone2
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSING
// ─────────────────────────────────────────────────────────────────────────────

function Story({ A, onNext }) {
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendoff, setSendoff] = useState('')
  const [soLoading, setSoLoading] = useState(false)
  const [storyDone, setStoryDone] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { gen() }, [])

  async function gen() {
    try {
      const t = await callClaude('You write plain, warm, specific transformation narratives. No poetry. No spiritual language. Second person, past-to-present tense. 4-5 paragraphs, no headers.',
        `Write a transformation story for this person.
Pattern: ${A.situation} / Emotion: ${A.emotion}
Memory: Age ${A.memAge} — ${A.memScene} / Made it mean: ${A.memMeaning}
Root belief: ${A.rootBelief}
Cost: ${A.oldCost}
New declaration: ${A.declare}
I used to / now I: ${A.ut1} / ${A.ut2}
Future (${A.focus}): ${A.rwNow}
To old self: ${A.rwTell}
Begin with the pattern they arrived carrying. Move through the memory and what it meant. Name what it cost. Describe the release. End with who they are now.`)
      setStory(t)
    } catch(e) { setStory(`Error: ${e.message}`) }
    setLoading(false)
  }

  async function genSendoff() {
    setSoLoading(true)
    try {
      const t = await callClaude('You write plain, warm, direct coaching send-offs. No spiritual language. One paragraph.',
        `Send-off for someone completing The Easy Button.
Declaration: "${A.declare}" / Future: "${A.rwNow}" / To old self: "${A.rwTell}"
4-5 sentences. Name what they've done. Acknowledge the new identity won't feel fully real yet — that's normal. Tell them what to do in the next hour, the next conversation, the next moment the old pattern shows up. End simply. No signature.`)
      setSendoff(t)
    } catch(e) { setSendoff(`Error: ${e.message}`) }
    setSoLoading(false)
  }

  const paras = story.split('\n').filter(p=>p.trim())

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'80px 24px' }}>
      <span style={{ fontSize:28, color:'var(--gold-light)', display:'block', textAlign:'center', marginBottom:24 }}>✦</span>
      <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:38, fontWeight:300, color:'var(--teal)', marginBottom:8, textAlign:'center' }}>Your Transformation Story</h2>
      <p style={{ fontSize:13, color:'var(--muted)', textAlign:'center', marginBottom:32, letterSpacing:1, fontFamily:'Lato,sans-serif' }}>What happened here today</p>
      <div style={{ height:1, background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)', marginBottom:32 }} />
      <div style={{ background:'var(--warm-white)', border:'1px solid rgba(196,168,130,0.2)', borderRadius:8, padding:40, marginBottom:16 }}>
        <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--gold)', marginBottom:20, fontFamily:'Lato,sans-serif' }}>✦ For You</p>
        {loading ? <div style={{ textAlign:'center' }}><Dots /></div> : (
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, lineHeight:1.95, color:'var(--text)' }}>
            {paras.map((p,i) => (
              <p key={i} style={{ marginBottom:16 }}>
                {i===0 ? <Typing text={p} speed={10} onDone={()=>{ setStoryDone(true); genSendoff() }} /> : (storyDone?p:'')}
              </p>
            ))}
          </div>
        )}
      </div>
      {storyDone && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:40 }}>
          <button onClick={()=>{ navigator.clipboard.writeText(story); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
            style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', background:'none', border:'1px solid rgba(107,100,88,0.3)', padding:'8px 16px', borderRadius:2, cursor:'pointer', fontFamily:'Lato,sans-serif' }}>
            {copied?'✓ Copied':'⎘ Copy your story'}
          </button>
        </div>
      )}
      {(sendoff||soLoading) && (
        <div style={{ background:'var(--cream-dark)', borderTop:'1px solid var(--gold-light)', borderBottom:'1px solid var(--gold-light)', padding:32, margin:'32px 0', textAlign:'center' }}>
          <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--gold)', marginBottom:16, fontFamily:'Lato,sans-serif' }}>✦ A word before you go</p>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, lineHeight:1.9, color:'var(--teal)', fontStyle:'italic' }}>
            {soLoading ? <Dots /> : <Typing text={sendoff} speed={18} onDone={()=>setTimeout(onNext,2500)} />}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────

const STEPS_META = [
  { icon:'◎', label:'The Pattern' }, { icon:'◈', label:'The Memory' },
  { icon:'◉', label:'Root Opinion' }, { icon:'◆', label:'Hidden Benefits' },
  { icon:'◇', label:'Old Story' }, { icon:'✦', label:'Release It' },
  { icon:'◈', label:'New Choice' }, { icon:'✧', label:'Remember When' },
]

const Ticker = () => (
  <div style={{ overflow:'hidden', width:'100vw', position:'fixed', top:0, padding:'13px 0', background:'var(--teal)', zIndex:200 }}>
    <div style={{ display:'flex', animation:'scrollTicker 24s linear infinite', width:'max-content' }}>
      {Array(10).fill('THE EASY BUTTON  ♦  ').map((t,i)=><span key={i} style={{ fontFamily:'Lato,sans-serif', fontSize:10, letterSpacing:4, color:'var(--gold-light)', whiteSpace:'nowrap', textTransform:'uppercase' }}>{t}</span>)}
    </div>
  </div>
)

export default function App() {
  const [phase, setPhase] = useState('intro')
  const [step, setStep] = useState(0)
  const [A, setA] = useState({})
  const top = useRef(null)
  const scrollTop = () => top.current?.scrollIntoView({ behavior:'smooth' })

  function next() { scrollTop(); if(step<7) setStep(s=>s+1); else setPhase('story') }
  function reset() { setPhase('intro'); setStep(0); setA({}) }

  const steps = [
    <Step1 key={0} A={A} setA={setA} next={next} />,
    <Step2 key={1} A={A} setA={setA} next={next} />,
    <Step3 key={2} A={A} setA={setA} next={next} />,
    <Step4 key={3} A={A} setA={setA} next={next} />,
    <Step5 key={4} A={A} setA={setA} next={next} />,
    <Step6 key={5} A={A} next={next} />,
    <Step7 key={6} A={A} setA={setA} next={next} />,
    <Step8 key={7} A={A} setA={setA} next={next} />,
  ]

  if (phase==='intro') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', background:'var(--cream)' }}>
      <Ticker />
      <div className="fade-up" style={{ maxWidth:560, textAlign:'center', marginTop:40 }}>
        <p style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:'var(--gold-light)', marginBottom:20, fontFamily:'Lato,sans-serif' }}>A process by Sol</p>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(48px,9vw,80px)', fontWeight:300, color:'var(--teal)', lineHeight:1.1, marginBottom:28 }}>The Easy<br /><em>Button</em></h1>
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)', margin:'28px 0' }} />
        <p style={{ fontSize:17, lineHeight:1.9, color:'var(--muted)', marginBottom:16, fontFamily:'Lato,sans-serif' }}>You've been here before.</p>
        <p style={{ fontSize:17, lineHeight:1.9, color:'var(--muted)', marginBottom:16, fontFamily:'Lato,sans-serif' }}>The pattern that keeps showing up. The same story wearing different faces. The version of you that keeps getting in your own way — not because you're broken, but because somewhere in your subconscious, there's a story that hasn't been rewritten yet.</p>
        <p style={{ fontSize:17, lineHeight:1.9, color:'var(--muted)', marginBottom:40, fontFamily:'Lato,sans-serif' }}>This process will take you through it — gently, deliberately, completely.</p>
        <p style={{ fontSize:13, color:'var(--muted)', fontStyle:'italic', marginBottom:44, fontFamily:'Lato,sans-serif' }}>Find a quiet space. Give yourself 30–45 minutes. Move slowly.</p>
        <Btn onClick={()=>setPhase('steps')}>Begin →</Btn>
      </div>
    </div>
  )

  if (phase==='story') return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <div ref={top} />
      <Story A={A} onNext={()=>setPhase('final')} />
    </div>
  )

  if (phase==='final') return (
    <div className="fade-in" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', background:'var(--teal)', textAlign:'center' }}>
      <span style={{ fontSize:28, display:'block', marginBottom:32, color:'var(--gold-light)' }}>✦</span>
      <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(28px,5vw,52px)', fontWeight:300, color:'var(--cream)', fontStyle:'italic', lineHeight:1.4, maxWidth:600 }}>"{A.declare||'I am ready.'}"</p>
      <div style={{ marginTop:60 }}>
        <button onClick={reset} style={{ background:'transparent', color:'rgba(245,240,232,0.5)', border:'1px solid rgba(245,240,232,0.2)', padding:'10px 24px', fontFamily:'Lato,sans-serif', fontSize:11, letterSpacing:2, textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}>Begin Again</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--warm-white)' }}>
      <div ref={top} />
      <Ticker />
      <div style={{ position:'fixed', top:40, left:0, right:0, zIndex:100, background:'var(--warm-white)', borderBottom:'1px solid rgba(26,74,69,0.1)', padding:'12px 32px', display:'flex', alignItems:'center', gap:16 }}>
        <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:15, color:'var(--teal)', fontStyle:'italic', minWidth:130 }}>The Easy Button</p>
        <div style={{ flex:1, display:'flex', gap:5, alignItems:'center' }}>
          {STEPS_META.map((_,i) => (
            <div key={i} style={{ borderRadius:4, transition:'all 0.4s', height:i===step?8:5, flex:i===step?1.6:1, background:i<step?'var(--teal)':i===step?'var(--gold-light)':'rgba(26,74,69,0.15)' }} />
          ))}
        </div>
        <p style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', minWidth:45, textAlign:'right', fontFamily:'Lato,sans-serif' }}>{step+1} / 8</p>
      </div>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'100px 24px 80px' }}>
        {steps[step]}
      </div>
    </div>
  )
}
