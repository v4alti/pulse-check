import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   AI PULSE CHECK™ — 10-Question Interactive Assessment
   Explore → Activate → Scale → Transform
   
   STORAGE: Uses window.storage API (persistent across sessions)
   All submissions saved with key: "submissions:{timestamp}"
   Admin panel accessible via clicking the header 5 times
   ═══════════════════════════════════════════════════════ */

// ── CONFIGURATION ──
const BRAND = {
  name: "AI Pulse Check™",
  tagline: "Discover your AI transformation readiness in 5 minutes",
  firm: "AltiPoint AI",                    // ← YOUR FIRM NAME
  firmUrl: "https://altipointai.com",       // ← YOUR DOMAIN
  ctaText: "Book a Discovery Call",
  ctaUrl: "https://calendly.com",           // ← YOUR CALENDLY LINK
};

const COLORS = {
  bg: "#e8edf4", bgCard: "#ffffff", bgCardAlt: "#f1f5f9",
  surface: "#e2e8f0", surfaceHover: "#cbd5e1",
  accent: "#8b5cf6", accentLight: "#a78bfa", accentGlow: "rgba(139,92,246,0.1)",
  green: "#10B981", greenGlow: "rgba(16,185,129,0.1)",
  amber: "#F59E0B", amberGlow: "rgba(245,158,11,0.1)",
  red: "#EF4444", blue: "#3B82F6", pink: "#EC4899", teal: "#14B8A6",
  text: "#0f172a", textMuted: "#64748b", textDim: "#94a3b8",
  border: "rgba(15,23,42,0.08)",
};

const STAGES = [
  { id: "explore", label: "Explore", color: "#3B82F6", range: [1, 2],
    desc: "Your organization is in the early stages of AI awareness. There's significant opportunity to build a strong foundation before competitors pull ahead.",
    icon: "🔭" },
  { id: "activate", label: "Activate", color: "#10B981", range: [2, 3],
    desc: "You've begun adopting AI in targeted areas. The priority now is connecting these efforts to strategy and scaling what works.",
    icon: "⚡" },
  { id: "scale", label: "Scale", color: "#F59E0B", range: [3, 4],
    desc: "AI is delivering measurable value across multiple functions. The challenge shifts to enterprise-wide orchestration and governance.",
    icon: "🚀" },
  { id: "transform", label: "Transform", color: "#7C3AED", range: [4, 5.1],
    desc: "AI is a core competitive advantage. Your organization is reshaping your industry through AI-powered products, services, and operating models.",
    icon: "✦" },
];

const DIMENSIONS = [
  { id: "maturity", label: "AI Capability Maturity", short: "Capability", color: "#7C3AED",
    source: "AI Maturity Diagnostic" },
  { id: "data", label: "Data & Infrastructure Readiness", short: "Data", color: "#10B981",
    source: "AI Radar 2.0" },
  { id: "strategy", label: "Strategy & Leadership", short: "Strategy", color: "#3B82F6",
    source: "CMM Pillar 1" },
];

