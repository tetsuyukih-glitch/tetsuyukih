import { useState, useEffect, useCallback } from "react";

const ADMIN_PASSWORD       = "admin1234";
const STORAGE_KEY_MASTER   = "gp_master_v2";
const STORAGE_KEY_PASS     = "gp_admin_pass_v1";
const STORAGE_KEY_SETTINGS = "gp_settings_v1";
const TAX_RATE = 0.10;

const DEFAULT_MASTER = [
  { id:1, name:"MG以上",  sellM:1510000, costM:800000 },
  { id:2, name:"S6",      sellM:1284000, costM:680000 },
  { id:3, name:"S5",      sellM:1133000, costM:600000 },
  { id:4, name:"S4",      sellM: 944000, costM:500000 },
  { id:5, name:"S3",      sellM: 830000, costM:440000 },
  { id:6, name:"S2",      sellM: 755000, costM:400000 },
  { id:7, name:"S0・S1",  sellM: 679000, costM:360000 },
].map(m => ({ ...m, sell:Math.round(m.sellM/20), cost:Math.round(m.costM/20) }));

const DEFAULT_SETTINGS = { ptFeeRate:10 };

let _uid = 300;
const uid = () => ++_uid;

const yen   = n => "¥" + Math.round(n).toLocaleString("ja-JP");
const num   = n => Math.round(n).toLocaleString("ja-JP");
const gpCol = r => r >= 47 ? "#34c759" : "#ff3b30";
const gpBg  = r => r >= 47 ? "#e8f8ed" : "#ffeeed";

const migrate = m => ({
  ...m,
  sellM: m.sellM ?? m.sell * 20,
  costM: m.costM ?? m.cost * 20,
  sell:  m.sell  ?? Math.round((m.sellM ?? 0) / 20),
  cost:  m.cost  ?? Math.round((m.costM ?? 0) / 20),
});

const loadMaster = () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY_MASTER);
    if (!r) return DEFAULT_MASTER;
    return JSON.parse(r).map(migrate);
  } catch { return DEFAULT_MASTER; }
};
const saveMasterLS   = d => localStorage.setItem(STORAGE_KEY_MASTER, JSON.stringify(d));
const loadSettings   = () => { try { const r=localStorage.getItem(STORAGE_KEY_SETTINGS); return r?{...DEFAULT_SETTINGS,...JSON.parse(r)}:DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; } };
const saveSettingsLS = d => localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(d));
const loadPass = () => localStorage.getItem(STORAGE_KEY_PASS) || ADMIN_PASSWORD;
const savePass = p => localStorage.setItem(STORAGE_KEY_PASS, p);

// ─── App ────────────────────────────────────────────────
export default function App() {
  const [page,     setPage]     = useState("calc");
  const [master,   setMaster]   = useState(loadMaster);
  const [settings, setSettings] = useState(loadSettings);
  const applyMaster   = useCallback(m => { setMaster(m);   saveMasterLS(m);   }, []);
  const applySettings = useCallback(s => { setSettings(s); saveSettingsLS(s); }, []);

  return (
    <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif", background:"#f2f2f7", minHeight:"100vh", paddingBottom:88 }}>
      <style>{`
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input,select,button{font-family:inherit;-webkit-tap-highlight-color:transparent}
        .ac{background:#fff;border-radius:16px;overflow:hidden;margin-bottom:20px}
        .ac-row{display:flex;align-items:center;padding:13px 16px;border-bottom:.5px solid rgba(60,60,67,.12);gap:12px}
        .ac-row:last-child{border-bottom:none}
        .row-input{background:#fff;border-left:3px solid #007aff}
        .row-auto{background:#f9f9fb;border-left:3px solid transparent}
        .sec-hdr{font-size:13px;font-weight:400;color:#6e6e73;padding:0 16px;margin:28px 0 8px;letter-spacing:-.01em}
        .inp{height:44px;background:transparent;border:none;outline:none;font-size:17px;color:#1c1c1e;width:100%;letter-spacing:-.02em}
        .inp::placeholder{color:#c7c7cc}
        .inp-right{text-align:right}
        .lbl-inp{font-size:14px;color:#007aff;font-weight:500;white-space:nowrap;flex-shrink:0}
        .lbl-auto-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .lbl-auto{font-size:14px;color:#8e8e93;font-weight:400;white-space:nowrap}
        .auto-badge{font-size:10px;font-weight:600;color:#8e8e93;background:#e5e5ea;border-radius:5px;padding:1px 6px;letter-spacing:.02em}
        .auto-val{font-size:15px;font-weight:400;text-align:right;flex:1}
        .sell-val{color:#34c759}
        .cost-val{color:#ff9500}
        .btn-blue{height:50px;background:#007aff;color:#fff;border:none;border-radius:14px;font-size:17px;font-weight:600;cursor:pointer;width:100%;letter-spacing:-.02em}
        .btn-plain{height:50px;background:transparent;color:#007aff;border:none;font-size:17px;font-weight:400;cursor:pointer;width:100%;letter-spacing:-.02em}
        .btn-dest{height:50px;background:transparent;color:#ff3b30;border:none;font-size:17px;font-weight:400;cursor:pointer;width:100%;letter-spacing:-.02em}
        .del-circle{width:22px;height:22px;background:#ff3b30;border-radius:50%;border:none;color:#fff;font-size:14px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:0;line-height:1}
        .add-row{display:flex;align-items:center;padding:13px 16px;color:#007aff;font-size:17px;cursor:pointer;background:#fff;border:none;width:100%;letter-spacing:-.02em;gap:8px}
        .chip{font-size:11px;font-weight:600;border-radius:6px;padding:2px 7px;display:inline-block;letter-spacing:.01em}
        .gp-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:600;letter-spacing:-.01em}
        .tab-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:.5px solid rgba(60,60,67,.2);display:flex;z-index:200;padding-bottom:env(safe-area-inset-bottom,0)}
        .tab-btn{flex:1;height:56px;border:none;background:transparent;color:#8e8e93;font-size:10px;font-weight:500;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;letter-spacing:.01em}
        .tab-btn.active{color:#007aff}
        .tab-icon{font-size:22px;line-height:1}
        .res-row{display:grid;grid-template-columns:1fr 72px 96px 64px;padding:11px 16px;border-bottom:.5px solid rgba(60,60,67,.12);align-items:center;gap:4px}
        .res-row:last-child{border-bottom:none}
        .res-hdr{font-size:11px;font-weight:600;color:#8e8e93;letter-spacing:.03em}
        .inp-label{font-size:15px;color:#1c1c1e;font-weight:400;white-space:nowrap;min-width:0}
      `}</style>

      <header style={{ background:"rgba(255,255,255,.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:".5px solid rgba(60,60,67,.2)", padding:"12px 20px 10px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:640, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:20, fontWeight:700, color:"#1c1c1e", letterSpacing:"-.03em" }}>粗利計算</div>
          <div style={{ fontSize:13, color:"#8e8e93", letterSpacing:"-.01em" }}>Gross Profit</div>
        </div>
      </header>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"8px 0 0" }}>
        {page === "calc"
          ? <CalcPage master={master} settings={settings} />
          : <AdminPage master={master} settings={settings} applyMaster={applyMaster} applySettings={applySettings} />}
      </div>

      <nav className="tab-bar">
        <button className={`tab-btn${page==="calc"?" active":""}`} onClick={() => setPage("calc")}>
          <span className="tab-icon">📊</span>工数計算
        </button>
        <button className={`tab-btn${page==="admin"?" active":""}`} onClick={() => setPage("admin")}>
          <span className="tab-icon">🔒</span>管理画面
        </button>
      </nav>
    </div>
  );
}

