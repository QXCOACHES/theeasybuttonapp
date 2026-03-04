import { useState, useRef, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

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

const SYS = `You are assisting a subconscious reprogramming journaling process. Write warmly, plainly, specifically to what this person wrote. No headers, no bold, no asterisks, no labels. Warm but grounded. No spiritual or poetic language. Short sentences. Plain words. Specific to what they wrote — never generic.`

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Dots() {
  return (
    <span style={{display:'inline-flex',gap:5,alignItems:'center'}}>
      {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:'#c4a882',display:'inline-block',animation:`shimmer 1.2s ${i*0.2}s infinite`}}/>)}
    </span>
  )
}

function Typing({text,speed=16,onDone}) {
  const [shown,setShown]=useState('')
  const [done,setDone]=useState(false)
  useEffect(()=>{
    setShown('');setDone(false)
    if(!text)return
    let i=0
    const id=setInterval(()=>{
      setShown(text.slice(0,i+1));i++
      if(i>=text.length){clearInterval(id);setDone(true);onDone?.()}
    },speed)
    return ()=>clearInterval(id)
  },[text])
  return <span>{shown}{!done&&<span style={{opacity:0.35,animation:'shimmer 0.9s infinite'}}>|</span>}</span>
}

function Card({text}) {
  return (
    <div style={{background:'var(--teal)',borderRadius:6,padding:'28px 32px',marginBottom:36}}>
      <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold-light)',marginBottom:10,fontFamily:'Lato,sans-serif'}}>Why this step matters</p>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,lineHeight:1.75,color:'rgba(245,240,232,0.95)',fontStyle:'italic'}}>{text}</p>
    </div>
  )
}

function Q({text,sub}) {
  return (
    <div style={{marginBottom:10}}>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'var(--teal)',fontStyle:'italic',lineHeight:1.7}}>{text}</p>
      {sub&&<p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginTop:6,fontFamily:'Lato,sans-serif',fontStyle:'italic'}}>{sub}</p>}
    </div>
  )
}

function Box({placeholder,value,onChange,minH=100,disabled}) {
  return (
    <textarea disabled={disabled} style={{width:'100%',background:disabled?'rgba(245,240,232,0.5)':'rgba(255,255,255,0.65)',border:'none',borderBottom:`1.5px solid ${disabled?'transparent':'rgba(26,74,69,0.25)'}`,padding:'10px 2px',fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'var(--text)',outline:'none',resize:'none',minHeight:minH,lineHeight:1.6,marginBottom:24,transition:'border-color 0.3s'}}
      placeholder={placeholder} value={value} onChange={e=>onChange?.(e.target.value)}
      onFocus={e=>!disabled&&(e.target.style.borderBottomColor='#1a4a45')}
      onBlur={e=>!disabled&&(e.target.style.borderBottomColor='rgba(26,74,69,0.25)')}
    />
  )
}

function Reflection({text,loading}) {
  return (
    <div style={{background:'var(--warm-white)',borderLeft:'3px solid var(--gold-light)',borderRadius:'0 8px 8px 0',padding:'24px 28px',margin:'8px 0 24px',animation:'fadeIn 0.5s ease forwards'}}>
      <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontFamily:'Lato,sans-serif'}}>✦ Reflection</p>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,lineHeight:1.85,color:'var(--teal)',fontStyle:'italic'}}>
        {loading?<Dots/>:text}
      </p>
    </div>
  )
}

function Synth({text,loading,onDone}) {
  return (
    <div style={{background:'var(--cream-dark)',borderTop:'1px solid var(--gold-light)',borderBottom:'1px solid var(--gold-light)',padding:32,margin:'32px 0',textAlign:'center'}}>
      <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:16,fontFamily:'Lato,sans-serif'}}>✦ Reflection</p>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,lineHeight:1.9,color:'var(--teal)',fontStyle:'italic'}}>
        {loading?<Dots/>:<Typing text={text} speed={18} onDone={onDone}/>}
      </p>
    </div>
  )
}

function Breathe({label='Breathe...',size=130}) {
  return (
    <div style={{textAlign:'center',padding:'48px 0'}}>
      <div style={{width:size,height:size,borderRadius:'50%',margin:'0 auto 24px',border:'2px solid var(--gold-light)',display:'flex',alignItems:'center',justifyContent:'center',animation:'breathe 5s ease-in-out infinite',background:'rgba(26,74,69,0.04)'}}>
        <div style={{width:size*0.65,height:size*0.65,borderRadius:'50%',border:'1px solid rgba(26,74,69,0.2)',animation:'breathe 5s ease-in-out infinite 0.8s'}}/>
      </div>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'var(--muted)',fontStyle:'italic'}}>{label}</p>
    </div>
  )
}

function Btn({onClick,disabled,ghost,children,full}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{background:ghost?'transparent':disabled?'rgba(26,74,69,0.4)':'var(--teal)',color:ghost?'var(--teal)':'var(--cream)',border:ghost?'1px solid rgba(26,74,69,0.4)':'none',padding:'13px 28px',fontFamily:'Lato,sans-serif',fontSize:12,letterSpacing:2,textTransform:'uppercase',cursor:disabled?'not-allowed':'pointer',transition:'all 0.25s',borderRadius:2,width:full?'100%':'auto'}}>
      {children}
    </button>
  )
}

function Shell({n,icon,label,children}) {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32}}>
        <span style={{fontSize:20,color:'var(--gold-light)'}}>{icon}</span>
        <div>
          <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:4,fontFamily:'Lato,sans-serif'}}>Step {n} of 8</p>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:30,color:'var(--teal)',fontWeight:400}}>{label}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}

function Example({items}) {
  const [open,setOpen]=useState(false)
  return (
    <div style={{marginBottom:16}}>
      <button onClick={()=>setOpen(o=>!o)} style={{fontSize:11,letterSpacing:1,color:'var(--gold)',cursor:'pointer',background:'none',border:'none',padding:'4px 0',fontFamily:'Lato,sans-serif',textDecoration:'underline'}}>
        {open?'hide examples ↑':'see examples ↓'}
      </button>
      {open&&(
        <div style={{background:'rgba(196,168,130,0.12)',borderLeft:'2px solid var(--gold-light)',padding:'14px 18px',borderRadius:'0 4px 4px 0',marginTop:8,animation:'slideDown 0.3s ease forwards'}}>
          {items.map((it,i)=><p key={i} style={{fontFamily:'Cormorant Garamond,serif',fontSize:16,color:'var(--muted)',fontStyle:'italic',lineHeight:1.65,marginBottom:i<items.length-1?8:0}}>"{it}"</p>)}
        </div>
      )}
    </div>
  )
}