// ── 10 QUESTIONS (5 cuttable ones removed) ──
const QUESTIONS = [
  // CAPABILITY (4 questions)
  { id: "m1", dim: "maturity",
    text: "How is AI currently being used in your organization?",
    options: [
      { score: 1, label: "Minimal or no AI usage beyond individual experimentation" },
      { score: 2, label: "Using off-the-shelf AI tools (ChatGPT, Copilot) for productivity" },
      { score: 3, label: "AI deployed in specific functions with our own data" },
      { score: 4, label: "Custom AI models embedded in core business processes" },
      { score: 5, label: "AI products/services generating revenue or transforming our industry" },
    ]},
  { id: "m2", dim: "maturity",
    text: "What level of AI customization has your organization achieved?",
    options: [
      { score: 1, label: "We use tools exactly as they come out of the box" },
      { score: 2, label: "We've configured AI tools with basic prompts and workflows" },
      { score: 3, label: "We fine-tune models with our proprietary data" },
      { score: 4, label: "We've built proprietary models on our own data infrastructure" },
      { score: 5, label: "We've productized our AI capabilities for external use" },
    ]},
  { id: "m3", dim: "maturity",
    text: "How would you describe the ROI focus of your AI initiatives?",
    options: [
      { score: 1, label: "No formal measurement of AI impact" },
      { score: 2, label: "Primarily focused on efficiency and cost savings" },
      { score: 3, label: "Driving business value through personalization and better decisions" },
      { score: 4, label: "Creating new revenue streams through AI-powered offerings" },
      { score: 5, label: "AI is a primary driver of competitive disruption and revenue" },
    ]},
  { id: "m5", dim: "maturity",
    text: "How mature is your AI infrastructure?",
    options: [
      { score: 1, label: "No unified data environment, minimal tooling" },
      { score: 2, label: "Basic data repository, some production environment setup" },
      { score: 3, label: "Established data platform with a working AI development pipeline" },
      { score: 4, label: "Advanced infrastructure with production-grade AI environment" },
      { score: 5, label: "Fully automated AI infrastructure with real-time data flows at scale" },
    ]},

  // DATA (3 questions)
  { id: "d1", dim: "data",
    text: "How would you rate the quality and accessibility of your customer data?",
    subtext: "Interaction data, channel data, behavioral insights",
    options: [
      { score: 1, label: "Fragmented across systems, mostly inaccessible for AI" },
      { score: 2, label: "Partially consolidated but significant gaps and quality issues" },
      { score: 3, label: "Reasonably organized with some integration across systems" },
      { score: 4, label: "Well-integrated customer data platform, mostly AI-ready" },
      { score: 5, label: "Unified, high-quality customer data powering real-time AI" },
    ]},
  { id: "d2", dim: "data",
    text: "How would you rate the quality and accessibility of your operational data?",
    subtext: "Supply chain, product, asset, and process data",
    options: [
      { score: 1, label: "Mostly manual processes, data trapped in spreadsheets/silos" },
      { score: 2, label: "Some digitization but limited integration and consistency" },
      { score: 3, label: "Core operational data is digital and reasonably integrated" },
      { score: 4, label: "Comprehensive operational data with strong integration" },
      { score: 5, label: "Real-time operational data flowing seamlessly across the enterprise" },
    ]},
  { id: "d3", dim: "data",
    text: "How well does your organization manage administrative and financial data for AI?",
    subtext: "HR, finance, IT systems data",
    options: [
      { score: 1, label: "Legacy systems, no integration, difficult to extract" },
      { score: 2, label: "Basic ERP/HRIS in place but limited analytical capability" },
      { score: 3, label: "Modern systems with some cross-functional data sharing" },
      { score: 4, label: "Integrated enterprise systems with strong data governance" },
      { score: 5, label: "Advanced analytics-ready administrative data ecosystem" },
    ]},

  // STRATEGY (3 questions)
  { id: "s1", dim: "strategy",
    text: "Does your organization have a clearly articulated AI vision?",
    options: [
      { score: 1, label: "No AI vision — AI is not on the leadership agenda" },
      { score: 2, label: "Informal interest — some leaders talk about AI but no formal vision" },
      { score: 3, label: "Documented AI vision but limited alignment across the organization" },
      { score: 4, label: "Clear AI vision with broad leadership alignment and commitment" },
      { score: 5, label: "AI vision deeply embedded in corporate strategy, widely understood" },
    ]},
  { id: "s2", dim: "strategy",
    text: "How committed is senior leadership to investing in AI?",
    options: [
      { score: 1, label: "No dedicated AI budget or executive sponsor" },
      { score: 2, label: "Small experimental budget, AI is one of many competing priorities" },
      { score: 3, label: "Dedicated AI budget with an executive sponsor identified" },
      { score: 4, label: "Significant investment with C-suite actively driving AI initiatives" },
      { score: 5, label: "AI is a top-3 strategic priority with board-level oversight" },
    ]},
  { id: "s3", dim: "strategy",
    text: "How well are your AI initiatives aligned with business objectives?",
    options: [
      { score: 1, label: "AI efforts are disconnected from business strategy" },
      { score: 2, label: "Some AI experiments loosely tied to business goals" },
      { score: 3, label: "Key AI initiatives explicitly linked to strategic priorities" },
      { score: 4, label: "AI roadmap fully integrated into the business planning process" },
      { score: 5, label: "AI is inseparable from business strategy — they're the same conversation" },
    ]},
];

const INDUSTRIES = [
  "Financial Services", "Healthcare & Life Sciences", "Manufacturing",
  "Technology / Software", "Retail & E-Commerce", "Energy & Utilities",
  "Transportation & Logistics", "Professional Services", "Government / Public Sector",
  "Education", "Other"
];
const SIZES = ["Under $10M", "$10M–$50M", "$50M–$100M", "$100M–$500M", "$500M–$1B", "Over $1B"];

