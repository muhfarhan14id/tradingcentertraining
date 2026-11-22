// Proxy harga nyata (Yahoo Finance chart endpoint, tanpa API key)
export default async function handler(req, res) {
  const { s = '', i = '1m', r = '1d', p } = req.query;
  if (!/^[A-Z0-9=\-^.]{3,12}$/.test(s)) return res.status(400).json({ error: 'bad symbol' });
  try {
    const u = `https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=${p ? '1d' : i}&range=${p ? '1d' : r}`;
    const f = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const c = (await f.json()).chart.result[0];
    res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate=10');
    if (p) return res.json({ price: c.meta.regularMarketPrice });
    const q = c.indicators.quote[0], t = c.timestamp || [], bars = [];
    t.forEach((x, k) => { if (q.close[k] != null) bars.push([x, q.open[k], q.high[k], q.low[k], q.close[k]]); });
    res.json({ price: c.meta.regularMarketPrice, bars });
  } catch (e) { res.status(502).json({ error: 'upstream' }); }
}
