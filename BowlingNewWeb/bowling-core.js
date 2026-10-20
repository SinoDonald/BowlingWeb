/*
 * 保齡球分數統計 - 核心邏輯 (解析 xlsx / 統計 / 寫回 xlsx)
 * 直接修改 xlsx 內部 XML,以保留原檔的樣式、合併儲存格、圖表與註解。
 * 瀏覽器與 Node 皆可使用 (需先載入 JSZip)。
 */
(function (root) {
  'use strict';

  const T_SUBTOTAL = '小計', T_AVG = '平均', T_TOTAL = '總計', T_TOTAL_AVG = '總平均';
  const CHART_SHEET = '圖表';

  /* ---------- 小工具 ---------- */
  const colToNum = c => { let n = 0; for (const ch of c) n = n * 26 + ch.charCodeAt(0) - 64; return n; };
  const numToCol = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const serialToMs = n => Math.round((n - 25569) * 86400000);
  const msToSerial = ms => Math.round(ms / 86400000) + 25569;
  const isoOf = ms => new Date(ms).toISOString().slice(0, 10);
  const num = v => (v === '' || v == null || isNaN(Number(v))) ? null : Number(v);

  /* ---------- sharedStrings ---------- */
  function parseSst(xml) {
    const out = [];
    const re = /<si>([\s\S]*?)<\/si>/g; let m;
    while ((m = re.exec(xml))) {
      let t = ''; const tr = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g; let x;
      // 排除注音 <rPh> 內的文字
      const body = m[1].replace(/<rPh[\s\S]*?<\/rPh>/g, '');
      while ((x = tr.exec(body))) t += unesc(x[1]);
      out.push(t);
    }
    return out;
  }

  /* ---------- 工作表 XML 解析 / 重組 ---------- */
  function parseSheet(xml, sst) {
    const i0 = xml.indexOf('<sheetData>'), i1 = xml.indexOf('</sheetData>');
    if (i0 < 0) throw new Error('找不到 sheetData');
    const head = xml.slice(0, i0 + '<sheetData>'.length), tail = xml.slice(i1);
    const body = xml.slice(i0 + '<sheetData>'.length, i1);
    const rows = [];
    const rowRe = /<row r="(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g; let m;
    while ((m = rowRe.exec(body))) {
      const row = { r: +m[1], attrs: m[2].replace(/\s*spans="[^"]*"/, '').replace(/\/$/, ''), cells: [] };
      const inner = m[3] || '';
      const cellRe = /<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g; let c;
      while ((c = cellRe.exec(inner))) {
        const attrs = c[2].replace(/\/$/, '');
        const t = (attrs.match(/\bt="([^"]*)"/) || [])[1] || 'n';
        const s = (attrs.match(/\bs="([^"]*)"/) || [])[1];
        const body2 = c[3] || '';
        const v = (body2.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        const is = (body2.match(/<is>[\s\S]*?<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/) || [])[1];
        const hasF = /<f[ >\/]/.test(body2);
        let val = null;
        if (t === 's') val = v != null ? sst[+v] : null;
        else if (t === 'inlineStr') val = is != null ? unesc(is) : null;
        else if (t === 'str') val = v != null ? unesc(v) : null;
        else if (t === 'e') val = null;
        else val = v != null ? num(v) : null;
        row.cells.push({ col: c[1], attrs, t, s, val, hasF, inner: body2 });
      }
      rows.push(row);
    }
    return { head, tail, rows };
  }

  function cellXml(r, c) {
    const a = c.attrs.replace(/\s*\br="[^"]*"/, '');
    return c.inner ? `<c r="${c.col}${r}"${a}>${c.inner}</c>` : `<c r="${c.col}${r}"${a}/>`;
  }
  function buildSheet(p) {
    p.rows.sort((a, b) => a.r - b.r);
    let s = p.head;
    for (const row of p.rows) {
      row.cells.sort((a, b) => colToNum(a.col) - colToNum(b.col));
      s += `<row r="${row.r}"${row.attrs}>${row.cells.map(c => cellXml(row.r, c)).join('')}</row>`;
    }
    return s + p.tail;
  }
  const getCell = (row, col) => row.cells.find(c => c.col === col);
  function setCell(row, col, attrs, inner, extra) {
    const nc = Object.assign({ col, attrs, inner: inner || '' }, extra || {});
    const i = row.cells.findIndex(c => c.col === col);
    if (i >= 0) row.cells[i] = nc; else row.cells.push(nc);
  }
  const sAttr = s => (s != null ? ` s="${s}"` : '');
  const mkNum = (s, v) => ({ attrs: sAttr(s), inner: `<v>${v}</v>` });

  /* ---------- 讀取活頁簿 ---------- */
  async function open(buf) {
    const zip = await root.JSZip.loadAsync(buf);
    const wb = await zip.file('xl/workbook.xml').async('string');
    const rels = await zip.file('xl/_rels/workbook.xml.rels').async('string');
    const relMap = {};
    for (const m of rels.matchAll(/<Relationship\s[^>]*>/g)) {
      const id = (m[0].match(/\bId="([^"]*)"/) || [])[1], tg = (m[0].match(/\bTarget="([^"]*)"/) || [])[1];
      if (id) relMap[id] = tg;
    }
    const sheets = [];
    for (const m of wb.matchAll(/<sheet\s[^>]*>/g)) {
      const name = unesc((m[0].match(/\bname="([^"]*)"/) || [])[1] || '');
      const rid = (m[0].match(/\br:id="([^"]*)"/) || [])[1];
      let tg = relMap[rid] || ''; tg = tg.replace(/^\/?(xl\/)?/, '');
      sheets.push({ name, path: 'xl/' + tg });
    }
    if (!sheets.length) throw new Error('找不到工作表');
    const sstFile = zip.file('xl/sharedStrings.xml');
    const sst = sstFile ? parseSst(await sstFile.async('string')) : [];
    const main = sheets[0];
    const mainXml = await zip.file(main.path).async('string');
    const parsed = parseSheet(mainXml, sst);
    const data = extract(parsed);
    data.sheetName = main.name;
    return { zip, sst, sheets, main, chart: sheets.find(s => s.name === CHART_SHEET), mainXml, parsed, data };
  }

  /* 從主工作表取出玩家、場次、每局成績與版面資訊 */
  function extract(parsed) {
    const rows = parsed.rows;
    const r2 = rows.find(r => r.r === 2);
    if (!r2) throw new Error('格式不符:找不到第 2 列 (姓名列)');
    const players = [];
    for (const c of r2.cells) {
      if (colToNum(c.col) >= 4 && typeof c.val === 'string' && c.val.trim()) players.push({ name: c.val.trim(), col: c.col });
    }
    if (!players.length) throw new Error('格式不符:第 2 列沒有玩家姓名');
    const sessions = []; let cur = null;
    const layout = { lastAvgRow: null, totalRow: null, totalAvgRow: null, firstDataRow: 3 };
    for (const row of rows) {
      if (row.r < 3) continue;
      const B = getCell(row, 'B'), C = getCell(row, 'C'), A = getCell(row, 'A');
      if (B && typeof B.val === 'number' && B.val > 20000) {
        cur = { no: A && A.val != null ? String(A.val) : '', dateMs: serialToMs(B.val), games: [], firstRow: row.r };
        sessions.push(cur);
      }
      if (!C) continue;
      if (typeof C.val === 'number' && cur) {
        const sc = {};
        for (const p of players) { const c = getCell(row, p.col); sc[p.name] = (c && c.t === 'n' && typeof c.val === 'number') ? c.val : null; }
        cur.games.push({ n: C.val, scores: sc, row: row.r });
      } else if (C.val === T_AVG) layout.lastAvgRow = row.r;
      else if (C.val === T_TOTAL) layout.totalRow = row.r;
      else if (C.val === T_TOTAL_AVG) layout.totalAvgRow = row.r;
    }
    sessions.sort((a, b) => a.dateMs - b.dateMs || a.firstRow - b.firstRow);
    return { players, sessions, layout };
  }

  /* ---------- 統計 ---------- */
  function flatten(data, player, fromMs, toMs) {
    const out = [];
    for (const s of data.sessions) {
      if (fromMs != null && s.dateMs < fromMs) continue;
      if (toMs != null && s.dateMs > toMs) continue;
      for (const g of s.games) { const v = g.scores[player]; if (v != null) out.push({ dateMs: s.dateMs, no: s.no, n: g.n, score: v }); }
    }
    return out;
  }
  function stats(data, player, fromMs, toMs) {
    const g = flatten(data, player, fromMs, toMs);
    if (!g.length) return { count: 0, sessions: 0 };
    const sc = g.map(x => x.score), sum = sc.reduce((a, b) => a + b, 0), avg = sum / sc.length;
    const sorted = [...sc].sort((a, b) => a - b);
    const hi = g.reduce((a, b) => b.score > a.score ? b : a), lo = g.reduce((a, b) => b.score < a.score ? b : a);
    const sd = Math.sqrt(sc.reduce((a, b) => a + (b - avg) ** 2, 0) / sc.length);
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const bySession = new Map();
    for (const x of g) { const k = x.dateMs; if (!bySession.has(k)) bySession.set(k, []); bySession.get(k).push(x.score); }
    const perSession = [...bySession.entries()].map(([dateMs, a]) => ({ dateMs, scores: a, avg: a.reduce((p, q) => p + q, 0) / a.length, max: Math.max(...a), min: Math.min(...a) })).sort((a, b) => a.dateMs - b.dateMs);
    const bestSession = perSession.reduce((a, b) => b.avg > a.avg ? b : a);
    return {
      count: sc.length, sessions: perSession.length, sum, avg, max: hi.score, maxDate: hi.dateMs, min: lo.score, minDate: lo.dateMs,
      median, sd, ge150: sc.filter(x => x >= 150).length, ge200: sc.filter(x => x >= 200).length, perSession, bestSession, scores: sc, games: g
    };
  }

  /* ---------- 新增場次 (寫回 xlsx) ---------- */
  /*
   * input = { date:'YYYY-MM-DD', no:'132', games:N, newPlayers:['名字'], scores:{ 玩家:[N 個分數或 null] } }
   * 回傳新的 xlsx (Uint8Array)
   */
  async function addSession(wbCtx, input) {
    const { data } = wbCtx;
    const N = input.games | 0;
    if (N < 1 || N > 20) throw new Error('局數需介於 1~20');
    const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date || '');
    if (!dm) throw new Error('日期格式錯誤');
    const dateSerial = msToSerial(Date.UTC(+dm[1], +dm[2] - 1, +dm[3]));

    const zip = await root.JSZip.loadAsync(await wbCtx.zip.generateAsync({ type: 'uint8array' }));
    const sst = wbCtx.sst;
    const idxOf = t => { const i = sst.indexOf(t); return i; };
    const iDash = idxOf('-'), iSub = idxOf(T_SUBTOTAL), iAvg = idxOf(T_AVG);

    // 玩家欄位
    const players = data.players.map(p => ({ ...p, isNew: false }));
    let lastCol = Math.max(...players.map(p => colToNum(p.col)));
    for (const nm of (input.newPlayers || [])) {
      const name = nm.trim();
      if (!name) continue;
      if (players.some(p => p.name === name)) throw new Error(`玩家「${name}」已存在`);
      players.push({ name, col: numToCol(++lastCol), isNew: true });
    }
    const newPlayers = players.filter(p => p.isNew);
    const lastExisting = data.players[data.players.length - 1];
    const participants = players.filter(p => (input.scores[p.name] || []).some(v => v != null));
    if (!participants.length) throw new Error('至少需要一位玩家的成績');
    const partNames = new Set(participants.map(p => p.name));

    /* ===== 主工作表 ===== */
    const L = data.layout;
    if (!L.lastAvgRow || !L.totalRow || !L.totalAvgRow) throw new Error('格式不符:找不到「平均 / 總計 / 總平均」列');
    const ins = L.lastAvgRow + 1, n = N + 2;
    const g1 = ins, gN = ins + N - 1, rSub = ins + N, rAvg = ins + N + 1, E = ins + n - 1;
    const p1 = parseSheet(wbCtx.mainXml, sst);

    const lastCell = (row, col) => getCell(row, col);
    const exRow = r => p1.rows.find(x => x.r === r);
    // 取得上一場的樣式
    const lg = []; for (let r = ins - 1; r >= 3; r--) { const row = exRow(r); const c = row && getCell(row, 'C'); if (c && typeof c.val === 'number') { lg.unshift(row); if (lg.length >= 2) break; } else if (lg.length) break; }
    const sty = (row, col) => { const c = row && getCell(row, col); return c ? c.s : undefined; };
    const prevSubRow = exRow(L.lastAvgRow - 1), prevAvgRow = exRow(L.lastAvgRow);
    const sA1 = sty(lg[0], 'A'), sA2 = sty(lg[1] || lg[0], 'A'), sB = sty(lg[0], 'B'), sC = sty(lg[0], 'C');
    const sP = sty(lg[0], lastExisting.col);
    const sSubC = sty(prevSubRow, 'C'), sSubP = sty(prevSubRow, lastExisting.col);
    const sAvgC = sty(prevAvgRow, 'C'), sAvgP = sty(prevAvgRow, lastExisting.col);

    // 1) 既有列下移
    for (const row of p1.rows) if (row.r >= ins) row.r += n;

    // 2) 新增玩家:補齊既有場次的欄位
    if (newPlayers.length) {
      let blockStart = null, subRow = null;
      for (const row of p1.rows) {
        if (row.r >= ins + n) break;
        const C = getCell(row, 'C');
        const ref = getCell(row, lastExisting.col);
        const st = ref ? ref.s : undefined;
        if (row.r === 1) { for (const p of newPlayers) setCell(row, p.col, sAttr(st)); continue; }
        if (row.r === 2) { for (const p of newPlayers) setCell(row, p.col, sAttr(st) + ' t="inlineStr"', `<is><t>${esc(p.name)}</t></is>`); continue; }
        if (!C) continue;
        if (typeof C.val === 'number') { if (blockStart == null) blockStart = row.r; for (const p of newPlayers) setCell(row, p.col, sAttr(st) + ' t="s"', `<v>${iDash}</v>`); }
        else if (C.val === T_SUBTOTAL) {
          subRow = row.r;
          for (const p of newPlayers) { const a = `${p.col}${blockStart}`, b = `${p.col}${row.r - 1}`; setCell(row, p.col, sAttr(st) + ' t="str"', `<f>IF(SUM(${a}:${b})=0,"-",SUM(${a}:${b}))</f><v>-</v>`); }
        } else if (C.val === T_AVG) {
          for (const p of newPlayers) setCell(row, p.col, sAttr(st) + ' t="str"', `<f>IF(${p.col}${subRow}="-","-",${p.col}${subRow}/MAX($C${blockStart}:$C${subRow - 1}))</f><v>-</v>`);
          blockStart = null; subRow = null;
        }
      }
    }

    // 3) 新場次的列
    const newRows = [];
    const scoreOf = (p, i) => { const a = input.scores[p.name]; const v = a ? a[i] : null; return v == null ? null : v; };
    const subTot = {};
    for (let i = 0; i < N; i++) {
      const r = g1 + i, row = { r, attrs: '', cells: [] };
      if (i === 0) {
        setCell(row, 'A', sAttr(sA1) + ' t="inlineStr"', `<is><t>${esc(input.no)}</t></is>`);
        setCell(row, 'B', sAttr(sB), `<v>${dateSerial}</v>`);
      } else { setCell(row, 'A', sAttr(sA2)); setCell(row, 'B', sAttr(sB)); }
      setCell(row, 'C', sAttr(sC), `<v>${i + 1}</v>`);
      for (const p of players) {
        const v = scoreOf(p, i);
        if (v == null) setCell(row, p.col, sAttr(sP) + ' t="s"', `<v>${iDash}</v>`);
        else { setCell(row, p.col, sAttr(sP), `<v>${v}</v>`); subTot[p.name] = (subTot[p.name] || 0) + v; }
      }
      newRows.push(row);
    }
    const rowSub = { r: rSub, attrs: '', cells: [] }, rowAvg = { r: rAvg, attrs: '', cells: [] };
    for (const rw of [rowSub, rowAvg]) { setCell(rw, 'A', sAttr(sA2)); setCell(rw, 'B', sAttr(sB)); }
    setCell(rowSub, 'C', sAttr(sSubC) + ' t="s"', `<v>${iSub}</v>`);
    setCell(rowAvg, 'C', sAttr(sAvgC) + ' t="s"', `<v>${iAvg}</v>`);
    for (const p of players) {
      const a = `${p.col}${g1}`, b = `${p.col}${gN}`, tot = subTot[p.name];
      if (tot) setCell(rowSub, p.col, sAttr(sSubP), `<f>IF(SUM(${a}:${b})=0,"-",SUM(${a}:${b}))</f><v>${tot}</v>`);
      else setCell(rowSub, p.col, sAttr(sSubP) + ' t="str"', `<f>IF(SUM(${a}:${b})=0,"-",SUM(${a}:${b}))</f><v>-</v>`);
      const f = `<f>IF(${p.col}${rSub}="-","-",${p.col}${rSub}/MAX($C${g1}:$C${gN}))</f>`;
      if (tot) setCell(rowAvg, p.col, sAttr(sAvgP), `${f}<v>${tot / N}</v>`);
      else setCell(rowAvg, p.col, sAttr(sAvgP) + ' t="str"', `${f}<v>-</v>`);
    }
    newRows.push(rowSub, rowAvg);
    p1.rows.push(...newRows);

    // 4) 總計 / 總平均
    const rTot = L.totalRow + n, rTotAvg = L.totalAvgRow + n;
    const tRow = p1.rows.find(x => x.r === rTot), tAvgRow = p1.rows.find(x => x.r === rTotAvg);
    const fText = c => ((c.inner.match(/<f[^>]*>([\s\S]*?)<\/f>/) || [])[1]) || '';
    for (const p of players) {
      const col = p.col;
      if (p.isNew) {
        setCell(tRow, col, sAttr(sty(tRow, lastExisting.col)), `<f>SUMIF($C3:$C${E},"${T_SUBTOTAL}",${col}3:${col}${E})</f><v>${subTot[p.name] || 0}</v>`);
        const cnt = scoreCount(input, p, N);
        const v = cnt ? `<v>${(subTot[p.name] || 0) / cnt}</v>` : '';
        setCell(tAvgRow, col, sAttr(sty(tAvgRow, lastExisting.col)), `<f>${col}${rTot}/COUNT(C${g1}:C${gN})</f>${v}`);
        continue;
      }
      if (!partNames.has(p.name)) continue;
      const ct = getCell(tRow, col), ca = getCell(tAvgRow, col);
      if (!ct || !ca) continue;
      const oldTotal = typeof ct.val === 'number' ? ct.val : null, oldAvg = typeof ca.val === 'number' ? ca.val : null;
      const add = subTot[p.name] || 0, cnt = scoreCount(input, p, N);
      const newTotal = oldTotal != null ? oldTotal + add : null;
      const oldCount = (oldTotal != null && oldAvg) ? Math.round(oldTotal / oldAvg) : null;
      const newAvg = (newTotal != null && oldCount != null) ? newTotal / (oldCount + cnt) : null;
      setCell(tRow, col, sAttr(ct.s), `<f>${fText(ct)}+SUMIF($C${g1}:$C${rSub},"${T_SUBTOTAL}",${col}${g1}:${col}${rSub})</f>${newTotal != null ? `<v>${newTotal}</v>` : ''}`);
      const oldF = fText(ca).replace(/\)\s*$/, '').replace(new RegExp('^' + col + '\\d+/'), col + rTot + '/');
      setCell(tAvgRow, col, sAttr(ca.s), `<f>${oldF},C${g1}:C${gN})</f>${newAvg != null ? `<v>${newAvg}</v>` : ''}`);
    }

    // 5) 合併儲存格 / 尺寸
    let tail = p1.tail;
    const merges = [`A${g1}:A${E}`, `B${g1}:B${E}`];
    tail = addMerges(tail, merges, newPlayers.length ? { from: `D1:${lastExisting.col}1`, to: `D1:${numToCol(lastCol)}1` } : null);
    let head = p1.head.replace(/<dimension ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/, (m, a, b, c, d) =>
      `<dimension ref="${a}${b}:${numToCol(Math.max(colToNum(c), lastCol))}${+d + n}"/>`);
    p1.head = head; p1.tail = tail;
    zip.file(wbCtx.main.path, buildSheet(p1));

    /* ===== 圖表工作表 ===== */
    if (wbCtx.chart) {
      const x2 = await zip.file(wbCtx.chart.path).async('string');
      const p2 = parseSheet(x2, sst);
      const gameRows = p2.rows.filter(r => { const c = getCell(r, 'C'); return r.r >= 3 && c && typeof c.val === 'number'; });
      const lastR = Math.max(...gameRows.map(r => r.r));
      const lastRowObj = p2.rows.find(r => r.r === lastR);
      const startR = lastR + 1, endR = lastR + N;
      const jc = lastExisting.col;
      const naInner = '<f>NA()</f><v>#N/A</v>';
      if (newPlayers.length) {
        for (const row of p2.rows) {
          if (row.r === 1) { for (const p of newPlayers) setCell(row, p.col, sAttr(sty(row, jc))); }
          else if (row.r === 2) { for (const p of newPlayers) setCell(row, p.col, sAttr(sty(row, jc)) + ' t="inlineStr"', `<is><t>${esc(p.name)}</t></is>`); }
          else if (row.r >= 3 && row.r <= lastR && getCell(row, 'C')) { for (const p of newPlayers) setCell(row, p.col, sAttr(sty(row, jc)) + ' t="e"', naInner); }
        }
      }
      const firstOfLast = lg2(p2, lastR);
      const sa1b = sty(firstOfLast, 'A'), sa2 = sty(lastRowObj, 'A'), sb = sty(lastRowObj, 'B'), sc = sty(lastRowObj, 'C'), sp = sty(lastRowObj, jc);
      for (let i = 0; i < N; i++) {
        const r = startR + i, row = { r, attrs: '', cells: [] };
        if (i === 0) { setCell(row, 'A', sAttr(sa1b) + ' t="inlineStr"', `<is><t>${esc(input.no)}</t></is>`); setCell(row, 'B', sAttr(sb), `<v>${dateSerial}</v>`); }
        else { setCell(row, 'A', sAttr(sa2)); setCell(row, 'B', sAttr(sb)); }
        setCell(row, 'C', sAttr(sc), `<v>${i + 1}</v>`);
        for (const p of players) {
          const v = scoreOf(p, i);
          if (v == null) setCell(row, p.col, sAttr(sp) + ' t="e"', naInner); else setCell(row, p.col, sAttr(sp), `<v>${v}</v>`);
        }
        p2.rows.push(row);
      }
      p2.tail = addMerges(p2.tail, [`A${startR}:A${endR}`, `B${startR}:B${endR}`], null);
      p2.head = p2.head.replace(/<dimension ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/, (m, a, b, c, d) =>
        `<dimension ref="${a}${b}:${numToCol(Math.max(colToNum(c), lastCol))}${Math.max(+d, endR)}"/>`);
      zip.file(wbCtx.chart.path, buildSheet(p2));
      // 圖表資料範圍延伸到新的最後一列
      for (const f of Object.keys(zip.files)) {
        if (!/^xl\/charts\/chart\d+\.xml$/.test(f)) continue;
        const cx = await zip.file(f).async('string');
        const re = new RegExp(`(${CHART_SHEET}!\\$[A-Z]+\\$\\d+:\\$[A-Z]+\\$)${lastR}\\b`, 'g');
        const nx = cx.replace(re, `$1${endR}`);
        if (nx !== cx) zip.file(f, nx);
      }
    }

    /* ===== 移除 calcChain、要求開啟時重算 ===== */
    if (zip.file('xl/calcChain.xml')) {
      zip.remove('xl/calcChain.xml');
      let ct = await zip.file('[Content_Types].xml').async('string');
      ct = ct.replace(/<Override[^>]*PartName="\/xl\/calcChain.xml"[^>]*\/>/, '');
      zip.file('[Content_Types].xml', ct);
      let rl = await zip.file('xl/_rels/workbook.xml.rels').async('string');
      rl = rl.replace(/<Relationship\s[^>]*calcChain[^>]*\/>/, '');
      zip.file('xl/_rels/workbook.xml.rels', rl);
    }
    let wbx = await zip.file('xl/workbook.xml').async('string');
    wbx = /<calcPr[^>]*\/>/.test(wbx)
      ? wbx.replace(/<calcPr([^>]*?)\/>/, (m, a) => /fullCalcOnLoad/.test(a) ? m : `<calcPr${a} fullCalcOnLoad="1"/>`)
      : wbx.replace('</workbook>', '<calcPr fullCalcOnLoad="1"/></workbook>');
    zip.file('xl/workbook.xml', wbx);

    return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  function scoreCount(input, p, N) { return (input.scores[p.name] || []).slice(0, N).filter(v => v != null).length; }
  // 找出圖表頁最後一場的第一列 (A 欄有值者)
  function lg2(p2, lastR) {
    for (let r = lastR; r >= 3; r--) { const row = p2.rows.find(x => x.r === r); const a = row && getCell(row, 'A'); if (a && a.inner) return row; }
    return p2.rows.find(x => x.r === lastR);
  }
  function addMerges(tail, refs, replaceHeader) {
    if (replaceHeader) tail = tail.replace(`<mergeCell ref="${replaceHeader.from}"/>`, `<mergeCell ref="${replaceHeader.to}"/>`);
    return tail.replace(/<mergeCells count="(\d+)">([\s\S]*?)<\/mergeCells>/, (m, cnt, inner) =>
      `<mergeCells count="${+cnt + refs.length}">${inner}${refs.map(r => `<mergeCell ref="${r}"/>`).join('')}</mergeCells>`);
  }

  root.BowlingCore = { open, stats, flatten, addSession, isoOf, numToCol, colToNum };
  if (typeof module !== 'undefined') module.exports = root.BowlingCore;
})(typeof window !== 'undefined' ? window : globalThis);