const OPINIONS = [
  {value:'I am not good enough',sub:'Perfectionism, over-working, needing external validation, never feeling finished.'},
  {value:"I am not worthy of love / I don't matter",sub:'People-pleasing, self-abandonment, anxiety in relationships, shrinking yourself.'},
  {value:'I am not safe',sub:'Hypervigilance, control, difficulty trusting, always waiting for something to go wrong.'},
  {value:'I am alone',sub:'Isolation, over-independence, pushing people away before they can leave.'},
  {value:'I am wrong',sub:'Shame, hiding, difficulty speaking up, chronic self-doubt.'},
]

const FOCUS=['Love & relationships','Money & career','Body & health','Purpose & creativity','Home & safety','Other']

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1
// ─────────────────────────────────────────────────────────────────────────────

function Step1({A,setA,next}) {
  const [phase,setPhase]=useState('pattern')
  const [synth,setSynth]=useState('')
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)

  async function reflect() {
    setLoading(true)
    try {
      const t=await callClaude(SYS,`Pattern: "${A.situation}"\nEmotion + body: "${A.emotion}"\nReflect back both the pattern and what it feels like in their body. 3 sentences, plain and warm.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setLoading(false)
  }

  if(phase==='somatic') return (
    <Shell n={1} icon="◎" label="The Pattern">
      <Breathe label="Breathe into it. Let yourself actually feel it." size={150}/>
      <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:24,fontSize:15,fontFamily:'Lato,sans-serif'}}>Don't rush past this. The pattern you just described lives somewhere in your body. You've felt it a hundred times before.</p>
      <Q text="When this pattern shows up, I feel..." sub="Name the emotion — and where you feel it in your body. Chest? Throat? Stomach? Get specific."/>
      <Box placeholder="e.g. A tight knot in my stomach. Dread. Like I have to disappear..." value={A.emotion||''} onChange={v=>setA(a=>({...a,emotion:v}))} minH={80}/>
      <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:32,fontSize:14,fontStyle:'italic',fontFamily:'Lato,sans-serif'}}>Take your time. Really let yourself be in it before you move on.</p>
      {!synth&&!loading&&<Btn onClick={reflect} disabled={!A.emotion?.trim()}>I can feel it →</Btn>}
      {(synth||loading)&&<Synth text={synth} loading={loading} onDone={()=>setDone(true)}/>}
      {done&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )

  return (
    <Shell n={1} icon="◎" label="The Pattern">
      <Card text="The pattern is the entry point. You already know something keeps repeating — the same feeling, different situations, different faces. We're not trying to fix it yet. We're just naming it clearly, so we can find where it started."/>
      <Q text="The situation that keeps repeating in my life is..." sub="Be specific. What actually keeps happening — in relationships, work, with yourself?"/>
      <Example items={["Every time I start getting close to someone, I find a reason to pull away — or I push until they leave.","I keep starting things with total conviction and then abandoning them right before they matter.","I get into the same dynamic at every job — I give everything, feel invisible, then either quit or get pushed out."]}/>
      <Box placeholder="Describe the pattern as specifically as you can..." value={A.situation||''} onChange={v=>setA(a=>({...a,situation:v}))}/>
      <Btn onClick={()=>setPhase('somatic')} disabled={!A.situation?.trim()}>I see the pattern →</Btn>
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2
// ─────────────────────────────────────────────────────────────────────────────

function Step2({A,setA,next}) {
  const [synth,setSynth]=useState('')
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)
  const ready=A.memAge?.trim()&&A.memScene?.trim()&&A.memMeaning?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t=await callClaude(SYS,`Pattern: "${A.situation}"\nAge: "${A.memAge}"\nWhat happened: "${A.memScene}"\nWhat they made it mean: "${A.memMeaning}"\nAcknowledge what that child went through and how the conclusion they made was the only one that made sense at the time. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setLoading(false)
  }

  return (
    <Shell n={2} icon="◈" label="The Memory">
      <Card text="Every pattern has an origin. Somewhere back in your life, something happened — and the child you were made a conclusion about themselves to survive it. That conclusion became the operating system. We're going to find it."/>
      <Breathe label="Close your eyes. Breathe. Follow the feeling back..." size={140}/>
      <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:28,fontSize:15,fontFamily:'Lato,sans-serif'}}>Sit with the emotion from Step 1. Feel it. Now ask yourself: <em>what is the earliest memory I have of feeling exactly this?</em> Let it come — don't force it. Trust what surfaces.</p>
      <Q text="When I follow this feeling back, I find myself at age..."/>
      <Box placeholder="how old were you?" value={A.memAge||''} onChange={v=>setA(a=>({...a,memAge:v}))} minH={56}/>
      {A.memAge?.trim()&&(
        <div className="fade-in">
          <Q text="What was happening was..." sub="Describe the scene — who was there, what was said or done, what you remember."/>
          <Box placeholder="Be as specific as you can. What do you remember about that moment?" value={A.memScene||''} onChange={v=>setA(a=>({...a,memScene:v}))} minH={120}/>
        </div>
      )}
      {A.memScene?.trim()&&(
        <div className="fade-in">
          <div style={{background:'rgba(26,74,69,0.05)',border:'1px solid rgba(196,168,130,0.3)',borderRadius:6,padding:'20px 24px',marginBottom:20}}>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:16,color:'var(--teal)',lineHeight:1.75,fontStyle:'italic',marginBottom:8}}>This is the most important question in the whole process.</p>
            <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.75,fontFamily:'Lato,sans-serif'}}>Not what happened — but what the child you were <strong>made it mean.</strong> A child can't process pain logically. They make a simple, protective conclusion: <em>"This means something about me."</em> It's not rational. It's survival.</p>
          </div>
          <Example items={["I decided that I was too much — that if I was fully myself, people would leave.","I learned that anger meant danger, so I had to stay quiet and invisible to be safe.","I decided I wasn't worth choosing — that when people left, it was because something was fundamentally wrong with me.","I made it mean that I had to earn love by being perfect and never needing anything."]}/>
          <Q text="What I made this mean about me was..."/>
          <Box placeholder="I decided that I... / This proved that I... / I learned that I..." value={A.memMeaning||''} onChange={v=>setA(a=>({...a,memMeaning:v}))} minH={100}/>
        </div>
      )}
      {ready&&!synth&&!loading&&<Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading)&&<Synth text={synth} loading={loading} onDone={()=>setDone(true)}/>}
      {done&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3
// ─────────────────────────────────────────────────────────────────────────────

function Step3({A,setA,next}) {
  const [synth,setSynth]=useState('')
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)
  const [convo,setConvo]=useState([]) // [{role,text}]
  const [pushback,setPushback]=useState('')
  const [pbLoading,setPbLoading]=useState(false)
  const [pbInput,setPbInput]=useState('')
  const [isTrue,setIsTrue]=useState(null) // null | 'yes' | 'no'
  const [gated,setGated]=useState(false) // true when they've confirmed it's NOT true
  const belief=A.rootBelief||''
  const readyToReflect=belief&&A.isItTrue?.trim()&&A.whyOrWhyNot?.trim()&&gated

  async function handleIsItTrue(answer) {
    setIsTrue(answer)
    setA(a=>({...a,isItTrue:answer}))
    if(answer==='no') { setGated(true) }
    else {
      // They said yes — start pushback conversation
      setPbLoading(true)
      const history=convo.map(c=>`${c.role==='user'?'They said':'You responded'}: "${c.text}"`).join('\n')
      try {
        const t=await callClaude(SYS,
          `The person believes their root belief is objectively true. Your job is to gently but firmly challenge this. This belief — "${belief}" — is a story a child made to survive pain. It is not an objective fact about who they are.

Root belief: "${belief}"
Memory it came from: "${A.memScene}"
What they made it mean: "${A.memMeaning}"
Their answer "is it true?": "${A.isItTrue}"
Their reasoning: "${A.whyOrWhyNot}"
${history?`\nConversation so far:\n${history}\n\nKeep pushing — they're still holding on to it being true. Go deeper.`:''}

Challenge this belief directly. Name specific reasons it's a child's conclusion, not an adult objective truth. Be warm but don't back down. Ask them to reconsider. 3-4 sentences.`)
        setPushback(t)
        setConvo(c=>[...c,{role:'ai',text:t}])
      } catch(e){setPushback(`Error: ${e.message}`)}
      setPbLoading(false)
    }
  }

  async function handlePbResponse() {
    if(!pbInput.trim()) return
    const newConvo=[...convo,{role:'user',text:pbInput}]
    setConvo(newConvo)
    setPbInput('')
    setPbLoading(true)
    try {
      const history=newConvo.map(c=>`${c.role==='user'?'They said':'You responded'}: "${c.text}"`).join('\n')
      const t=await callClaude(SYS,
        `Continuing to challenge the belief "${belief}" being objectively true.
Memory: "${A.memScene}"
Conversation so far:\n${history}

Keep gently challenging. If they're starting to soften or question it, acknowledge that and push a little further. If they're still holding firm, find a different angle. Goal: help them see this is a child's story, not an objective truth. 3-4 sentences.`)
      setPushback(t)
      setConvo(c=>[...c,{role:'ai',text:t}])
    } catch(e){setPushback(`Error: ${e.message}`)}
    setPbLoading(false)
  }

  async function handleReflect() {
    setLoading(true)
    try {
      const t=await callClaude(SYS,
        `Memory: "${A.memScene}"\nRoot belief: "${belief}"\nIs it true: "${A.isItTrue}"\nWhy/why not: "${A.whyOrWhyNot}"\nAcknowledge how this belief made sense to the child they were, and honor the moment of seeing it clearly as an adult. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setLoading(false)
  }

  return (
    <Shell n={3} icon="◉" label="Root Opinion">
      <Card text="A child can't process pain the way an adult can. So they make it mean something about themselves — a simple conclusion that explains the hurt and tells them how to stay safe. That meaning became the lens you've seen everything through since. We're naming it now. Because what's named can be changed."/>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:20}}>Which of these feels most true — the story that's been running underneath everything?</p>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
        {OPINIONS.map(op=>(
          <div key={op.value} onClick={()=>setA(a=>({...a,rootBelief:op.value,rootBeliefCustom:'',isItTrue:undefined,whyOrWhyNot:undefined}))&&setIsTrue(null)&&setGated(false)}
            style={{padding:'16px 20px',border:`1px solid ${belief===op.value?'var(--teal)':'rgba(26,74,69,0.2)'}`,borderLeft:`${belief===op.value?'4px':'1px'} solid ${belief===op.value?'var(--teal)':'rgba(26,74,69,0.2)'}`,borderRadius:4,cursor:'pointer',background:belief===op.value?'rgba(26,74,69,0.08)':'rgba(255,255,255,0.5)',transition:'all 0.25s'}}>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:17,color:'var(--teal)',marginBottom:4}}>{op.value}</p>
            <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{op.sub}</p>
          </div>
        ))}
      </div>
      <p style={{fontSize:13,color:'var(--muted)',marginBottom:8,fontFamily:'Lato,sans-serif'}}>Or write your own:</p>
      <Box placeholder="The story I made it mean was..." value={A.rootBeliefCustom||''} onChange={v=>{setA(a=>({...a,rootBeliefCustom:v,rootBelief:v||A.rootBelief}));setIsTrue(null);setGated(false)}} minH={56}/>

      {belief&&(
        <div className="fade-in">
          <div style={{height:1,background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)',margin:'24px 0'}}/>
          <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:20,fontSize:15,fontFamily:'Lato,sans-serif'}}>Now look at this belief with adult eyes.</p>
          <Q text={`Is "${belief}" objectively true about you?`}/>
          {isTrue===null&&(
            <div style={{display:'flex',gap:12,marginBottom:24}}>
              <Btn onClick={()=>handleIsItTrue('no')} ghost>No, it's not objectively true</Btn>
              <Btn onClick={()=>handleIsItTrue('yes')}>Yes, I think it's true</Btn>
            </div>
          )}

          {/* Pushback conversation loop */}
          {isTrue==='yes'&&(
            <div className="fade-in">
              {convo.filter(c=>c.role==='ai').map((c,i)=>(
                <Reflection key={i} text={c.text} loading={false}/>
              ))}
              {pbLoading&&<Reflection text="" loading={true}/>}
              {pushback&&!pbLoading&&(
                <div className="fade-in">
                  <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:12,fontSize:14,fontFamily:'Lato,sans-serif'}}>Respond — or reconsider your answer:</p>
                  <Box placeholder="What's your response to this? Or, if you're starting to see it differently, say so..." value={pbInput} onChange={v=>setPbInput(v)} minH={80}/>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    <Btn onClick={handlePbResponse} disabled={!pbInput.trim()} ghost>Keep going →</Btn>
                    <Btn onClick={()=>{setIsTrue('no');setGated(true)}}>Actually, no — it's not objectively true</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {gated&&(
            <div className="fade-in">
              <p style={{color:'var(--teal)',fontFamily:'Cormorant Garamond,serif',fontSize:18,fontStyle:'italic',marginBottom:20,marginTop:8}}>✦ Good. It's a story — not a fact.</p>
              <Q text="Why isn't it objectively true? What's the evidence against it?" sub="Look at your actual life. Find the proof that this isn't a factual statement about who you are."/>
              <Box placeholder="The evidence that this isn't objectively true is..." value={A.whyOrWhyNot||''} onChange={v=>setA(a=>({...a,whyOrWhyNot:v}))} minH={100}/>
            </div>
          )}
        </div>
      )}

      {readyToReflect&&!synth&&!loading&&<Btn onClick={handleReflect}>Reflect on this →</Btn>}
      {(synth||loading)&&<Synth text={synth} loading={loading} onDone={()=>setDone(true)}/>}
      {done&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4
// ─────────────────────────────────────────────────────────────────────────────

function Step4({A,setA,next}) {
  const [synth,setSynth]=useState('')
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)
  const ready=A.bAvoid?.trim()&&A.bNotFeel?.trim()&&A.bBlame?.trim()&&A.bWantIt?.trim()

  async function reflect() {
    setLoading(true)
    try {
      const t=await callClaude(SYS,`Root belief: "${A.rootBelief}"\nAvoided: "${A.bAvoid}"\nDidn't have to feel: "${A.bNotFeel}"\nGot to blame: "${A.bBlame}"\nIs this what they want: "${A.bWantIt}"\nAcknowledge the intelligence of these adaptations — they made sense once. Name what they've honestly seen. 3 sentences, plain and direct.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setLoading(false)
  }

  return (
    <Shell n={4} icon="◆" label="Hidden Benefits">
      <Card text="This is the step most people skip — and exactly why most change doesn't stick. Every belief we hold serves us somehow. The subconscious doesn't hold onto things that don't work. If you've kept this story this long, you've been getting something from it. This isn't blame. It's understanding the intelligence behind the pattern."/>
      <Q text="By believing this story, I got to avoid..." sub="What did this belief protect you from having to face, try, or feel?"/>
      <Example items={["Having to actually try — because if I never fully commit, I can never fully fail.","Being truly seen — staying small meant no one could judge the real me.","Rejection — if I left first, they couldn't leave me.","Accountability — I got to blame my circumstances, my upbringing, other people."]}/>
      <Box placeholder="failure? rejection? accountability? having to really try?" value={A.bAvoid||''} onChange={v=>setA(a=>({...a,bAvoid:v}))}/>
      {A.bAvoid?.trim()&&(
        <div className="fade-in">
          <Q text="I didn't have to feel..." sub="What uncomfortable emotion or experience were you protected from?"/>
          <Example items={["The terror of being fully seen and found wanting.","The grief of genuinely not being chosen.","The shame of failing at something I actually cared about.","The loneliness of realizing no one was coming to save me."]}/>
          <Box placeholder="grief? terror? shame? loneliness? the feeling of truly being alone?" value={A.bNotFeel||''} onChange={v=>setA(a=>({...a,bNotFeel:v}))}/>
        </div>
      )}
      {A.bNotFeel?.trim()&&(
        <div className="fade-in">
          <Q text="I got to blame..." sub="Who or what did this story let you hold responsible instead of looking inward?"/>
          <Box placeholder="my parents, my partner, my circumstances, bad luck, the economy..." value={A.bBlame||''} onChange={v=>setA(a=>({...a,bBlame:v}))}/>
        </div>
      )}
      {A.bBlame?.trim()&&(
        <div className="fade-in">
          <div style={{height:1,background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)',margin:'8px 0 24px'}}/>
          <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:16,fontSize:15,fontFamily:'Lato,sans-serif'}}>Now be honest with yourself.</p>
          <Q text="Is this really what I want? Am I proud of what this story has given me?"/>
          <Box placeholder="Look at what you've actually gotten from this belief. Is this the life you want to keep building?" value={A.bWantIt||''} onChange={v=>setA(a=>({...a,bWantIt:v}))}/>
        </div>
      )}
      {ready&&!synth&&!loading&&<Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading)&&<Synth text={synth} loading={loading} onDone={()=>setDone(true)}/>}
      {done&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5
// ─────────────────────────────────────────────────────────────────────────────

function Step5({A,setA,next}) {
  const [aiIntro,setAiIntro]=useState('')
  const [introLoading,setIntroLoading]=useState(true)
  const [synth,setSynth]=useState('')
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)
  const ready=A.oldMakes?.trim()&&A.oldStops?.trim()&&A.ev1?.trim()&&A.ev2?.trim()&&A.ev3?.trim()&&A.oldCost?.trim()

  useEffect(()=>{genIntro()},[])

  async function genIntro() {
    try {
      const t=await callClaude(SYS,
        `The person is about to examine how their root belief has shaped their life patterns.
Root belief: "${A.rootBelief}"
Memory: "${A.memScene}"
What they made it mean: "${A.memMeaning}"
Benefits they got: avoided "${A.bAvoid}", didn't feel "${A.bNotFeel}"

Write 3-4 sentences that:
1. Briefly reflect the story they've uncovered so far
2. Give 2-3 specific examples of how the belief "${A.rootBelief}" typically shows up as real-life patterns and behaviors (make them feel recognizable and specific to their belief)
3. Invite them to now trace exactly how this has shown up in their own life

Plain, warm, direct. No labels.`)
      setAiIntro(t)
    } catch(e){setAiIntro(`Error: ${e.message}`)}
    setIntroLoading(false)
  }

  async function reflect() {
    setLoading(true)
    try {
      const t=await callClaude(SYS,
        `Root belief: "${A.rootBelief}"\nWhat it makes them do: "${A.oldMakes}"\nWhat it stops them from: "${A.oldStops}"\nEvidence loop: "${A.ev1}" → "${A.ev2}" → "${A.ev3}"\nCost: "${A.oldCost}"\nReflect the full weight of what this story has built — not to shame them, but to make the cost real and visible. 3 sentences.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setLoading(false)
  }

  return (
    <Shell n={5} icon="◇" label="Old Story">
      <Card text="Now we trace exactly how this belief has built your life. Not to punish yourself — but because you can't throw away something you're still minimizing. You need to see what this story has actually constructed around you. All of it."/>

      <div style={{background:'var(--warm-white)',borderLeft:'3px solid var(--gold-light)',borderRadius:'0 8px 8px 0',padding:'24px 28px',marginBottom:32}}>
        <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontFamily:'Lato,sans-serif'}}>✦ Your story so far</p>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,lineHeight:1.85,color:'var(--teal)',fontStyle:'italic'}}>
          {introLoading?<Dots/>:aiIntro}
        </p>
      </div>

      <Q text="This belief makes me..." sub="What behaviors does it produce? Think about your actual day-to-day."/>
      <Example items={["Procrastinate, overthink, self-sabotage right before a breakthrough.","Over-explain myself, apologize constantly, shrink in groups.","Work twice as hard as everyone else but still feel like a fraud.","Avoid any situation where I might be judged or rejected."]}/>
      <Box placeholder="what do you do, avoid, repeat, or overdo because of this belief?" value={A.oldMakes||''} onChange={v=>setA(a=>({...a,oldMakes:v}))}/>

      {A.oldMakes?.trim()&&(
        <div className="fade-in">
          <Q text="It stops me from..." sub="What haven't you done, said, tried, or let yourself have?"/>
          <Example items={["Finishing things that actually matter to me.","Asking for what I need in relationships.","Putting myself forward for opportunities I actually want.","Letting people see me when I'm not at my best."]}/>
          <Box placeholder="what haven't you let yourself do, say, try, or have?" value={A.oldStops||''} onChange={v=>setA(a=>({...a,oldStops:v}))}/>
        </div>
      )}

      {A.oldStops?.trim()&&(
        <div className="fade-in">
          <div style={{background:'rgba(26,74,69,0.05)',border:'1px solid rgba(196,168,130,0.3)',borderRadius:6,padding:'20px 24px',marginBottom:20}}>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:17,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:8}}>Here's where it gets insidious.</p>
            <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.75,fontFamily:'Lato,sans-serif'}}>The belief doesn't just affect you — it makes you act in ways that <strong>create the very evidence that keeps it alive.</strong> It builds its own proof. Complete this loop:</p>
          </div>
          <Q text="Because I believed this, I did..." sub="What specific behavior did the belief produce?"/>
          <Example items={["...I stopped putting myself forward for things I wanted","...I kept myself small and never asked for what I needed","...I left relationships before they could leave me"]}/>
          <Box placeholder="Because I believed this, I did..." value={A.ev1||''} onChange={v=>setA(a=>({...a,ev1:v}))} minH={64}/>
          {A.ev1?.trim()&&(
            <div className="fade-in">
              <Q text="Which created..." sub="What was the result of that behavior?"/>
              <Box placeholder="Which created..." value={A.ev2||''} onChange={v=>setA(a=>({...a,ev2:v}))} minH={64}/>
            </div>
          )}
          {A.ev2?.trim()&&(
            <div className="fade-in">
              <Q text='Which "proved" the belief was true, because...' sub="How did that result feel like confirmation of your original story?"/>
              <Box placeholder='Which "proved" the belief was true, because...' value={A.ev3||''} onChange={v=>setA(a=>({...a,ev3:v}))} minH={64}/>
            </div>
          )}
        </div>
      )}

      {A.ev3?.trim()&&(
        <div className="fade-in">
          <Q text="The real cost of this story in my life has been..." sub="Relationships, money, time, missed opportunities, how you see yourself. Be honest."/>
          <Box placeholder="What has this belief actually cost you?" value={A.oldCost||''} onChange={v=>setA(a=>({...a,oldCost:v}))} minH={120}/>
        </div>
      )}

      {ready&&!synth&&!loading&&<Btn onClick={reflect}>Reflect on this →</Btn>}
      {(synth||loading)&&<Synth text={synth} loading={loading} onDone={()=>setDone(true)}/>}
      {done&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Continue →</Btn></div>}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6 — RELEASE
// ─────────────────────────────────────────────────────────────────────────────

function Step6({A,next}) {
  const [phase,setPhase]=useState('contrast')
  const age=A.memAge||'younger'
  const belief=A.rootBelief||'this story'

  return (
    <Shell n={6} icon="✦" label="Release It">
      <Card text="You've seen it clearly now. The pattern, the root, the cost. Before you can choose something new, your whole system needs to register that this story is done. Not just understood — released. This is somatic. Take it slowly."/>

      {phase==='contrast'&&(
        <div className="fade-in">
          <div style={{background:'rgba(26,74,69,0.06)',border:'1px solid rgba(196,168,130,0.3)',borderRadius:8,padding:32,marginBottom:24,textAlign:'center'}}>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75}}>
              Do you want to keep being the {age}-year-old<br/>who believes "{belief}"?
            </p>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'var(--muted)',fontStyle:'italic',marginTop:16}}>
              Or are you ready to make a different choice?
            </p>
          </div>
          <div style={{background:'rgba(196,168,130,0.08)',border:'1px solid rgba(196,168,130,0.25)',borderRadius:6,padding:'20px 24px',marginBottom:28}}>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:17,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:8}}>Before you press the button:</p>
            <p style={{fontSize:15,color:'var(--muted)',lineHeight:1.8,fontFamily:'Lato,sans-serif'}}>Say out loud: <strong style={{color:'var(--teal)'}}>"I'm ready to make a different choice."</strong></p>
            <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.8,fontFamily:'Lato,sans-serif',marginTop:8,fontStyle:'italic'}}>Let those words land in your body. Feel the readiness — not just think it. When you mean it, press the button.</p>
          </div>
          <div style={{textAlign:'center'}}><Btn onClick={()=>setPhase('s1')}>I'm ready to choose differently →</Btn></div>
        </div>
      )}

      {phase==='s1'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'16px 0'}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:24}}>Close your eyes for a moment.</p>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:32,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 32px'}}>Imagine a container of spaghetti. It's been sitting in a microwave for three weeks. No one has touched it. The lid is fogged with condensation.</p>
          <Btn onClick={()=>setPhase('s2')}>Keep going →</Btn>
        </div>
      )}

      {phase==='s2'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'16px 0'}}>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:24,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 24px'}}>You open the microwave door. The smell hits you before you even see it.</p>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:24,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 24px'}}>Rotting. Fermenting. Sweet and rancid at the same time. It coats the back of your throat. Your stomach turns.</p>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:32}}>You look inside. Green-black mold has taken over completely.</p>
          <Btn onClick={()=>setPhase('s3')}>Keep going →</Btn>
        </div>
      )}

      {phase==='s3'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'16px 0'}}>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:24,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 24px'}}>Would you keep this in your house?</p>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:24}}>No. You'd throw it out immediately.</p>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:32,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 32px'}}>You'd take out the trash bag so it didn't stink up the whole house. You wouldn't keep serving it to yourself.</p>
          <Btn onClick={()=>setPhase('s4')}>Keep going →</Btn>
        </div>
      )}

      {phase==='s4'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'16px 0'}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:20}}>That's what you've been doing with your old story.</p>
          <div style={{background:'rgba(26,74,69,0.06)',border:'1px solid rgba(196,168,130,0.3)',borderRadius:8,padding:'24px 32px',margin:'0 auto 28px',maxWidth:520}}>
            <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontFamily:'Lato,sans-serif'}}>Your old story</p>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'var(--teal)',lineHeight:1.75,fontStyle:'italic'}}>"{belief}"</p>
          </div>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:32,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 32px'}}>You've been choosing it every day. Not because you're broken — but because no one ever showed you it had gone rotten.</p>
          <Btn onClick={()=>setPhase('s5')}>Keep going →</Btn>
        </div>
      )}

      {phase==='s5'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'16px 0'}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:21,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:24}}>Now imagine taking a bite of it.</p>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:24,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 24px'}}>The texture. The taste. The way it sits in your mouth. The smell up close. Let yourself fully imagine it. Let yourself squirm.</p>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:32,fontSize:16,fontFamily:'Lato,sans-serif',maxWidth:520,margin:'0 auto 32px',fontStyle:'italic'}}>That's how rotten this story is. That's what you've been consuming.</p>
          <Btn onClick={()=>setPhase('declare')}>I feel it →</Btn>
        </div>
      )}

      {phase==='declare'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'20px 0'}}>
          <div style={{width:96,height:96,borderRadius:'50%',margin:'0 auto 32px',background:'radial-gradient(circle,rgba(26,74,69,0.12),rgba(26,74,69,0.02))',border:'2px solid var(--teal)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse 2s ease-in-out infinite',fontSize:32}}>🗑</div>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,color:'var(--teal)',fontStyle:'italic',lineHeight:1.7,marginBottom:20}}>Say this out loud. Mean it.</p>
          <p style={{color:'var(--muted)',lineHeight:1.9,marginBottom:16,fontSize:17,fontFamily:'Lato,sans-serif'}}>"I am <strong style={{color:'var(--teal)'}}>DONE</strong> with this story.<br/>I throw it away. I take out the trash. I do not need it anymore."</p>
          <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:36,fontSize:14,fontStyle:'italic',fontFamily:'Lato,sans-serif'}}>Stay here until something in you shifts. Take your time.</p>
          <Btn onClick={()=>setPhase('done')}>I am done with it →</Btn>
        </div>
      )}

      {phase==='done'&&(
        <div className="fade-in" style={{textAlign:'center',padding:'20px 0 40px'}}>
          <span style={{fontSize:28,display:'block',marginBottom:20,color:'var(--gold-light)'}}>✦</span>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,color:'var(--teal)',fontStyle:'italic',lineHeight:1.7,marginBottom:16}}>The old story is gone.</p>
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:40,fontSize:15,fontFamily:'Lato,sans-serif'}}>Something is different now. There is space where there wasn't before. That space is yours to fill.</p>
          <Btn onClick={next}>Now I choose something new →</Btn>
        </div>
      )}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 — NEW CHOICE
// ─────────────────────────────────────────────────────────────────────────────

function Step7({A,setA,next}) {
  const [phase,setPhase]=useState('explain')
  const [synth,setSynth]=useState('')
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)

  async function reflect() {
    setLoading(true)
    try {
      const t=await callClaude(SYS,
        `Old belief: "${A.rootBelief}"\nNew declaration: "${A.declare}"\nReflect back who they are now — vivid, embodied, specific to their declaration. 3 sentences, warm and plain.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setLoading(false)
  }

  return (
    <Shell n={7} icon="◈" label="New Choice">
      <Card text="Getting rid of an old story isn't enough. The mind doesn't do well with a vacuum. You have to replace it — actively, deliberately — with a new story you actually want to live from. This is where you choose who you are now."/>

      {phase==='explain'&&(
        <div className="fade-in">
          <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:20,fontSize:15,fontFamily:'Lato,sans-serif'}}>The new story needs to be:</p>
          <ul style={{color:'var(--muted)',lineHeight:1.9,marginBottom:28,fontSize:15,fontFamily:'Lato,sans-serif',paddingLeft:20}}>
            <li style={{marginBottom:8}}><strong style={{color:'var(--teal)'}}>Simple.</strong> One clear sentence. Not a paragraph.</li>
            <li style={{marginBottom:8}}><strong style={{color:'var(--teal)'}}>Present tense.</strong> Not "I will be" — "I am."</li>
            <li style={{marginBottom:8}}><strong style={{color:'var(--teal)'}}>The direct opposite</strong> of the old belief, or the truth you want to claim.</li>
            <li><strong style={{color:'var(--teal)'}}>Something you actually want</strong> — not what you think you should want.</li>
          </ul>
          <Example items={["I am someone who is safe to be fully seen.","I am enough, exactly as I am, without earning it.","I am worthy of love — not because of what I do, but because of who I am.","I am someone who lets people in and trusts that I won't lose myself."]}/>
          <Q text='I declare: "I am..."' sub="Write it simply. One sentence. Present tense."/>
          <Box placeholder="state your new identity simply and completely..." value={A.declare||''} onChange={v=>setA(a=>({...a,declare:v}))}/>
          <Btn onClick={()=>setPhase('usedto')} disabled={!A.declare?.trim()}>This is my declaration →</Btn>
        </div>
      )}

      {phase==='usedto'&&(
        <div className="fade-in">
          <div style={{background:'rgba(26,74,69,0.06)',border:'1px solid rgba(196,168,130,0.3)',borderRadius:8,padding:'28px 32px',marginBottom:32,textAlign:'center'}}>
            <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:16,fontFamily:'Lato,sans-serif'}}>Say this out loud</p>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'var(--muted)',fontStyle:'italic',lineHeight:1.75,marginBottom:12}}>
              "I used to believe <span style={{color:'var(--teal)'}}>"{A.rootBelief}"</span>."
            </p>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75}}>
              "Now I am <span style={{color:'var(--teal)'}}>"{A.declare}"</span>."
            </p>
          </div>
          <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:28,fontSize:15,fontFamily:'Lato,sans-serif',fontStyle:'italic',textAlign:'center'}}>Say it out loud. Feel the contrast between the two. Let the new one land in your body.</p>
          <div style={{textAlign:'center',marginBottom:40}}>
            <Btn onClick={()=>setPhase('reflect')}>I said it. I felt it. →</Btn>
          </div>
        </div>
      )}

      {phase==='reflect'&&(
        <div className="fade-in">
          {!synth&&!loading&&(
            <>
              <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:24,fontSize:15,fontFamily:'Lato,sans-serif',textAlign:'center'}}>Let's close this step.</p>
              <Btn onClick={reflect} full>Reflect on my new choice →</Btn>
            </>
          )}
          {(synth||loading)&&<Synth text={synth} loading={loading} onDone={()=>setDone(true)}/>}
          {done&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Continue →</Btn></div>}
        </div>
      )}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 8 — REMEMBER WHEN