// ── HELPERS ──
function getStage(avg) { return STAGES.find(s => avg >= s.range[0] && avg < s.range[1]) || STAGES[0]; }
function getDimScore(answers, dimId) {
  const qs = QUESTIONS.filter(q => q.dim === dimId);
  const answered = qs.filter(q => answers[q.id] !== undefined);
  if (!answered.length) return 0;
  return answered.reduce((sum, q) => sum + answers[q.id], 0) / answered.length;
}
function getObservations(dimScores, overall) {
  const obs = [];
  const sorted = [...dimScores].sort((a, b) => a.score - b.score);
  const weakest = sorted[0], strongest = sorted[sorted.length - 1];
  if (strongest.score - weakest.score > 1.2)
    obs.push({ icon: "⚠️", text: `Your biggest asymmetry: ${strongest.dim.short} (${strongest.score.toFixed(1)}) significantly outpaces ${weakest.dim.short} (${weakest.score.toFixed(1)}). This gap often means strong ideas get stuck at implementation.` });
  if (weakest.score < 2.5)
    obs.push({ icon: "🔴", text: `${weakest.dim.label} is your critical bottleneck at ${weakest.score.toFixed(1)}/5. Organizations that invest in AI without addressing this see 3x higher failure rates.` });
  if (strongest.score > 3.5)
    obs.push({ icon: "🟢", text: `${strongest.dim.label} is a genuine strength at ${strongest.score.toFixed(1)}/5. This gives you a foundation to build on.` });
  const stg = getStage(overall);
  if (overall < 2.5) obs.push({ icon: "💡", text: `At ${stg.label} stage, you have the advantage of building without legacy technical debt. Start with 2–3 high-impact use cases.` });
  else if (overall < 3.5) obs.push({ icon: "💡", text: `At ${stg.label} stage, you're at the critical inflection point. A structured roadmap determines whether you accelerate or stall.` });
  else obs.push({ icon: "💡", text: `At ${stg.label} stage, the ROI comes from connecting initiatives into a unified strategy, not launching more pilots.` });
  return obs.slice(0, 3);
}

// ── STORAGE HELPERS (Supabase) ──
const SUPABASE_URL = "https://rdckyqksixeyofrjpuai.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkY2t5cWtzaXhleW9mcmpwdWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzY3MTksImV4cCI6MjA4ODg1MjcxOX0._ihr7b_fXPaEWwJD4yFSwn-SrwsLpkN7sZ4zZFQUuGY";
async function saveSubmission(data) {
  try {
    const row = {
      name: data.name,
      email: data.email,
      company: data.company,
      industry: data.industry,
      company_size: data.companySize,
      challenge: data.challenge,
      capability_score: data.dimScores?.maturity || null,
      data_score: data.dimScores?.data || null,
      strategy_score: data.dimScores?.strategy || null,
      overall_score: data.overallScore,
      stage: data.stage,
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pulse_submissions`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row)
    });
    return res.ok;
  } catch (e) { console.error("Submission failed:", e); return false; }
}
async function loadAllSubmissions() { return []; }
async function exportSubmissionsCSV() { return null; }

// ── COMPONENTS ──
function ProgressBar({ current, total }) {
  return (
    <div style={{ width: "100%", height: 4, borderRadius: 2, background: COLORS.surface, overflow: "hidden" }}>
      <div style={{ width: `${(current/total)*100}%`, height: "100%", borderRadius: 2,
        background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentLight})`, transition: "width 0.4s ease" }} />
    </div>
  );
}

function RadarChart({ dimScores, size = 220 }) {
  const cx = size/2, cy = size/2, r = size*0.38, n = dimScores.length;
  const step = (Math.PI*2)/n, start = -Math.PI/2;
  const pt = (i, v) => { const a=start+i*step, d=(v/5)*r; return {x:cx+d*Math.cos(a), y:cy+d*Math.sin(a)}; };
  const dataP = dimScores.map((d,i)=>pt(i,d.score));
  const pathD = dataP.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ")+" Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1,2,3,4,5].map(l => { const pts=Array.from({length:n},(_,i)=>pt(i,l)); return <path key={l} d={pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ")+" Z"} fill="none" stroke={COLORS.border} strokeWidth={0.8} opacity={0.5}/>; })}
      {dimScores.map((d,i) => { const e=pt(i,5); return <line key={i} x1={cx} y1={cy} x2={e.x} y2={e.y} stroke={COLORS.border} strokeWidth={0.6} opacity={0.4}/>; })}
      <path d={pathD} fill={`${COLORS.accent}25`} stroke={COLORS.accent} strokeWidth={2.5}/>
      {dataP.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={dimScores[i].dim.color} stroke={COLORS.bg} strokeWidth={2}/>)}
      {dimScores.map((d,i) => { const lp=pt(i,5.8); return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill={d.dim.color} fontSize={10} fontWeight={700} fontFamily="DM Sans,sans-serif">{d.dim.short}</text>; })}
    </svg>
  );
}

