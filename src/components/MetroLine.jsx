import React, { useState, useEffect } from 'react';

// الداتا الثابتة الأصلية بالمللي كما وردت في التصميم
const D = [
  {n:'Ethics in Machine Learning',k:'Seminar',s:8.5,e:9.5,r:'Hall B',w:'Dr. Haddad',t:'Reading for next week: chapters 4–5.'},
  {n:'Advanced Algorithms',k:'Lecture',s:10,e:11.5,r:'Room 2.14',w:'Prof. Okafor',t:'Today: dynamic programming. Problem set 3 is due Monday.'},
  {n:'Data Visualisation Lab',k:'Lab',s:12,e:13,r:'Block C, Lab 3',w:'Dr. Lindqvist',t:'Bring a laptop. Pair check-in at 12:45.'},
  {n:'Human–Computer Interaction',k:'Lecture',s:14,e:15.5,r:'Hall A',w:'Prof. Ivanova',t:'Guest talk on accessible design. Quiz on Monday.'},
  {n:'Study group',k:'Library',s:16.5,e:17.5,r:'Library, Floor 3',w:'With Maya and Jonas',t:"Revise for Monday's HCI quiz."}
];

const R = 108;

export default function MetroLine() {
  // التوقيت المبدئي الأصلي (10:56)
  const [T, setT] = useState(10 * 60 + 56);
  const [follow, setFollow] = useState(true);
  const [sel, setSel] = useState(-1);
  const [rem, setRem] = useState({});
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (!follow) return;
    const id = setInterval(() => {
      setT(prev => prev + 1 / 60);
    }, 1000);
    return () => clearInterval(id);
  }, [follow]);

  // الدوال الرياضية الأصلية للقرص
  function ang(h) { return (-225 + (h - 8) / 10 * 270) * Math.PI / 180; }
  function pt(h, r) { const a = ang(h); return [160 + r * Math.cos(a), 160 + r * Math.sin(a)]; }
  function arc(a, b, r) {
    const p = pt(a, r), q = pt(b, r), L = (b - a) / 10 * 270 > 180 ? 1 : 0;
    return 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 ' + L + ' 1 ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
  }
  function fmt(h) {
    const m = Math.round(h * 60);
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2);
  }
  function durStr(m) {
    m = Math.max(0, Math.round(m));
    return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60 ? m % 60 + ' m' : '') : m + ' m';
  }
  function st(i) {
    const h = T / 60, d = D[i];
    return h >= d.e ? 'past' : h >= d.s ? 'live' : 'next';
  }
  function col(s) {
    return s === 'live' ? 'var(--live)' : s === 'past' ? 'var(--past)' : 'var(--blue)';
  }
  function cur() {
    for (let i = 0; i < D.length; i++) { if (st(i) === 'live') return i; }
    for (let i = 0; i < D.length; i++) { if (st(i) === 'next') return i; }
    return D.length - 1;
  }

  const h = T / 60;
  const s = sel < 0 ? cur() : sel;
  const d = D[s];
  const z = st(s);
  const left = d.e * 3600 - T * 60;
  const lab = z === 'live' ? 'Live now' : z === 'next' ? 'Starts in' : 'Finished';
  const big = z === 'live' ? (follow ? Math.floor(left / 60) + ':' + ('0' + Math.floor(left % 60)).slice(-2) : durStr(d.e * 60 - T)) : z === 'next' ? durStr(d.s * 60 - T) : 'Done';
  const pr = z === 'live' ? (T - d.s * 60) / ((d.e - d.s) * 60) : z === 'past' ? 1 : 0;
  const doneCount = D.filter((x, i) => st(i) === 'past').length;
  const anyLive = D.some((x, i) => st(i) === 'live');

  // الـ CSS الأصلي بالمللي مع استدعاء الخط
  const rawCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap');
    
    .daydial-body {
      --bg:#E4E8F8;--page:#CBD1EE;--card:#F7F8FF;--ink:#14172E;--dim:#6B7094;--track:#D3D8EE;--blue:#3D3BFF;--live:#FF6B35;--past:#A7ADCF;--line:#14172E14;--f:'Bricolage Grotesque',system-ui,sans-serif;
      background: var(--page);
      font-family: var(--f);
      color: var(--ink);
      display: flex;
      justify-content: center;
      min-height: 100vh;
      width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      direction: ltr;
      text-align: left;
    }

    .daydial-body[data-theme="dark"] {
      --bg:#0E1022;--page:#05060E;--card:#171A35;--ink:#F1F2FF;--dim:#8E93BA;--track:#222647;--blue:#7C7BFF;--live:#FF8A57;--past:#4A4F7A;--line:#ffffff14
    }
    
    .daydial-body * { box-sizing:border-box; margin:0 }
    
    .app {width:100%;max-width:400px;min-height:100vh;background:var(--bg);padding:20px 18px 40px;position:relative;overflow:hidden}
    @media(min-width:500px){.app{margin:24px 0;min-height:0;border-radius:46px;box-shadow:0 50px 100px -30px #14172e66,0 0 0 8px var(--card),0 0 0 9px var(--line)}}
    .hd {display:flex;justify-content:space-between;align-items:center}
    .hd h1 {font-size:15px;font-weight:600;color:var(--dim)}
    .hd h1 b {color:var(--ink);font-weight:800}
    .pill {font:600 12px var(--f);padding:7px 12px;border-radius:99px;background:var(--card);color:var(--ink);border:0;box-shadow:0 1px 0 var(--line);cursor:pointer}
    .dial {position:relative;margin:10px -4px 0;aspect-ratio:1/1}
    .dial svg {width:100%;height:100%;overflow:visible}
    .seg {cursor:pointer;transition:stroke-width .3s cubic-bezier(.3,1.6,.5,1)}
    .hr {font:600 10.5px var(--f);fill:var(--dim);text-anchor:middle;dominant-baseline:middle}
    .mk {filter:drop-shadow(0 0 8px var(--live))}
    .pulse {animation:pl 2s ease-out infinite;transform-box:fill-box;transform-origin:center}
    @keyframes pl {from{transform:scale(1);opacity:.7}to{transform:scale(2.6);opacity:0}}
    .core {position:absolute;inset:23% 21%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}
    .st {font-size:12px;font-weight:600;color:var(--dim);display:flex;align-items:center;gap:6px}
    .st i {width:7px;height:7px;border-radius:50%;background:var(--c,var(--dim))}
    .live .st {color:var(--live)}.live .st i {animation:bk 1.2s infinite}
    @keyframes bk {50%{opacity:.2}}
    .big {font-size:46px;font-weight:800;letter-spacing:-.04em;font-variation-settings:'wdth' 100;line-height:1;margin:6px 0 4px;font-variant-numeric:tabular-nums}
    .nm {font-size:14px;font-weight:600;line-height:1.2;max-width:150px}
    .sc {margin:-6px 4px 6px}
    .sc .row {display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--dim);margin-bottom:6px}
    .sc output {font-weight:800;color:var(--ink);font-size:15px;font-variant-numeric:tabular-nums}
    input[type=range] {-webkit-appearance:none;appearance:none;width:100%;height:30px;background:transparent;cursor:grab}
    input[type=range]::-webkit-slider-runnable-track {height:6px;border-radius:6px;background:var(--track)}
    input[type=range]::-moz-range-track {height:6px;border-radius:6px;background:var(--track)}
    input[type=range]::-webkit-slider-thumb {-webkit-appearance:none;width:28px;height:28px;margin-top:-11px;border-radius:50%;background:var(--ink);border:5px solid var(--card);box-shadow:0 4px 12px #14172e55}
    input[type=range]::-moz-range-thumb {width:18px;height:18px;border-radius:50%;background:var(--ink);border:5px solid var(--card)}
    input:focus-visible,button:focus-visible,.it:focus-visible {outline:2px solid var(--blue);outline-offset:3px}
    .dt {background:var(--card);border-radius:28px;padding:18px;margin:12px 0;box-shadow:0 1px 0 var(--line),0 18px 30px -22px #14172e66}
    .dt .tp {display:flex;justify-content:space-between;font-size:12px;color:var(--dim);font-weight:600}
    .dt h2 {font-size:24px;font-weight:800;letter-spacing:-.03em;margin:6px 0 2px}
    .dt p {font-size:13px;color:var(--dim)}
    .bar {height:6px;border-radius:6px;background:var(--track);margin:14px 0;overflow:hidden}
    .bar span {display:block;height:100%;border-radius:6px;background:var(--c);transition:width .4s}
    .ac {display:flex;gap:8px}
    .ac button {flex:1;padding:12px;border-radius:16px;border:0;font:700 13px var(--f);background:var(--track);color:var(--ink);cursor:pointer;transition:transform .15s}
    .ac button:active {transform:scale(.95)}
    .ac button.p {background:var(--ink);color:var(--bg)}
    .ls {display:flex;flex-direction:column;gap:6px;margin-top:6px}
    .it {display:grid;grid-template-columns:14px 1fr auto;gap:12px;align-items:center;padding:12px 14px;border-radius:18px;cursor:pointer;transition:background .2s}
    .it:hover,.it.sel {background:var(--card)}
    .it i {width:10px;height:10px;border-radius:50%;background:var(--c)}
    .it b {font-size:14px;font-weight:600;display:block}
    .it small {font-size:12px;color:var(--dim)}
    .it em {font-style:normal;font-size:12px;font-weight:700;color:var(--c)}
    .it.past b {color:var(--dim);font-weight:400}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  `;

  return (
    <div className="daydial-body" data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: rawCSS }} />
      <main className="app">
        <div className="hd">
          <h1>Thu 8 Oct · <b>{doneCount} of {D.length}</b> done</h1>
          <button className="pill" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Theme</button>
        </div>
        
        <div className="dial" onDoubleClick={() => { setT(10 * 60 + 56); setFollow(true); setSel(-1); }}>
          <svg viewBox="0 0 320 320" role="img" aria-label="Day dial showing today's sessions from 8:00 to 18:00">
            <path fill="none" stroke="var(--track)" strokeWidth="26" strokeLinecap="round" d={arc(8, 18, R)} />
            <g>
              {[8, 10, 12, 14, 16, 18].map(hr => {
                const p = pt(hr, R + 32);
                return <text key={hr} className="hr" x={p[0]} y={p[1]}>{hr}</text>;
              })}
            </g>
            <g>
              {D.map((dd, i) => {
                const zz = st(i);
                const c = col(zz);
                const on = i === s;
                const w = on ? 34 : 26;
                
                if (zz === 'live') {
                  return (
                    <g key={i}>
                      <path className="seg" d={arc(dd.s, dd.e, R)} fill="none" stroke={c} strokeOpacity=".28" strokeWidth={w} onClick={() => setSel(i)} />
                      <path className="seg" d={arc(dd.s, h, R)} fill="none" stroke={c} strokeWidth={w} onClick={() => setSel(i)} />
                    </g>
                  );
                }
                return <path key={i} className="seg" d={arc(dd.s, dd.e, R)} fill="none" stroke={c} strokeWidth={w} onClick={() => setSel(i)} />;
              })}
            </g>
            <g>
              {(() => {
                const m = pt(h, R);
                const c2 = anyLive ? 'var(--live)' : 'var(--ink)';
                return (
                  <>
                    <circle className="pulse" cx={m[0]} cy={m[1]} r="9" fill={c2} />
                    <circle className="mk" cx={m[0]} cy={m[1]} r="11" fill="var(--card)" stroke={c2} strokeWidth="5" />
                  </>
                );
              })()}
            </g>
          </svg>
          <div className={"core " + z}>
            <div className="st" style={{ "--c": col(z) }}><i></i>{lab}</div>
            <div className="big">{big}</div>
            <div className="nm">{d.n}</div>
          </div>
        </div>

        <div className="sc">
          <div className="row">
            <span>Drag to peek at your day</span>
            <output>{fmt(h)}</output>
          </div>
          <input 
            type="range" 
            min="480" 
            max="1080" 
            step="1" 
            value={Math.round(T)} 
            onChange={(e) => {
              setT(Number(e.target.value));
              setFollow(false);
              setSel(-1);
            }} 
          />
        </div>

        <section className="dt" style={{ "--c": col(z) }}>
          <div className="tp">
            <span>{fmt(d.s)} – {fmt(d.e)}</span>
            <span>{d.k}</span>
          </div>
          <h2>{d.n}</h2>
          <p>{d.r} · {d.w}</p>
          <div className="bar"><span style={{ width: (pr * 100).toFixed(0) + '%' }}></span></div>
          <p style={{ marginBottom: 14, color: 'var(--ink)' }}>{d.t}</p>
          <div className="ac">
            <button className="p">Directions</button>
            <button onClick={() => setRem(prev => ({...prev, [s]: !prev[s]}))}>
              {rem[s] ? 'Reminder on' : 'Remind me'}
            </button>
          </div>
        </section>

        <div className="ls">
          {D.map((x, i) => {
            const zz = st(i);
            const rTxt = zz === 'live' ? 'Live' : zz === 'past' ? 'Done' : 'In ' + durStr(x.s * 60 - T);
            return (
              <div key={i} className={"it " + zz + (i === s ? ' sel' : '')} tabIndex="0" style={{ "--c": col(zz) }} onClick={() => setSel(i)}>
                <i></i>
                <div>
                  <b>{x.n}</b>
                  <small>{fmt(x.s)} · {x.r}</small>
                </div>
                <em>{rTxt}</em>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}