// ─────────────────────────────────────────────────────────────────────────────

function Step8({A,setA,next}) {
  const [focus,setFocus]=useState(A.focus||'')
  const [example,setExample]=useState('')
  const [exLoading,setExLoading]=useState(false)
  const [exDone,setExDone]=useState(false)
  const [synth,setSynth]=useState('')
  const [sLoading,setSLoading]=useState(false)
  const [sDone,setSDone]=useState(false)
  const ready=A.rwOwn?.trim()

  async function genExample() {
    setExLoading(true)
    try {
      const t=await callClaude(SYS,
        `Write a "Remember When" example for this person. They are speaking from their NEW identity, 2 years in the future, looking back on who they USED TO BE. First person. Past tense about the old life, present tense about now.

Old belief: "${A.rootBelief}"
New declaration: "${A.declare}"
Old pattern: "${A.situation}"
Focus area: "${focus}"
Old cost: "${A.oldCost}"

Write 5-6 sentences. They are reminiscing about the old version of themselves FROM the new identity — like telling a friend "remember when I used to be like that?" They now live fully in the new story. Make it specific to ${focus}. Plain, warm, real. Start with "Remember when..." or natural variations. Show the contrast between who they were and who they are now.`)
      setExample(t)
    } catch(e){setExample(`Error: ${e.message}`)}
    setExLoading(false)
  }

  async function reflect() {
    setSLoading(true)
    try {
      const t=await callClaude(SYS,
        `Focus: "${focus}"\nOld belief: "${A.rootBelief}"\nDeclaration: "${A.declare}"\nTheir own Remember When: "${A.rwOwn}"\nClose their journey — expand their vision, let them feel the future as already real. 3 sentences, warm and plain.`)
      setSynth(t)
    } catch(e){setSynth(`Error: ${e.message}`)}
    setSLoading(false)
  }

  return (
    <Shell n={8} icon="✧" label="Remember When">
      <Card text="The subconscious doesn't distinguish between a vividly imagined future and a real memory. When you speak from your new identity in past tense — as if it's already happened — your nervous system begins to encode it as experience. You're not pretending. You're installing."/>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,color:'var(--teal)',fontStyle:'italic',lineHeight:1.75,marginBottom:20}}>Choose one area of life to walk through deeply. One area, fully felt, is more powerful than touching everything lightly.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:32}}>
        {FOCUS.map(f=>(
          <button key={f} onClick={()=>{setFocus(f);setA(a=>({...a,focus:f}));setExample('');setExDone(false)}}
            style={{padding:'10px 18px',border:`1px solid ${focus===f?'var(--teal)':'rgba(26,74,69,0.25)'}`,borderRadius:20,cursor:'pointer',fontFamily:'Lato,sans-serif',fontSize:13,background:focus===f?'rgba(26,74,69,0.08)':'rgba(255,255,255,0.5)',color:focus===f?'var(--teal)':'var(--muted)',transition:'all 0.2s'}}>{f}</button>
        ))}
      </div>

      {focus&&!example&&!exLoading&&(
        <div style={{textAlign:'center',marginBottom:32}}><Btn onClick={genExample}>Generate my "Remember When" →</Btn></div>
      )}
      {exLoading&&<div style={{textAlign:'center',padding:'24px 0',marginBottom:32}}><Dots/></div>}

      {example&&(
        <div className="fade-in">
          <div style={{background:'rgba(26,74,69,0.06)',borderLeft:'3px solid var(--gold-light)',padding:'24px 28px',borderRadius:'0 8px 8px 0',marginBottom:20}}>
            <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontFamily:'Lato,sans-serif'}}>✦ Read this out loud — speak it as if it's yours</p>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,lineHeight:1.9,color:'var(--teal)',fontStyle:'italic'}}>
              {!exDone?<Typing text={example} speed={14} onDone={()=>setExDone(true)}/>:example}
            </p>
          </div>

          {exDone&&(
            <div className="fade-in">
              <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:24,fontSize:15,fontFamily:'Lato,sans-serif'}}>Now say your own out loud. Speak from your future self — the one already living in the new story. Write what you said so you can keep it.</p>
              <Q text="Remember when I used to..." sub="Speak from your new identity, looking back. Say it out loud first, then write it."/>
              <Box placeholder="Remember when I used to..." value={A.rwOwn||''} onChange={v=>setA(a=>({...a,rwOwn:v}))} minH={160}/>
              {ready&&!synth&&!sLoading&&<Btn onClick={reflect}>Reflect on this →</Btn>}
              {(synth||sLoading)&&<Synth text={synth} loading={sLoading} onDone={()=>setSDone(true)}/>}
              {sDone&&<div style={{marginTop:24,textAlign:'center'}}><Btn onClick={next}>Complete →</Btn></div>}
            </div>
          )}
        </div>
      )}
    </Shell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSING
// ─────────────────────────────────────────────────────────────────────────────

function Story({A,onNext}) {
  const [story,setStory]=useState('')
  const [loading,setLoading]=useState(true)
  const [sendoff,setSendoff]=useState('')
  const [soLoading,setSoLoading]=useState(false)
  const [storyDone,setStoryDone]=useState(false)
  const [sendoffDone,setSendoffDone]=useState(false)
  const [copied,setCopied]=useState(false)

  useEffect(()=>{gen()},[])

  async function gen() {
    try {
      const t=await callClaude('You write plain, warm, specific transformation narratives. No poetry. No spiritual language. Second person, past-to-present tense. 4-5 paragraphs, no headers.',
        `Write a transformation story for this person.
Pattern: ${A.situation} / Emotion: ${A.emotion}
Memory: Age ${A.memAge} — ${A.memScene} / Made it mean: ${A.memMeaning}
Root belief: ${A.rootBelief}
Cost: ${A.oldCost}
New declaration: ${A.declare}
Focus (${A.focus}): ${A.rwOwn}
Begin with the pattern they arrived carrying. Move through the memory and what it meant. Name what it cost. Describe the release. End with who they are now.`)
      setStory(t)
    } catch(e){setStory(`Error: ${e.message}`)}
    setLoading(false)
  }

  async function genSendoff() {
    setSoLoading(true)
    try {
      const t=await callClaude('You write plain, warm, direct coaching send-offs. No spiritual language. One paragraph.',
        `Send-off for someone completing The Easy Button.
Declaration: "${A.declare}" / Old belief: "${A.rootBelief}" / Future: "${A.rwOwn}"
4-5 sentences. Name what they've done. Acknowledge the new identity won't feel fully real yet — that's normal. Give them something specific to do in the next hour, next conversation, next moment the old pattern shows up. End simply. No signature.`)
      setSendoff(t)
    } catch(e){setSendoff(`Error: ${e.message}`)}
    setSoLoading(false)
  }

  const paras=story.split('\n').filter(p=>p.trim())

  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'80px 24px'}}>
      <span style={{fontSize:28,color:'var(--gold-light)',display:'block',textAlign:'center',marginBottom:24}}>✦</span>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:38,fontWeight:300,color:'var(--teal)',marginBottom:8,textAlign:'center'}}>Your Transformation Story</h2>
      <p style={{fontSize:13,color:'var(--muted)',textAlign:'center',marginBottom:32,letterSpacing:1,fontFamily:'Lato,sans-serif'}}>What happened here today</p>
      <div style={{height:1,background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)',marginBottom:32}}/>
      <div style={{background:'var(--warm-white)',border:'1px solid rgba(196,168,130,0.2)',borderRadius:8,padding:40,marginBottom:16}}>
        <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:20,fontFamily:'Lato,sans-serif'}}>✦ For You</p>
        {loading?<div style={{textAlign:'center'}}><Dots/></div>:(
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,lineHeight:1.95,color:'var(--text)'}}>
            {paras.map((p,i)=>(
              <p key={i} style={{marginBottom:16}}>
                {i===0?<Typing text={p} speed={10} onDone={()=>{setStoryDone(true);genSendoff()}}/>:(storyDone?p:'')}
              </p>
            ))}
          </div>
        )}
      </div>
      {storyDone&&(
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:40}}>
          <button onClick={()=>{navigator.clipboard.writeText(story);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
            style={{fontSize:11,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)',background:'none',border:'1px solid rgba(107,100,88,0.3)',padding:'8px 16px',borderRadius:2,cursor:'pointer',fontFamily:'Lato,sans-serif'}}>
            {copied?'✓ Copied':'⎘ Copy your story'}
          </button>
        </div>
      )}
      {(sendoff||soLoading)&&(
        <div style={{background:'var(--cream-dark)',borderTop:'1px solid var(--gold-light)',borderBottom:'1px solid var(--gold-light)',padding:32,margin:'32px 0',textAlign:'center'}}>
          <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--gold)',marginBottom:16,fontFamily:'Lato,sans-serif'}}>✦ A word before you go</p>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,lineHeight:1.9,color:'var(--teal)',fontStyle:'italic'}}>
            {soLoading?<Dots/>:<Typing text={sendoff} speed={18} onDone={()=>setSendoffDone(true)}/>}
          </p>
        </div>
      )}
      {sendoffDone&&(
        <div style={{textAlign:'center',marginTop:32}} className="fade-in">
          <Btn onClick={onNext}>I'm ready →</Btn>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────

const META=[
  {icon:'◎',label:'The Pattern'},{icon:'◈',label:'The Memory'},
  {icon:'◉',label:'Root Opinion'},{icon:'◆',label:'Hidden Benefits'},
  {icon:'◇',label:'Old Story'},{icon:'✦',label:'Release It'},
  {icon:'◈',label:'New Choice'},{icon:'✧',label:'Remember When'},
]

const Ticker=()=>(
  <div style={{overflow:'hidden',width:'100vw',position:'fixed',top:0,padding:'13px 0',background:'var(--teal)',zIndex:200}}>
    <div style={{display:'flex',animation:'scrollTicker 24s linear infinite',width:'max-content'}}>
      {Array(10).fill('THE EASY BUTTON  ♦  ').map((t,i)=><span key={i} style={{fontFamily:'Lato,sans-serif',fontSize:10,letterSpacing:4,color:'var(--gold-light)',whiteSpace:'nowrap',textTransform:'uppercase'}}>{t}</span>)}
    </div>
  </div>
)

export default function App() {
  const [phase,setPhase]=useState('intro')
  const [step,setStep]=useState(0)
  const [A,setA]=useState({})
  const top=useRef(null)
  const scrollTop=()=>top.current?.scrollIntoView({behavior:'smooth'})

  function next(){scrollTop();if(step<7)setStep(s=>s+1);else setPhase('story')}
  function reset(){setPhase('intro');setStep(0);setA({})}

  const steps=[
    <Step1 key={0} A={A} setA={setA} next={next}/>,
    <Step2 key={1} A={A} setA={setA} next={next}/>,
    <Step3 key={2} A={A} setA={setA} next={next}/>,
    <Step4 key={3} A={A} setA={setA} next={next}/>,
    <Step5 key={4} A={A} setA={setA} next={next}/>,
    <Step6 key={5} A={A} next={next}/>,
    <Step7 key={6} A={A} setA={setA} next={next}/>,
    <Step8 key={7} A={A} setA={setA} next={next}/>,
  ]

  if(phase==='intro') return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 24px',background:'var(--cream)'}}>
      <Ticker/>
      <div className="fade-up" style={{maxWidth:560,textAlign:'center',marginTop:40}}>
        <p style={{fontSize:10,letterSpacing:4,textTransform:'uppercase',color:'var(--gold-light)',marginBottom:20,fontFamily:'Lato,sans-serif'}}>A process by Sol</p>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(48px,9vw,80px)',fontWeight:300,color:'var(--teal)',lineHeight:1.1,marginBottom:28}}>The Easy<br/><em>Button</em></h1>
        <div style={{height:1,background:'linear-gradient(90deg,transparent,var(--gold-light),transparent)',margin:'28px 0'}}/>
        <p style={{fontSize:17,lineHeight:1.9,color:'var(--muted)',marginBottom:16,fontFamily:'Lato,sans-serif'}}>You've been here before.</p>
        <p style={{fontSize:17,lineHeight:1.9,color:'var(--muted)',marginBottom:16,fontFamily:'Lato,sans-serif'}}>The pattern that keeps showing up. The same story wearing different faces. The version of you that keeps getting in your own way — not because you're broken, but because somewhere in your subconscious, there's a story that hasn't been rewritten yet.</p>
        <p style={{fontSize:17,lineHeight:1.9,color:'var(--muted)',marginBottom:40,fontFamily:'Lato,sans-serif'}}>This process will take you through it — gently, deliberately, completely.</p>
        <p style={{fontSize:13,color:'var(--muted)',fontStyle:'italic',marginBottom:44,fontFamily:'Lato,sans-serif'}}>Find a quiet space. Give yourself 30–45 minutes. Move slowly.</p>
        <Btn onClick={()=>setPhase('steps')}>Begin →</Btn>
      </div>
    </div>
  )

  if(phase==='story') return (
    <div style={{minHeight:'100vh',background:'var(--cream)'}}>
      <div ref={top}/>
      <Story A={A} onNext={()=>setPhase('final')}/>
    </div>
  )

  if(phase==='final') return (
    <div className="fade-in" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 24px',background:'var(--teal)',textAlign:'center'}}>
      <span style={{fontSize:28,display:'block',marginBottom:32,color:'var(--gold-light)'}}>✦</span>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,5vw,52px)',fontWeight:300,color:'var(--cream)',fontStyle:'italic',lineHeight:1.4,maxWidth:600}}>"{A.declare||'I am ready.'}"</p>
      <div style={{marginTop:60}}>
        <button onClick={reset} style={{background:'transparent',color:'rgba(245,240,232,0.5)',border:'1px solid rgba(245,240,232,0.2)',padding:'10px 24px',fontFamily:'Lato,sans-serif',fontSize:11,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',borderRadius:2}}>Begin Again</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--warm-white)'}}>
      <div ref={top}/>
      <Ticker/>
      <div style={{position:'fixed',top:40,left:0,right:0,zIndex:100,background:'var(--warm-white)',borderBottom:'1px solid rgba(26,74,69,0.1)',padding:'12px 32px',display:'flex',alignItems:'center',gap:16}}>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:15,color:'var(--teal)',fontStyle:'italic',minWidth:130}}>The Easy Button</p>
        <div style={{flex:1,display:'flex',gap:5,alignItems:'center'}}>
          {META.map((_,i)=>(
            <div key={i} style={{borderRadius:4,transition:'all 0.4s',height:i===step?8:5,flex:i===step?1.6:1,background:i<step?'var(--teal)':i===step?'var(--gold-light)':'rgba(26,74,69,0.15)'}}/>
          ))}
        </div>
        <p style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)',minWidth:45,textAlign:'right',fontFamily:'Lato,sans-serif'}}>{step+1} / 8</p>
      </div>
      <div style={{maxWidth:720,margin:'0 auto',padding:'100px 24px 80px'}}>
        {steps[step]}
      </div>
    </div>
  )
}