// ── ADMIN PANEL ──
function AdminPanel({ onClose }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllSubmissions().then(s => { setSubs(s); setLoading(false); }); }, []);

  const handleExport = async () => {
    const csv = await exportSubmissionsCSV();
    if (!csv) return alert("No submissions to export");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pulse_check_submissions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ fontSize:16, fontWeight:800, color:COLORS.amber }}>📋 Admin: Submission Data</h3>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handleExport} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${COLORS.green}`, background:"transparent", color:COLORS.green, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            ↓ Export CSV
          </button>
          <button onClick={onClose} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${COLORS.border}`, background:"transparent", color:COLORS.textDim, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            ✕ Close
          </button>
        </div>
      </div>

      <div style={{ padding:14, borderRadius:99, background:COLORS.bgCard, border:`1px solid ${COLORS.border}`, marginBottom:12 }}>
        <div style={{ fontSize:28, fontWeight:800, color:COLORS.text }}>{subs.length}</div>
        <div style={{ fontSize:12, color:COLORS.textDim }}>Total submissions</div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:32, color:COLORS.textDim }}>Loading...</div>
      ) : subs.length === 0 ? (
        <div style={{ textAlign:"center", padding:32, color:COLORS.textDim }}>No submissions yet. Complete an assessment to see data here.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:400, overflowY:"auto" }}>
          {subs.map((s, i) => (
            <div key={i} style={{ padding:"12px 16px", borderRadius:10, background:COLORS.surface, border:`1px solid ${COLORS.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:700, color:COLORS.text }}>{s.name || "Anonymous"}</span>
                <span style={{ fontSize:10, color:COLORS.textDim, fontFamily:"'JetBrains Mono',monospace" }}>
                  {s.timestamp ? new Date(s.timestamp).toLocaleDateString() : "—"}
                </span>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:11, color:COLORS.textMuted }}>
                <span>{s.email}</span>
                <span>{s.company}</span>
                <span>{s.industry}</span>
                <span style={{ color: getStage(s.overallScore || 0).color, fontWeight:700 }}>
                  {s.stage} ({(s.overallScore||0).toFixed(1)})
                </span>
              </div>
              {s.challenge && <div style={{ fontSize:11, color:COLORS.textDim, marginTop:6, fontStyle:"italic" }}>"{s.challenge}"</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:16, padding:14, borderRadius:10, background:`${COLORS.amber}10`, border:`1px solid ${COLORS.amber}22`, fontSize:12, color:COLORS.textMuted, lineHeight:1.6 }}>
        <strong style={{ color:COLORS.amber }}>Data Storage Note:</strong> Submissions are stored locally in this artifact's persistent storage. To move to production with a cloud database, see the Employee Guide for the backend integration plan.
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function AIPulseCheck() {
  const [screen, setScreen] = useState("intro");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [challenge, setChallenge] = useState("");
  const [headerClicks, setHeaderClicks] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalQ = QUESTIONS.length;
  const transition = (next) => { setScreen(next); };

  const handleAnswer = (qId, score) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
    setTimeout(() => { if (currentQ < totalQ-1) setCurrentQ(currentQ+1); else transition("email"); }, 300);
  };

  const overall = Object.values(answers).length > 0
    ? Object.values(answers).reduce((a,b)=>a+b,0)/Object.values(answers).length : 0;
  const dimScores = DIMENSIONS.map(dim => ({ dim, score: getDimScore(answers, dim.id) }));
  const stage = getStage(overall);
  const observations = getObservations(dimScores, overall);
  const currentQuestion = QUESTIONS[currentQ];
  const currentDim = DIMENSIONS.find(d => d.id === currentQuestion?.dim);

  const handleSubmitEmail = async () => {
    if (!email || !name) return;
    // Save to persistent storage
    const submission = {
      timestamp: Date.now(),
      name, email, company, industry, companySize, challenge,
      answers: { ...answers },
      overallScore: overall,
      stage: stage.label,
      dimScores: {
        maturity: getDimScore(answers, "maturity"),
        data: getDimScore(answers, "data"),
        strategy: getDimScore(answers, "strategy"),
      },
    };
    const ok = await saveSubmission(submission);
    setSaved(ok);
    transition("results");
  };

  const handleHeaderClick = () => {
    const c = headerClicks + 1;
    setHeaderClicks(c);
    if (c >= 5) { setShowAdmin(true); setHeaderClicks(0); }
  };

  return (
    <div style={{ background:COLORS.bg, minHeight:"100vh", color:COLORS.text, fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; } input:focus,textarea:focus { outline:none; }
        body { margin:0; }
        .marble-bg {
          position: fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 40%),
            radial-gradient(ellipse at 40% 80%, rgba(203,213,225,0.3) 0%, transparent 45%),
            radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.5) 0%, transparent 35%),
            radial-gradient(ellipse at 10% 90%, rgba(191,203,219,0.25) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 80%, rgba(255,255,255,0.35) 0%, transparent 30%),
            linear-gradient(135deg, rgba(226,232,240,0.4) 0%, transparent 50%),
            linear-gradient(225deg, rgba(203,213,225,0.3) 0%, transparent 40%),
            linear-gradient(45deg, rgba(241,245,249,0.5) 10%, transparent 50%);
        }
        .marble-bg::before {
          content:''; position:absolute; top:0; left:0; width:100%; height:100%;
          background:
            radial-gradient(ellipse 800px 200px at 30% 30%, rgba(186,196,214,0.2) 0%, transparent 100%),
            radial-gradient(ellipse 600px 150px at 60% 70%, rgba(186,196,214,0.15) 0%, transparent 100%),
            radial-gradient(ellipse 400px 100px at 80% 40%, rgba(203,213,225,0.2) 0%, transparent 100%);
          filter: blur(30px);
        }
      `}</style>

      <div className="marble-bg" />

      {/* ── SHARED BRAND HEADER ── */}
      <header style={{ background:"rgba(232,237,244,0.75)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(15,23,42,0.06)", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100, position:"relative", zIndex:10 }}>
        <a href="https://altipointai.com" style={{ color:"#0f172a", textDecoration:"none", fontWeight:800, fontSize:"1.1rem", fontFamily:"'Inter',sans-serif" }}>
          Altipoint <span style={{ color:"#8b5cf6" }}>AI</span>
        </a>
        <a href="https://altipointai.com" style={{ color:"#64748b", textDecoration:"none", fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>
          ← Back to main site
        </a>
      </header>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 16px", position:"relative", zIndex:1 }}>
      <div style={{ width:"100%", maxWidth:560, paddingTop:28, paddingBottom:48 }}>

        {/* HEADER — 5 clicks opens admin */}
        <div onClick={handleHeaderClick} style={{ textAlign:"center", marginBottom:24, cursor:"default", userSelect:"none" }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:3, color:COLORS.accent, textTransform:"uppercase", marginBottom:4 }}>{BRAND.firm}</div>
          <div style={{ fontSize:19, fontWeight:800, background:"linear-gradient(to right,#3b82f6,#8b5cf6,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{BRAND.name}</div>
        </div>

        {/* ADMIN PANEL */}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

        {/* ═══ INTRO ═══ */}
        {!showAdmin && screen === "intro" && (
          <div style={{ animation:"fadeUp 0.5s ease", textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:18, margin:"0 auto 20px", background:COLORS.accentGlow, border:`2px solid ${COLORS.accent}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🔍</div>
            <h2 style={{ fontSize:22, fontWeight:800, lineHeight:1.3, marginBottom:10 }}>Where does your organization stand on AI readiness?</h2>
            <p style={{ fontSize:13, color:COLORS.textMuted, lineHeight:1.6, marginBottom:24, maxWidth:440, marginInline:"auto" }}>{BRAND.tagline}. Get your personalized score across three critical dimensions.</p>

            <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:28, flexWrap:"wrap" }}>
              {[{ icon:"🎯", l:"10 questions" },{ icon:"⏱️", l:"~5 minutes" },{ icon:"📊", l:"Instant results" }].map((f,i) => (
                <div key={i} style={{ padding:"8px 14px", borderRadius:8, background:COLORS.bgCard, border:`1px solid ${COLORS.border}`, fontSize:12, color:COLORS.textMuted }}>
                  <span style={{ marginRight:5 }}>{f.icon}</span>{f.l}
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:28, padding:14, borderRadius:99, background:COLORS.bgCard, border:`1px solid ${COLORS.border}` }}>
              {STAGES.map(s => (
                <div key={s.id} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:2 }}>{s.icon}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:s.color }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => transition("context")} style={{ padding:"13px 44px", borderRadius:99, border:"none", cursor:"pointer", background:`linear-gradient(135deg,#3b82f6,#8b5cf6)`, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", boxShadow:"0 4px 12px rgba(59,130,246,0.15)" }}>
              Start Assessment
            </button>
          </div>
        )}

        {/* ═══ CONTEXT ═══ */}
        {!showAdmin && screen === "context" && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            <div style={{ padding:18, borderRadius:16, background:COLORS.bgCard, border:`1px solid ${COLORS.border}`, marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:COLORS.accent, marginBottom:10 }}>ABOUT YOUR ORGANIZATION</div>
              <p style={{ fontSize:12, color:COLORS.textMuted, marginBottom:16, lineHeight:1.5 }}>This lets us benchmark your results against similar organizations.</p>

              <label style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted, marginBottom:4, display:"block" }}>Industry</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setIndustry(ind)} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${industry===ind?COLORS.accent:COLORS.border}`, background:industry===ind?`${COLORS.accent}22`:"transparent", color:industry===ind?COLORS.accentLight:COLORS.textMuted, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{ind}</button>
                ))}
              </div>

              <label style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted, marginBottom:4, display:"block" }}>Company Size</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
                {SIZES.map(sz => (
                  <button key={sz} onClick={() => setCompanySize(sz)} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${companySize===sz?COLORS.accent:COLORS.border}`, background:companySize===sz?`${COLORS.accent}22`:"transparent", color:companySize===sz?COLORS.accentLight:COLORS.textMuted, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{sz}</button>
                ))}
              </div>

              <label style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted, marginBottom:4, display:"block" }}>Biggest AI challenge right now? <span style={{ fontWeight:400, color:COLORS.textDim }}>(optional)</span></label>
              <textarea value={challenge} onChange={e=>setChallenge(e.target.value)} placeholder="E.g., 'We don't know where to start'..." rows={2} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${COLORS.border}`, background:COLORS.surface, color:COLORS.text, fontSize:12, fontFamily:"inherit", resize:"vertical", lineHeight:1.4 }} />
            </div>
            <button onClick={() => { if(industry&&companySize) transition("questions"); }} disabled={!industry||!companySize} style={{ width:"100%", padding:"13px 0", borderRadius:99, border:"none", cursor:industry&&companySize?"pointer":"not-allowed", background:industry&&companySize?`linear-gradient(135deg,#3b82f6,#8b5cf6)`:COLORS.surface, color:industry&&companySize?"#fff":COLORS.textDim, fontSize:13, fontWeight:700, fontFamily:"inherit", opacity:industry&&companySize?1:0.5 }}>
              {industry&&companySize ? "Begin Assessment →" : "Select industry and size to continue"}
            </button>
          </div>
        )}

        {/* ═══ QUESTIONS ═══ */}
        {!showAdmin && screen === "questions" && currentQuestion && (
          <div key={currentQ} style={{ animation:"fadeUp 0.35s ease" }}>
            <ProgressBar current={currentQ+1} total={totalQ} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, marginBottom:16 }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:currentDim.color, padding:"2px 8px", borderRadius:5, background:`${currentDim.color}18` }}>{currentDim.short.toUpperCase()}</span>
              <span style={{ fontSize:11, color:COLORS.textDim, fontFamily:"'JetBrains Mono',monospace" }}>{currentQ+1}/{totalQ}</span>
            </div>

            <div style={{ padding:"20px 18px", borderRadius:16, background:COLORS.bgCard, border:`1px solid ${COLORS.border}`, marginBottom:10 }}>
              <h3 style={{ fontSize:16, fontWeight:700, lineHeight:1.4, marginBottom:currentQuestion.subtext?6:16, color:COLORS.text }}>{currentQuestion.text}</h3>
              {currentQuestion.subtext && <p style={{ fontSize:11, color:COLORS.textDim, marginBottom:16, fontStyle:"italic" }}>{currentQuestion.subtext}</p>}

              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {currentQuestion.options.map((opt,i) => {
                  const sel = answers[currentQuestion.id] === opt.score;
                  return (
                    <button key={i} onClick={()=>handleAnswer(currentQuestion.id,opt.score)} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:9, cursor:"pointer", border:`1.5px solid ${sel?currentDim.color:COLORS.border}`, background:sel?`${currentDim.color}15`:"transparent", color:sel?COLORS.text:COLORS.textMuted, fontSize:12, fontWeight:sel?600:400, textAlign:"left", fontFamily:"inherit", transition:"all 0.15s", lineHeight:1.4, width:"100%" }}>
                      <span style={{ minWidth:24, height:24, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", background:sel?currentDim.color:COLORS.surface, color:sel?"#fff":COLORS.textDim, fontSize:10, fontWeight:800, flexShrink:0 }}>{opt.score}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {currentQ>0 && <button onClick={()=>setCurrentQ(currentQ-1)} style={{ display:"block", margin:"8px auto 0", padding:"6px 16px", borderRadius:7, border:`1px solid ${COLORS.border}`, background:"transparent", color:COLORS.textDim, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>}
          </div>
        )}

        {/* ═══ EMAIL GATE ═══ */}
        {!showAdmin && screen === "email" && (
          <div style={{ animation:"fadeUp 0.5s ease", textAlign:"center" }}>
            <div style={{ fontSize:42, marginBottom:12 }}>📊</div>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>Your results are ready</h2>
            <p style={{ fontSize:13, color:COLORS.textMuted, marginBottom:24, lineHeight:1.5 }}>Enter your details to see your AI readiness score and personalized observations.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20, textAlign:"left" }}>
              {[{l:"Work Email*",v:email,s:setEmail,p:"you@company.com",t:"email"},{l:"Full Name*",v:name,s:setName,p:"Your name",t:"text"},{l:"Company (optional)",v:company,s:setCompany,p:"Your company",t:"text"}].map((f,i) => (
                <div key={i}>
                  <label style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted, marginBottom:3, display:"block" }}>{f.l}</label>
                  <input type={f.t} value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p} style={{ width:"100%", padding:"11px 14px", borderRadius:9, border:`1px solid ${COLORS.border}`, background:COLORS.bgCard, color:COLORS.text, fontSize:13, fontFamily:"inherit" }} />
                </div>
              ))}
            </div>
            <button onClick={handleSubmitEmail} disabled={!email||!name} style={{ width:"100%", padding:"13px 0", borderRadius:99, border:"none", cursor:email&&name?"pointer":"not-allowed", background:email&&name?`linear-gradient(135deg,#3b82f6,#8b5cf6)`:COLORS.surface, color:email&&name?"#fff":COLORS.textDim, fontSize:14, fontWeight:700, fontFamily:"inherit", opacity:email&&name?1:0.5 }}>
              See My Results →
            </button>
            <p style={{ fontSize:10, color:COLORS.textDim, marginTop:10 }}>We'll send a copy. No spam, ever.</p>
          </div>
        )}

        {/* ═══ RESULTS ═══ */}
        {!showAdmin && screen === "results" && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            {/* Stage */}
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:44, marginBottom:6 }}>{stage.icon}</div>
              <div style={{ display:"inline-block", padding:"5px 18px", borderRadius:18, background:`${stage.color}22`, border:`2px solid ${stage.color}`, fontSize:11, fontWeight:800, letterSpacing:2.5, color:stage.color, textTransform:"uppercase", marginBottom:10 }}>{stage.label} Stage</div>
              <div style={{ fontSize:34, fontWeight:800, color:COLORS.text, fontFamily:"'JetBrains Mono',monospace" }}>{overall.toFixed(1)}<span style={{ fontSize:16, color:COLORS.textDim }}>/5.0</span></div>
              <div style={{ display:"flex", gap:5, justifyContent:"center", marginTop:14, marginBottom:10 }}>
                {STAGES.map((s,i) => (
                  <div key={s.id} style={{ flex:1, maxWidth:80, textAlign:"center" }}>
                    <div style={{ height:5, borderRadius:3, background:s.id===stage.id?s.color:STAGES.indexOf(stage)>i?`${s.color}66`:COLORS.surface }} />
                    <span style={{ fontSize:9, fontWeight:s.id===stage.id?800:600, color:s.id===stage.id?s.color:COLORS.textDim }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:13, color:COLORS.textMuted, lineHeight:1.6, maxWidth:440, marginInline:"auto", marginTop:8 }}>{stage.desc}</p>
            </div>

            {/* Radar */}
            <div style={{ padding:18, borderRadius:16, background:COLORS.bgCard, border:`1px solid ${COLORS.border}`, marginBottom:14, display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:COLORS.textDim, marginBottom:10 }}>DIMENSION BREAKDOWN</div>
              <RadarChart dimScores={dimScores} size={220} />
              <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap", justifyContent:"center" }}>
                {dimScores.map((d,i) => (
                  <div key={i} style={{ padding:"8px 12px", borderRadius:9, background:`${d.dim.color}10`, border:`1px solid ${d.dim.color}25`, textAlign:"center", minWidth:115 }}>
                    <div style={{ fontSize:20, fontWeight:800, color:d.dim.color, fontFamily:"'JetBrains Mono',monospace" }}>{d.score.toFixed(1)}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:d.dim.color, marginTop:1 }}>{d.dim.short}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div style={{ padding:18, borderRadius:16, background:COLORS.bgCard, border:`1px solid ${COLORS.border}`, marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:COLORS.textDim, marginBottom:12 }}>KEY OBSERVATIONS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {observations.map((obs,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"12px 14px", borderRadius:10, background:COLORS.surface }}>
                    <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{obs.icon}</span>
                    <p style={{ fontSize:12, color:COLORS.text, lineHeight:1.6, margin:0 }}>{obs.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Context */}
            <div style={{ padding:"10px 14px", borderRadius:10, background:COLORS.surface, fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:14, display:"flex", gap:14, flexWrap:"wrap" }}>
              <span><strong style={{ color:COLORS.textDim }}>Industry:</strong> {industry}</span>
              <span><strong style={{ color:COLORS.textDim }}>Size:</strong> {companySize}</span>
              {challenge && <span style={{ flexBasis:"100%" }}><strong style={{ color:COLORS.textDim }}>Challenge:</strong> {challenge}</span>}
            </div>

            {saved && <div style={{ padding:"8px 14px", borderRadius:8, background:`${COLORS.green}12`, border:`1px solid ${COLORS.green}33`, fontSize:11, color:COLORS.green, marginBottom:14, textAlign:"center" }}>✓ Your results have been saved</div>}

            {/* CTA */}
            <div style={{ padding:22, borderRadius:16, background:`linear-gradient(135deg,${COLORS.accentGlow},${COLORS.amberGlow})`, border:`1.5px solid ${COLORS.accent}33`, textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:COLORS.amber, marginBottom:6 }}>UNLOCK YOUR FULL REPORT</div>
              <h3 style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>Want the detailed breakdown with actionable recommendations?</h3>
              <p style={{ fontSize:12, color:COLORS.textMuted, lineHeight:1.6, marginBottom:16, maxWidth:400, marginInline:"auto" }}>60-minute consultation: pillar-by-pillar deep dive, prioritized AI use cases, and a 90-day action plan.</p>
              <button style={{ padding:"12px 36px", borderRadius:99, border:"none", cursor:"pointer", background:`linear-gradient(135deg,#3b82f6,#8b5cf6)`, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", boxShadow:"0 4px 12px rgba(59,130,246,0.15)" }}>
                {BRAND.ctaText} →
              </button>
            </div>

            {/* Consulting link */}
            <a href="https://altipointai.com" style={{ color:COLORS.textMuted, textDecoration:"none", fontSize:12, display:"block", textAlign:"center", marginTop:12, marginBottom:14 }}>
              Learn more about our consulting →
            </a>

            <button onClick={() => { setScreen("intro"); setAnswers({}); setCurrentQ(0); setEmail(""); setName(""); setCompany(""); setIndustry(""); setCompanySize(""); setChallenge(""); setSaved(false); }} style={{ display:"block", margin:"0 auto", padding:"7px 18px", borderRadius:7, border:`1px solid ${COLORS.border}`, background:"transparent", color:COLORS.textDim, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>↺ Start Over</button>
          </div>
        )}
      </div>
      </div>

      {/* ── SHARED BRAND FOOTER ── */}
      <footer style={{ background:"#e8edf4", borderTop:"1px solid rgba(15,23,42,0.08)", padding:"24px", textAlign:"center", color:"#64748b", fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>
        © 2026 AltiPoint AI · Privacy &amp; AI Consulting · <a href="https://altipointai.com" style={{ color:"#8b5cf6", textDecoration:"none" }}>altipointai.com</a>
      </footer>
    </div>
  );
}