// ─── 計算ページ ─────────────────────────────────────────
function CalcPage({ master, settings }) {
  const [projName,   setProjName]   = useState("");
  const [clientName, setClientName] = useState("");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [discount,   setDiscount]   = useState("");
  const [gpAdjust,   setGpAdjust]   = useState("");
  const [purchases,  setPurchases]  = useState([{ id:uid(), note:"", cost:0, gpr:0 }]);
  const [bps,        setBps]        = useState([{ id:uid(), name:"", costPerDay:0, gpr:0, days:0 }]);
  const [engs,       setEngs]       = useState([
    { id:uid(), rankName:"", sell:0, cost:0, days:0, note:"" },
    { id:uid(), rankName:"", sell:0, cost:0, days:0, note:"" },
  ]);
  const [showResult, setShowResult] = useState(false);
  const [engOpen,    setEngOpen]    = useState({});
  const [bpOpen,     setBpOpen]     = useState({});
  const [purOpen,    setPurOpen]    = useState({});
  const [ptFeeOn,    setPtFeeOn]    = useState(true);

  const onRankChange = (i,name) => { const m=master.find(x=>x.name===name); const next=[...engs]; next[i]={...next[i],rankName:name,sell:m?.sell??0,cost:m?.cost??0}; setEngs(next); setShowResult(false); };
  const updEng = (i,key,val) => { const next=[...engs]; next[i]={...next[i],[key]:key==="note"?val:Number(val)}; setEngs(next); setShowResult(false); };
  const delEng = (i) => { setEngs(engs.filter((_,idx)=>idx!==i)); setShowResult(false); };

  const updPurchase = (i,key,val) => { const next=[...purchases]; next[i]={...next[i],[key]:key==="note"?val:Number(val)}; setPurchases(next); setShowResult(false); };
  const delPurchase = (i) => { setPurchases(purchases.filter((_,idx)=>idx!==i)); setShowResult(false); };

  const updBp = (i,key,val) => { const next=[...bps]; next[i]={...next[i],[key]:key==="name"?val:Number(val)}; setBps(next); setShowResult(false); };
  const delBp = (i) => { setBps(bps.filter((_,idx)=>idx!==i)); setShowResult(false); };

  // 計算
  const rows     = engs.map(e => { const s=e.sell*e.days,c=e.cost*e.days,gp=s-c,gpr=s>0?(gp/s)*100:0; return {...e,s,c,gp,gpr}; });
  const tSell    = rows.reduce((a,r)=>a+r.s,0);
  const tCost    = rows.reduce((a,r)=>a+r.c,0);
  const tDaysEng = rows.reduce((a,r)=>a+r.days,0);
  const purRows  = purchases.map(p => { const rate=Math.min(Math.max(Number(p.gpr),0),100),gp=Math.round(p.cost*rate/100),sell=p.cost+gp; return {...p,sell,gp,gprCalc:rate}; });
  const purSell  = purRows.reduce((a,r)=>a+r.sell,0);
  const purCost  = purRows.reduce((a,r)=>a+r.cost,0);
  const bpRows   = bps.map(b => { const rate=Math.min(Math.max(Number(b.gpr),0),100),gpPerDay=Math.round(b.costPerDay*rate/100),sellPerDay=b.costPerDay+gpPerDay,totalCostBp=b.costPerDay*b.days,totalSellBp=sellPerDay*b.days,totalGpBp=totalSellBp-totalCostBp; return {...b,sellPerDay,totalCostBp,totalSellBp,totalGpBp}; });
  const bpSell   = bpRows.reduce((a,r)=>a+r.totalSellBp,0);
  const bpCost   = bpRows.reduce((a,r)=>a+r.totalCostBp,0);
  const tDays    = tDaysEng + bpRows.reduce((a,r)=>a+r.days,0);
  const ptFee       = ptFeeOn ? Math.round((tSell+bpSell)*(settings.ptFeeRate/100)) : 0;
  const discountAmt = discount===""?0:Math.abs(Number(discount));
  const gpAdjustAmt = gpAdjust===""?0:Math.abs(Number(gpAdjust));
  const netSell     = tSell+ptFee+bpSell+purSell-discountAmt;
  const totalCost   = tCost+bpCost+purCost;
  const grossProfit = netSell-totalCost+gpAdjustAmt;
  const gpr         = netSell>0?(grossProfit/netSell)*100:0;
  const taxIncluded = Math.round(netSell*(1+TAX_RATE));

  const clear = () => {
    setProjName(""); setClientName(""); setDateFrom(""); setDateTo(""); setDiscount(""); setGpAdjust("");
    setEngs([{id:uid(),rankName:"",sell:0,cost:0,days:0,note:""},{id:uid(),rankName:"",sell:0,cost:0,days:0,note:""}]);
    setPurchases([{id:uid(),note:"",cost:0,gpr:0}]);
    setBps([{id:uid(),name:"",costPerDay:0,gpr:0,days:0}]);
    setEngOpen({}); setBpOpen({}); setPurOpen({}); setPtFeeOn(true);
    setShowResult(false);
  };

  const [showPdf, setShowPdf] = useState(false);

  const buildPdfData = () => {
    const engRowsHtml = rows.filter(r=>r.days>0||r.rankName).map(r=>`<tr><td>${r.rankName||"—"}</td><td style="text-align:right">${num(r.days)}</td><td style="text-align:right">${yen(r.s)}</td><td style="text-align:right">${yen(r.gp)}</td><td style="text-align:right">${r.gpr.toFixed(1)}%</td></tr>`).join("");
    const bpRowsHtml  = bpRows.filter(b=>b.days>0||b.name).map(b=>`<tr style="background:#fafcff"><td><span style="font-size:10px;background:#e5f3ff;color:#007aff;border-radius:4px;padding:1px 5px;margin-right:4px">BP</span>${b.name||"—"}</td><td style="text-align:right">${num(b.days)}</td><td style="text-align:right">${yen(b.totalSellBp)}</td><td style="text-align:right">${yen(b.totalGpBp)}</td><td style="text-align:right">${b.gpr.toFixed(1)}%</td></tr>`).join("");
    const purRowsHtml = purRows.filter(p=>p.cost>0||p.note).map(p=>`<tr style="background:#fffdf5"><td><span style="font-size:10px;background:#fff8e0;color:#c45500;border-radius:4px;padding:1px 5px;margin-right:4px">仕入</span>${p.note||"—"}</td><td style="text-align:right">—</td><td style="text-align:right">${yen(p.sell)}</td><td style="text-align:right">${yen(p.gp)}</td><td style="text-align:right">${p.gprCalc.toFixed(1)}%</td></tr>`).join("");
    const today = new Date().toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric"});
    return { engRowsHtml, bpRowsHtml, purRowsHtml, today };
  };

  const printPDF = () => { setShowPdf(true); };

  const PlusCircle = () => (
    <span style={{ width:22, height:22, background:"#34c759", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:300, flexShrink:0 }}>+</span>
  );

  return (
    <div style={{ padding:"0 0 8px" }}>

      {/* 案件情報 */}
      <div className="sec-hdr">案件情報</div>
      <div className="ac">
        <div className="ac-row row-input">
          <span className="lbl-inp" style={{ minWidth:90 }}>案件名</span>
          <input className="inp inp-right" value={projName} onChange={e=>setProjName(e.target.value)} placeholder="〇〇システム開発" />
        </div>
        <div className="ac-row row-input">
          <span className="lbl-inp" style={{ minWidth:90 }}>顧客名</span>
          <input className="inp inp-right" value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="株式会社〇〇" />
        </div>
        <div className="ac-row row-input">
          <span className="lbl-inp" style={{ minWidth:120 }}>開始年月（予定）</span>
          <input className="inp inp-right" type="text" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} placeholder="例：2025-04" />
        </div>
        <div className="ac-row row-input">
          <span className="lbl-inp" style={{ minWidth:120 }}>終了年月（予定）</span>
          <input className="inp inp-right" type="text" value={dateTo} onChange={e=>setDateTo(e.target.value)} placeholder="例：2025-09" />
        </div>
      </div>

      {/* エンジニア */}
      <div className="sec-hdr">エンジニア工数入力</div>
      {engs.map((e,i) => {
        const open = !!engOpen[e.id];
        const sellTotal=e.sell*e.days, costTotal=e.cost*e.days;
        return (
          <div key={e.id} className="ac">
            <div className="ac-row" style={{ background:"#f9f9fb", cursor:"pointer" }} onClick={()=>setEngOpen(p=>({...p,[e.id]:!open}))}>
              <button className="del-circle" onClick={ev=>{ev.stopPropagation();delEng(i);}}>−</button>
              <span style={{ fontSize:15, fontWeight:600, color:"#1c1c1e", flex:1 }}>
                {e.rankName||`エンジニア ${i+1}`}
                {e.days>0 && <span style={{ fontSize:12, color:"#8e8e93", marginLeft:8, fontWeight:400 }}>{e.days}人日</span>}
              </span>
              <span style={{ color:"#c7c7cc", fontSize:18, transform:open?"rotate(90deg)":"rotate(0deg)", transition:"transform .2s" }}>›</span>
            </div>
            {open && <>
              <div className="ac-row row-input">
                <span className="lbl-inp">職種・ランク</span>
                <select className="inp inp-right" value={e.rankName} onChange={ev=>onRankChange(i,ev.target.value)}
                  style={{ color:e.rankName?"#1c1c1e":"#c7c7cc", background:"transparent", border:"none", outline:"none", fontSize:17, appearance:"none", WebkitAppearance:"none", flex:1, textAlign:"right" }}>
                  <option value="">選択</option>
                  {master.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <span style={{ color:"#c7c7cc", fontSize:14, marginLeft:4 }}>›</span>
              </div>
              <div className="ac-row row-input">
                <span className="lbl-inp">工数（人日）</span>
                <input className="inp inp-right" type="number" value={e.days||""} onChange={ev=>updEng(i,"days",ev.target.value)} placeholder="0" />
              </div>
              <div className="ac-row row-auto">
                <div className="lbl-auto-wrap"><span className="lbl-auto">売上単価/日</span><span className="auto-badge">自動</span></div>
                <span className="auto-val sell-val">{num(e.sell)}</span>
              </div>
              <div className="ac-row row-auto">
                <div className="lbl-auto-wrap"><span className="lbl-auto">原価単価/日</span><span className="auto-badge">自動</span></div>
                <span className="auto-val cost-val">{num(e.cost)}</span>
              </div>
              <div className="ac-row row-auto">
                <div className="lbl-auto-wrap"><span className="lbl-auto">売上小計</span><span className="auto-badge">自動</span></div>
                <span className="auto-val sell-val" style={{ fontWeight:500 }}>{yen(sellTotal)}</span>
              </div>
              <div className="ac-row row-auto">
                <div className="lbl-auto-wrap"><span className="lbl-auto">原価小計</span><span className="auto-badge">自動</span></div>
                <span className="auto-val cost-val" style={{ fontWeight:500 }}>{yen(costTotal)}</span>
              </div>
              <div className="ac-row row-input">
                <span className="lbl-inp">備考</span>
                <input className="inp inp-right" type="text" value={e.note} onChange={ev=>updEng(i,"note",ev.target.value)} placeholder="—" />
              </div>
            </>}
          </div>
        );
      })}
      <div className="ac">
        <button className="add-row" onClick={()=>{ const id=uid(); setEngs(p=>[...p,{id,rankName:"",sell:0,cost:0,days:0,note:""}]); setEngOpen(p=>({...p,[id]:true})); setShowResult(false); }}>
          <PlusCircle /> エンジニアを追加
        </button>
      </div>

      {/* BP利用 */}
      <div className="sec-hdr">BP利用</div>
      {bpRows.map((b,i) => {
        const open = !!bpOpen[b.id];
        return (
          <div key={b.id} className="ac">
            <div className="ac-row" style={{ background:"#f9f9fb", cursor:"pointer" }} onClick={()=>setBpOpen(p=>({...p,[b.id]:!open}))}>
              <button className="del-circle" onClick={ev=>{ev.stopPropagation();delBp(i);}}>−</button>
              <span style={{ fontSize:15, fontWeight:600, color:"#1c1c1e", flex:1 }}>
                {b.name||`BP ${i+1}`}
                {b.days>0 && <span style={{ fontSize:12, color:"#8e8e93", marginLeft:8, fontWeight:400 }}>{b.days}人日</span>}
              </span>
              <span className="chip" style={{ background:"#e5f3ff", color:"#007aff", marginRight:6 }}>BP</span>
              <span style={{ color:"#c7c7cc", fontSize:18, transform:open?"rotate(90deg)":"rotate(0deg)", transition:"transform .2s" }}>›</span>
            </div>
            {open && <>
              <div className="ac-row row-input"><span className="lbl-inp">BP名</span><input className="inp inp-right" type="text" value={b.name} onChange={ev=>updBp(i,"name",ev.target.value)} placeholder="BP名" /></div>
              <div className="ac-row row-input"><span className="lbl-inp">工数（人日）</span><input className="inp inp-right" type="number" value={b.days||""} onChange={ev=>updBp(i,"days",ev.target.value)} placeholder="0" /></div>
              <div className="ac-row row-input"><span className="lbl-inp">原価単価/日</span><input className="inp inp-right" type="number" value={b.costPerDay||""} onChange={ev=>updBp(i,"costPerDay",ev.target.value)} placeholder="0" style={{ color:"#ff9500" }} /></div>
              <div className="ac-row row-input"><span className="lbl-inp">粗利率（%）</span><input className="inp inp-right" type="number" value={b.gpr||""} onChange={ev=>updBp(i,"gpr",ev.target.value)} placeholder="0" /></div>
              <div className="ac-row row-auto"><div className="lbl-auto-wrap"><span className="lbl-auto">売上単価/日</span><span className="auto-badge">自動</span></div><span className="auto-val sell-val">{num(b.sellPerDay)}</span></div>
              <div className="ac-row row-auto"><div className="lbl-auto-wrap"><span className="lbl-auto">売上小計</span><span className="auto-badge">自動</span></div><span className="auto-val sell-val" style={{ fontWeight:500 }}>{yen(b.totalSellBp)}</span></div>
              <div className="ac-row row-auto"><div className="lbl-auto-wrap"><span className="lbl-auto">原価小計</span><span className="auto-badge">自動</span></div><span className="auto-val cost-val" style={{ fontWeight:500 }}>{yen(b.totalCostBp)}</span></div>
              <div className="ac-row row-auto"><div className="lbl-auto-wrap"><span className="lbl-auto">粗利額</span><span className="auto-badge">自動</span></div><span className="auto-val" style={{ fontWeight:500, color:b.totalGpBp>=0?"#34c759":"#ff3b30" }}>{yen(b.totalGpBp)}</span></div>
            </>}
          </div>
        );
      })}
      <div className="ac">
        <button className="add-row" onClick={()=>{ const id=uid(); setBps(p=>[...p,{id,name:"",costPerDay:0,gpr:0,days:0}]); setBpOpen(p=>({...p,[id]:true})); setShowResult(false); }}>
          <PlusCircle /> BP利用を追加
        </button>
      </div>

      {/* 仕入/外注 */}
      <div className="sec-hdr">仕入 / 外注</div>
      {purRows.map((p,i) => {
        const open = !!purOpen[p.id];
        return (
          <div key={p.id} className="ac">
            <div className="ac-row" style={{ background:"#f9f9fb", cursor:"pointer" }} onClick={()=>setPurOpen(prev=>({...prev,[p.id]:!open}))}>
              <button className="del-circle" onClick={ev=>{ev.stopPropagation();delPurchase(i);}}>−</button>
              <span style={{ fontSize:15, fontWeight:600, color:"#1c1c1e", flex:1 }}>
                {p.note||`仕入 ${i+1}`}
                {p.cost>0 && <span style={{ fontSize:12, color:"#8e8e93", marginLeft:8, fontWeight:400 }}>{yen(p.cost)}</span>}
              </span>
              <span className="chip" style={{ background:"#fff8e0", color:"#c45500", marginRight:6 }}>仕入</span>
              <span style={{ color:"#c7c7cc", fontSize:18, transform:open?"rotate(90deg)":"rotate(0deg)", transition:"transform .2s" }}>›</span>
            </div>
            {open && <>
              <div className="ac-row row-input"><span className="lbl-inp">備考</span><input className="inp inp-right" type="text" value={p.note} onChange={ev=>updPurchase(i,"note",ev.target.value)} placeholder="案件名・内容" /></div>
              <div className="ac-row row-input"><span className="lbl-inp">原価（円）</span><input className="inp inp-right" type="number" value={p.cost||""} onChange={ev=>updPurchase(i,"cost",ev.target.value)} placeholder="0" style={{ color:"#ff9500" }} /></div>
              <div className="ac-row row-input"><span className="lbl-inp">粗利率（%）</span><input className="inp inp-right" type="number" value={p.gpr||""} onChange={ev=>updPurchase(i,"gpr",ev.target.value)} placeholder="0" /></div>
              <div className="ac-row row-auto"><div className="lbl-auto-wrap"><span className="lbl-auto">売上額</span><span className="auto-badge">自動</span></div><span className="auto-val sell-val" style={{ fontWeight:500 }}>{yen(p.sell)}</span></div>
              <div className="ac-row row-auto"><div className="lbl-auto-wrap"><span className="lbl-auto">粗利額</span><span className="auto-badge">自動</span></div><span className="auto-val sell-val" style={{ fontWeight:500 }}>{yen(p.gp)}</span></div>
            </>}
          </div>
        );
      })}
      <div className="ac">
        <button className="add-row" onClick={()=>{ const id=uid(); setPurchases(p=>[...p,{id,note:"",cost:0,gpr:0}]); setPurOpen(p=>({...p,[id]:true})); setShowResult(false); }}>
          <PlusCircle /> 仕入/外注を追加
        </button>
      </div>

      {/* プロジェクト管理費 */}
      <div className="sec-hdr">プロジェクト管理費</div>
      <div className="ac">
        <div className="ac-row">
          <span style={{ fontSize:15, color:"#1c1c1e", flex:1 }}>（エンジニア＋BP売上）× {settings.ptFeeRate}%</span>
          <span style={{ fontSize:17, fontWeight:500, color:ptFeeOn?"#34c759":"#8e8e93" }}>{yen(ptFee)}</span>
        </div>
        <div className="ac-row" style={{ gap:8 }}>
          <button onClick={()=>setPtFeeOn(true)} style={{ flex:1, height:38, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", background:ptFeeOn?"#007aff":"#e5e5ea", color:ptFeeOn?"#fff":"#8e8e93", transition:"all .15s" }}>適用する</button>
          <button onClick={()=>setPtFeeOn(false)} style={{ flex:1, height:38, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", background:!ptFeeOn?"#ff3b30":"#e5e5ea", color:!ptFeeOn?"#fff":"#8e8e93", transition:"all .15s" }}>適用しない</button>
        </div>
        <div className="ac-row">
          <span style={{ fontSize:13, color:"#8e8e93" }}>{ptFeeOn?"見積もりに含まれます":"見積もりから除外されます"}</span>
        </div>
      </div>

      {/* アクション */}
      <div style={{ padding:"0 0 8px" }}>
        <CalcButton onClick={() => setShowResult(true)} />
        <button className="btn-plain" onClick={clear}>クリア</button>
      </div>

      {/* 計算結果 */}
      {showResult && (
        <div>

          {/* ① アラート */}
          {(() => {
            const targetGP  = Math.ceil(netSell * 0.47);
            const shortfall = targetGP - grossProfit;
            return gpr < 47 ? (
              <div style={{ background:"#fff3e0", borderRadius:16, padding:"16px", marginBottom:20 }}>
                <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:22, lineHeight:1 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600, color:"#bf4800", letterSpacing:"-.02em" }}>粗利率が目標未達</div>
                    <div style={{ fontSize:13, color:"#c45500", marginTop:2 }}>現在 <strong>{gpr.toFixed(1)}%</strong>（目標：47%以上）</div>
                  </div>
                </div>
                <div style={{ background:"#fff", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#bf4800", letterSpacing:".04em", marginBottom:10 }}>47%達成に必要な粗利額調整</div>
                  <div style={{ fontSize:28, fontWeight:700, color:"#bf4800", letterSpacing:"-.03em", textAlign:"center", margin:"4px 0 8px" }}>＋{yen(shortfall)}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#c45500", paddingTop:8, borderTop:".5px solid rgba(191,72,0,.15)" }}>
                    <span>目標粗利額 {yen(targetGP)}</span><span>現在 {yen(grossProfit)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background:"#e8f8ed", borderRadius:16, padding:"14px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:22 }}>✅</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:"#1a7a35", letterSpacing:"-.02em" }}>粗利率が目標達成</div>
                  <div style={{ fontSize:13, color:"#1d8a3a", marginTop:2 }}>現在 <strong>{gpr.toFixed(1)}%</strong>（目標：47%以上）</div>
                </div>
              </div>
            );
          })()}

          {/* ② 調整項目（アラートの下） */}
          <div className="sec-hdr">調整項目</div>
          <div className="ac">
            <div className="ac-row">
              <span className="inp-label" style={{ minWidth:130, color:"#ff3b30" }}>値引き（円）</span>
              <span style={{ color:"#ff3b30", fontSize:20, fontWeight:300, marginRight:2 }}>−</span>
              <input className="inp inp-right" type="number" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="0" style={{ color:"#ff3b30", fontWeight:500 }} />
            </div>
            {discountAmt>0 && (
              <div className="ac-row" style={{ background:"#fff5f4", justifyContent:"flex-end" }}>
                <span style={{ fontSize:15, fontWeight:600, color:"#ff3b30" }}>− {yen(discountAmt)}</span>
              </div>
            )}
            <div className="ac-row">
              <span className="inp-label" style={{ minWidth:130, color:"#34c759", fontSize:14 }}>粗利額調整追加額（円）</span>
              <span style={{ color:"#34c759", fontSize:20, fontWeight:300, marginRight:2 }}>+</span>
              <input className="inp inp-right" type="number" value={gpAdjust} onChange={e=>setGpAdjust(e.target.value)} placeholder="0" style={{ color:"#34c759", fontWeight:500 }} />
            </div>
            {gpAdjustAmt>0 && (
              <div className="ac-row" style={{ background:"#f4fff7", justifyContent:"flex-end" }}>
                <span style={{ fontSize:15, fontWeight:600, color:"#34c759" }}>+ {yen(gpAdjustAmt)}</span>
              </div>
            )}
          </div>

          {/* ③ 内訳テーブル */}
          <div className="sec-hdr">内訳</div>
          <div className="ac" style={{ overflow:"hidden" }}>
            <div className="res-row" style={{ background:"#f9f9fb", borderBottom:".5px solid rgba(60,60,67,.15)" }}>
              <span className="res-hdr">種別・ランク</span>
              <span className="res-hdr" style={{ textAlign:"right" }}>人日</span>
              <span className="res-hdr" style={{ textAlign:"right" }}>売上小計</span>
              <span className="res-hdr" style={{ textAlign:"right" }}>粗利率</span>
            </div>
            {rows.map((r,i)=>(
              <div key={`e${i}`} className="res-row">
                <span style={{ fontSize:14, color:"#1c1c1e" }}>{r.rankName||"—"}</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>{num(r.days)}</span>
                <span style={{ fontSize:13, color:"#34c759", textAlign:"right", fontWeight:500 }}>{yen(r.s)}</span>
                <span style={{ textAlign:"right" }}><span className="gp-pill" style={{ background:gpBg(r.gpr), color:gpCol(r.gpr), fontSize:12 }}>{r.gpr.toFixed(1)}%</span></span>
              </div>
            ))}
            {bpRows.filter(b=>b.days>0||b.name).map((b,i)=>(
              <div key={`b${i}`} className="res-row" style={{ background:"#fafcff" }}>
                <span style={{ fontSize:14, color:"#1c1c1e" }}><span className="chip" style={{ background:"#e5f3ff", color:"#007aff", marginRight:5 }}>BP</span>{b.name||"—"}</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>{num(b.days)}</span>
                <span style={{ fontSize:13, color:"#34c759", textAlign:"right", fontWeight:500 }}>{yen(b.totalSellBp)}</span>
                <span style={{ textAlign:"right" }}><span className="gp-pill" style={{ background:gpBg(b.gpr), color:gpCol(b.gpr), fontSize:12 }}>{b.gpr.toFixed(1)}%</span></span>
              </div>
            ))}
            {purRows.filter(p=>p.cost>0||p.note).map((p,i)=>(
              <div key={`p${i}`} className="res-row" style={{ background:"#fffdf5" }}>
                <span style={{ fontSize:14, color:"#1c1c1e" }}><span className="chip" style={{ background:"#fff8e0", color:"#c45500", marginRight:5 }}>仕入</span>{p.note||"—"}</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
                <span style={{ fontSize:13, color:"#34c759", textAlign:"right", fontWeight:500 }}>{yen(p.sell)}</span>
                <span style={{ textAlign:"right" }}><span className="gp-pill" style={{ background:gpBg(p.gprCalc), color:gpCol(p.gprCalc), fontSize:12 }}>{p.gprCalc.toFixed(1)}%</span></span>
              </div>
            ))}
            {ptFee>0 && (
              <div className="res-row" style={{ background:"#f4fff7" }}>
                <span style={{ fontSize:14, color:"#1c1c1e" }}><span className="chip" style={{ background:"#e8f8ed", color:"#1a7a35", marginRight:5 }}>管理費</span>プロジェクト管理費</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
                <span style={{ fontSize:13, color:"#34c759", textAlign:"right", fontWeight:500 }}>{yen(ptFee)}</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
              </div>
            )}
            <div className="res-row">
              <span style={{ fontSize:14, color:"#ff3b30" }}>値引き</span>
              <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
              <span style={{ fontSize:13, color:"#ff3b30", fontWeight:600, textAlign:"right" }}>− {yen(discountAmt)}</span>
              <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
            </div>
            {gpAdjustAmt>0 && (
              <div className="res-row" style={{ background:"#f4fff7" }}>
                <span style={{ fontSize:14, color:"#34c759" }}>粗利額調整</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
                <span style={{ fontSize:13, color:"#34c759", fontWeight:600, textAlign:"right" }}>+ {yen(gpAdjustAmt)}</span>
                <span style={{ fontSize:13, color:"#8e8e93", textAlign:"right" }}>—</span>
              </div>
            )}
            <div className="res-row" style={{ background:"#f9f9fb", borderTop:".5px solid rgba(60,60,67,.15)" }}>
              <span style={{ fontSize:15, fontWeight:600, color:"#1c1c1e" }}>合計</span>
              <span style={{ fontSize:13, fontWeight:600, color:"#1c1c1e", textAlign:"right" }}>{num(tDays)}</span>
              <span style={{ fontSize:15, fontWeight:600, color:"#1c1c1e", textAlign:"right" }}>{yen(netSell)}</span>
              <span style={{ textAlign:"right" }}><span className="gp-pill" style={{ background:gpBg(gpr), color:gpCol(gpr), fontSize:12, fontWeight:700 }}>{gpr.toFixed(1)}%</span></span>
            </div>
          </div>

          {/* ④ 粗利サマリー */}
          <div className="sec-hdr">粗利サマリー</div>
          <div className="ac">
            <div className="ac-row" style={{ background:gpr>=47?"#f4fff7":"#fff8f5" }}>
              <span style={{ fontSize:15, color:"#8e8e93" }}>粗利額</span>
              <span style={{ fontSize:22, fontWeight:700, color:gpr>=47?"#34c759":"#ff3b30", letterSpacing:"-.03em", marginLeft:"auto" }}>{yen(grossProfit)}</span>
            </div>
            <div className="ac-row">
              <span style={{ fontSize:15, color:"#8e8e93" }}>粗利率</span>
              <span style={{ fontSize:22, fontWeight:700, color:gpr>=47?"#34c759":"#ff3b30", letterSpacing:"-.03em", marginLeft:"auto" }}>{gpr.toFixed(1)}%</span>
            </div>
            <div className="ac-row">
              <span style={{ fontSize:15, color:"#8e8e93" }}>総工数</span>
              <span style={{ fontSize:17, fontWeight:500, color:"#1c1c1e", marginLeft:"auto" }}>{num(tDays)} 人日</span>
            </div>
          </div>

          {/* ⑤ 税込合計 */}
          <div style={{ background:"#1c1c1e", borderRadius:20, padding:"24px 20px", margin:"8px 0 16px", textAlign:"center" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#8e8e93", letterSpacing:".08em", marginBottom:8 }}>税込合計（消費税10%）</div>
            <div style={{ fontSize:36, fontWeight:700, color:"#fff", letterSpacing:"-.04em" }}>{yen(taxIncluded)}</div>
            <div style={{ fontSize:13, color:"#636366", marginTop:8 }}>税抜 {yen(netSell)}</div>
          </div>

          {/* ⑥ PDF出力ボタン */}
          <button onClick={printPDF} style={{
            width:"100%", height:52, background:"#fff", border:"1.5px solid #007aff",
            borderRadius:14, fontSize:16, fontWeight:600, color:"#007aff",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            gap:8, marginBottom:28, letterSpacing:"-.01em",
          }}>
            <span style={{ fontSize:20 }}>📄</span> 見積書をPDF出力
          </button>

        </div>
      )}

      {/* PDF プレビューモーダル */}
      {showPdf && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,.6)", display:"flex", flexDirection:"column" }}>
          {/* ヘッダ */}
          <div style={{ background:"#1c1c1e", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", flexShrink:0 }}>
            <span style={{ color:"#fff", fontSize:16, fontWeight:600 }}>見積書プレビュー</span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>window.print()} style={{ height:36, padding:"0 14px", background:"#007aff", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                🖨️ 印刷 / PDF保存
              </button>
              <button onClick={()=>setShowPdf(false)} style={{ height:36, padding:"0 14px", background:"#3a3a3c", color:"#fff", border:"none", borderRadius:8, fontSize:14, cursor:"pointer" }}>
                ✕ 閉じる
              </button>
            </div>
          </div>
          {/* プレビュー本体 */}
          <div id="pdf-preview" style={{ flex:1, overflowY:"auto", background:"#f2f2f7", padding:"20px 12px" }}>
            <div style={{ background:"#fff", borderRadius:16, padding:"24px 20px", maxWidth:680, margin:"0 auto", fontFamily:"-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif" }}>
              {/* 案件情報 */}
              <div style={{ fontSize:24, fontWeight:700, color:"#1c1c1e", letterSpacing:"-.03em", marginBottom:4 }}>見積書</div>
              <div style={{ fontSize:12, color:"#8e8e93", marginBottom:20 }}>作成日：{new Date().toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric"})}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 20px", background:"#f2f2f7", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                {[["案件名",projName],["顧客名",clientName],["開始年月（予定）",dateFrom],["終了年月（予定）",dateTo]].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:10, color:"#8e8e93", fontWeight:600, letterSpacing:".04em", marginBottom:2 }}>{l}</div><div style={{ fontSize:13, fontWeight:600, color:"#1c1c1e" }}>{v||"—"}</div></div>
                ))}
              </div>

              {/* 内訳テーブル */}
              <div style={{ fontSize:11, fontWeight:700, color:"#8e8e93", letterSpacing:".07em", textTransform:"uppercase", marginBottom:8 }}>エンジニア・BP・仕入 内訳</div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:20 }}>
                <thead>
                  <tr style={{ background:"#f2f2f7" }}>
                    {["種別・ランク","工数(人日)","売上小計","粗利額","粗利率"].map((h,i)=>(
                      <th key={h} style={{ padding:"7px 10px", textAlign:i===0?"left":"right", fontSize:10, fontWeight:600, color:"#8e8e93", letterSpacing:".04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r=>r.days>0||r.rankName).map((r,i)=>(
                    <tr key={`pr${i}`} style={{ borderBottom:".5px solid rgba(60,60,67,.1)" }}>
                      <td style={{ padding:"8px 10px", fontSize:12 }}>{r.rankName||"—"}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12 }}>{num(r.days)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12, color:"#34c759", fontWeight:500 }}>{yen(r.s)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12 }}>{yen(r.gp)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right" }}><span style={{ background:gpBg(r.gpr), color:gpCol(r.gpr), borderRadius:12, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{r.gpr.toFixed(1)}%</span></td>
                    </tr>
                  ))}
                  {bpRows.filter(b=>b.days>0||b.name).map((b,i)=>(
                    <tr key={`pb${i}`} style={{ borderBottom:".5px solid rgba(60,60,67,.1)", background:"#fafcff" }}>
                      <td style={{ padding:"8px 10px", fontSize:12 }}><span style={{ fontSize:10, background:"#e5f3ff", color:"#007aff", borderRadius:4, padding:"1px 5px", marginRight:4 }}>BP</span>{b.name||"—"}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12 }}>{num(b.days)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12, color:"#34c759", fontWeight:500 }}>{yen(b.totalSellBp)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12 }}>{yen(b.totalGpBp)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right" }}><span style={{ background:gpBg(b.gpr), color:gpCol(b.gpr), borderRadius:12, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{b.gpr.toFixed(1)}%</span></td>
                    </tr>
                  ))}
                  {purRows.filter(p=>p.cost>0||p.note).map((p,i)=>(
                    <tr key={`pp${i}`} style={{ borderBottom:".5px solid rgba(60,60,67,.1)", background:"#fffdf5" }}>
                      <td style={{ padding:"8px 10px", fontSize:12 }}><span style={{ fontSize:10, background:"#fff8e0", color:"#c45500", borderRadius:4, padding:"1px 5px", marginRight:4 }}>仕入</span>{p.note||"—"}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12 }}>—</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12, color:"#34c759", fontWeight:500 }}>{yen(p.sell)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontSize:12 }}>{yen(p.gp)}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right" }}><span style={{ background:gpBg(p.gprCalc), color:gpCol(p.gprCalc), borderRadius:12, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{p.gprCalc.toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 集計サマリー */}
              <div style={{ fontSize:11, fontWeight:700, color:"#8e8e93", letterSpacing:".07em", textTransform:"uppercase", marginBottom:8 }}>集計サマリー</div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:20 }}>
                <tbody>
                  {[
                    ["エンジニア売上合計", yen(tSell)],
                    ...(bpSell>0?[["BP利用 売上合計",`+ ${yen(bpSell)}`]]:[]),
                    ...(ptFeeOn&&ptFee>0?[[`プロジェクト管理費（${settings.ptFeeRate}%）`,`+ ${yen(ptFee)}`]]:[]),
                    ...(purSell>0?[["仕入/外注 売上合計",`+ ${yen(purSell)}`]]:[]),
                    ...(discountAmt>0?[["値引き",`− ${yen(discountAmt)}`]]:[]),
                    ["差引後売上合計（税抜）", yen(netSell), true],
                    ["エンジニア原価合計", yen(tCost)],
                    ...(bpCost>0?[["BP利用 原価合計",yen(bpCost)]]:[]),
                    ...(purCost>0?[["仕入/外注 原価合計",yen(purCost)]]:[]),
                    ["総原価合計", yen(totalCost), true],
                    ...(gpAdjustAmt>0?[["粗利額調整追加額",`+ ${yen(gpAdjustAmt)}`]]:[]),
                  ].map(([l,v,bold],i)=>(
                    <tr key={i} style={{ borderTop:bold?"1.5px solid #1c1c1e":"none", background:bold?"#f9f9fb":"transparent", borderBottom:".5px solid rgba(60,60,67,.08)" }}>
                      <td style={{ padding:"8px 10px", color:"#3c3c43", fontWeight:bold?700:400 }}>{l}</td>
                      <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:bold?700:400 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 粗利カード */}
              <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                {[["粗利額",yen(grossProfit)],["粗利率",`${gpr.toFixed(1)}%`]].map(([l,v])=>(
                  <div key={l} style={{ flex:1, borderRadius:12, padding:"12px", textAlign:"center", background:gpr>=47?"#e8f8ed":"#fff3e0", color:gpr>=47?"#1a7a35":"#bf4800" }}>
                    <div style={{ fontSize:10, fontWeight:600, marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-.02em" }}>{v}</div>
                  </div>
                ))}
                <div style={{ flex:1, borderRadius:12, padding:"12px", textAlign:"center", background:"#f2f2f7", color:"#1c1c1e" }}>
                  <div style={{ fontSize:10, fontWeight:600, color:"#8e8e93", marginBottom:4 }}>総工数</div>
                  <div style={{ fontSize:20, fontWeight:700 }}>{num(tDays)} 人日</div>
                </div>
              </div>

              {/* 税込合計 */}
              <div style={{ background:"#1c1c1e", borderRadius:14, padding:"18px 20px", textAlign:"center" }}>
                <div style={{ fontSize:10, fontWeight:600, color:"#8e8e93", letterSpacing:".08em", marginBottom:6 }}>税込合計（消費税10%）</div>
                <div style={{ fontSize:28, fontWeight:700, color:"#fff", letterSpacing:"-.03em" }}>{yen(taxIncluded)}</div>
                <div style={{ fontSize:11, color:"#636366", marginTop:4 }}>税抜 {yen(netSell)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 計算ボタン ─────────────────────────────────────────
function CalcButton({ onClick }) {
  const [state, setState] = useState("idle");
  const handleClick = () => {
    if(state!=="idle") return;
    setState("pressing");
    setTimeout(()=>{ setState("done"); onClick(); setTimeout(()=>setState("idle"),1400); },160);
  };
  const cfg = { idle:{bg:"#007aff",label:"計算する",icon:""}, pressing:{bg:"#0051d0",label:"計算中…",icon:""}, done:{bg:"#34c759",label:"計算完了",icon:"✓ "} }[state];
  return (
    <button onClick={handleClick} style={{
      height:54, width:"100%", border:"none", borderRadius:16,
      fontSize:17, fontWeight:600, cursor:"pointer",
      background:cfg.bg, color:"#fff", letterSpacing:"-.02em",
      transition:"all .15s ease",
      transform:state==="pressing"?"scale(.98)":state==="done"?"scale(1.01)":"scale(1)",
      boxShadow:state==="done"?"0 4px 20px rgba(52,199,89,.4)":"0 2px 12px rgba(0,122,255,.25)",
      marginBottom:0,
    }}>
      {cfg.icon}{cfg.label}
    </button>
  );
}

// ─── 管理画面 ─────────────────────────────────────────────
function AdminPage({ master, settings, applyMaster, applySettings }) {
  const [authed,      setAuthed]      = useState(false);
  const [inputPw,     setInputPw]     = useState("");
  const [pwError,     setPwError]     = useState("");

  const mig = m => ({
    ...m,
    sellM: m.sellM ?? m.sell*20,
    costM: m.costM ?? m.cost*20,
    sell:  m.sell  ?? Math.round((m.sellM??0)/20),
    cost:  m.cost  ?? Math.round((m.costM??0)/20),
  });

  const [localMaster, setLocalMaster] = useState(master.map(mig));
  const [ptFeeRate,   setPtFeeRate]   = useState(settings.ptFeeRate);
  const [saved,       setSaved]       = useState(false);
  const [newPass,     setNewPass]     = useState("");
  const [newPass2,    setNewPass2]    = useState("");
  const [passMsg,     setPassMsg]     = useState("");

  useEffect(()=>{ setLocalMaster(master.map(mig)); },[master]);
  useEffect(()=>{ setPtFeeRate(settings.ptFeeRate); },[settings]);

  const login = () => { if(inputPw===loadPass()){setAuthed(true);setPwError("");}else setPwError("パスワードが違います"); };

  const updRow = (i,key,val) => {
    const next=[...localMaster];
    if(key==="sellM"){ next[i]={...next[i],sellM:Number(val),sell:Math.round(Number(val)/20)}; }
    else if(key==="costM"){ next[i]={...next[i],costM:Number(val),cost:Math.round(Number(val)/20)}; }
    else { next[i]={...next[i],[key]:key==="name"?val:Number(val)}; }
    setLocalMaster(next);
  };
  const addRow = () => setLocalMaster([...localMaster,{id:uid(),name:"",sellM:0,sell:0,costM:0,cost:0}]);
  const delRow = (i) => setLocalMaster(localMaster.filter((_,idx)=>idx!==i));

  const save = () => {
    applyMaster(localMaster); applySettings({ptFeeRate:Number(ptFeeRate)});
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };
  const changePass = () => {
    if(!newPass){setPassMsg("新しいパスワードを入力してください");return;}
    if(newPass!==newPass2){setPassMsg("パスワードが一致しません");return;}
    if(newPass.length<6){setPassMsg("6文字以上で設定してください");return;}
    savePass(newPass); setNewPass(""); setNewPass2("");
    setPassMsg("✓ パスワードを変更しました"); setTimeout(()=>setPassMsg(""),3000);
  };

  if(!authed) return (
    <div style={{ padding:"40px 0" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"36px 24px", maxWidth:360, margin:"0 auto" }}>
        <div style={{ fontSize:48, textAlign:"center", marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:22, fontWeight:700, color:"#1c1c1e", textAlign:"center", letterSpacing:"-.03em", marginBottom:4 }}>管理画面</div>
        <div style={{ fontSize:14, color:"#8e8e93", textAlign:"center", marginBottom:24 }}>単価マスタの編集にはパスワードが必要です</div>
        <div className="ac" style={{ marginBottom:16 }}>
          <div className="ac-row">
            <span style={{ fontSize:15, color:"#8e8e93", minWidth:100 }}>パスワード</span>
            <input style={{ background:"transparent", border:"none", outline:"none", fontSize:17, color:"#1c1c1e", flex:1, textAlign:"right" }}
              type="password" placeholder="入力" value={inputPw}
              onChange={e=>setInputPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
          </div>
        </div>
        {pwError && <div style={{ fontSize:13, color:"#ff3b30", textAlign:"center", marginBottom:12 }}>{pwError}</div>}
        <button className="btn-blue" onClick={login}>ログイン</button>
        <div style={{ fontSize:12, color:"#c7c7cc", textAlign:"center", marginTop:14 }}>初期パスワード：admin1234</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 16px", marginBottom:4 }}>
        <div style={{ fontSize:13, color:"#8e8e93" }}>単価マスタ</div>
        <button style={{ background:"transparent", border:"none", color:"#ff3b30", fontSize:15, cursor:"pointer", padding:0 }} onClick={()=>setAuthed(false)}>ログアウト</button>
      </div>

      {localMaster.map((m,i)=>{
        const sellDay=Math.round((m.sellM||0)/20), costDay=Math.round((m.costM||0)/20);
        const gprVal=sellDay>0?((sellDay-costDay)/sellDay*100):0;
        return (
          <div key={m.id} className="ac">
            <div className="ac-row" style={{ background:"#f9f9fb" }}>
              <button className="del-circle" onClick={()=>delRow(i)}>−</button>
              <input style={{ background:"transparent", border:"none", outline:"none", fontSize:16, fontWeight:600, color:"#1c1c1e", flex:1, letterSpacing:"-.02em" }}
                value={m.name} onChange={e=>updRow(i,"name",e.target.value)} placeholder="職種名" />
              <span style={{ fontSize:15, fontWeight:700, color:gprVal>=47?"#34c759":"#ff3b30", letterSpacing:"-.02em" }}>{gprVal.toFixed(1)}%</span>
            </div>
            <div className="ac-row row-input">
              <span style={{ fontSize:14, color:"#8e8e93", minWidth:140 }}>売上単価（/月）</span>
              <input style={{ background:"transparent", border:"none", outline:"none", fontSize:15, color:"#34c759", fontWeight:500, flex:1, textAlign:"right" }}
                type="number" value={m.sellM||0} onChange={e=>updRow(i,"sellM",e.target.value)} />
            </div>
            <div className="ac-row row-auto">
              <div className="lbl-auto-wrap"><span className="lbl-auto">売上単価（/日）</span><span className="auto-badge">自動</span></div>
              <span style={{ fontSize:15, color:"#34c759", fontWeight:400, marginLeft:"auto" }}>{sellDay.toLocaleString("ja-JP")}</span>
            </div>
            <div className="ac-row row-input">
              <span style={{ fontSize:14, color:"#8e8e93", minWidth:140 }}>原価単価（/月）</span>
              <input style={{ background:"transparent", border:"none", outline:"none", fontSize:15, color:"#ff9500", fontWeight:500, flex:1, textAlign:"right" }}
                type="number" value={m.costM||0} onChange={e=>updRow(i,"costM",e.target.value)} />
            </div>
            <div className="ac-row row-auto">
              <div className="lbl-auto-wrap"><span className="lbl-auto">原価単価（/日）</span><span className="auto-badge">自動</span></div>
              <span style={{ fontSize:15, color:"#ff9500", fontWeight:400, marginLeft:"auto" }}>{costDay.toLocaleString("ja-JP")}</span>
            </div>
          </div>
        );
      })}

      <div className="ac">
        <button className="add-row" onClick={addRow}>
          <span style={{ width:22, height:22, background:"#34c759", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:300, flexShrink:0 }}>+</span>
          行を追加
        </button>
      </div>

      <div className="sec-hdr">プロジェクト管理費設定</div>
      <div className="ac">
        <div className="ac-row">
          <span style={{ fontSize:15, color:"#1c1c1e", flex:1 }}>管理費率</span>
          <input style={{ background:"transparent", border:"none", outline:"none", fontSize:17, color:"#007aff", fontWeight:500, width:60, textAlign:"right" }}
            type="number" value={ptFeeRate} onChange={e=>setPtFeeRate(e.target.value)} />
          <span style={{ fontSize:17, color:"#007aff", fontWeight:500, marginLeft:2 }}>%</span>
        </div>
        <div className="ac-row">
          <span style={{ fontSize:13, color:"#8e8e93" }}>エンジニア売上＋BP売上 に対する割合</span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:8 }}>
        <button className="btn-blue" onClick={save}>保存して反映する</button>
        {saved && <div style={{ textAlign:"center", fontSize:13, color:"#34c759", padding:"8px 0" }}>✓ 保存しました</div>}
        <button className="btn-dest" onClick={()=>{ if(window.confirm("マスタデータをデフォルトに戻します。よろしいですか？")){ saveMasterLS(DEFAULT_MASTER); setLocalMaster(DEFAULT_MASTER.map(mig)); applyMaster(DEFAULT_MASTER); } }}>
          データをリセット
        </button>
      </div>

      <div className="sec-hdr" style={{ marginTop:28 }}>パスワード変更</div>
      <div className="ac">
        <div className="ac-row">
          <span style={{ fontSize:15, color:"#1c1c1e", minWidth:140 }}>新しいパスワード</span>
          <input style={{ background:"transparent", border:"none", outline:"none", fontSize:15, color:"#1c1c1e", flex:1, textAlign:"right" }}
            type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="6文字以上" />
        </div>
        <div className="ac-row">
          <span style={{ fontSize:15, color:"#1c1c1e", minWidth:140 }}>確認（再入力）</span>
          <input style={{ background:"transparent", border:"none", outline:"none", fontSize:15, color:"#1c1c1e", flex:1, textAlign:"right" }}
            type="password" value={newPass2} onChange={e=>setNewPass2(e.target.value)} placeholder="再入力" />
        </div>
      </div>
      {passMsg && <div style={{ fontSize:13, color:passMsg.startsWith("✓")?"#34c759":"#ff3b30", textAlign:"center", padding:"0 0 12px" }}>{passMsg}</div>}
      <button className="btn-plain" onClick={changePass}>パスワードを変更する</button>
    </div>
  );
}
