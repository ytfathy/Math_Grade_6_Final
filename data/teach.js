/* "Teach me" lesson explanations, keyed by lesson code (the code before the lesson name, e.g. M4.2).
   A lesson gets a Teach me button only when it has an entry here. */
(function () {
/* Column multiplication: rows are right-aligned strings; '—' draws a rule. */
function MUL(rows, note) {
  return `<div class="tw-mul" role="img" aria-label="${note}">${rows.map(r => r === '—' ? '<i class="rule"></i>' : `<span>${r}</span>`).join('')}</div>`;
}
/* Long division of a decimal dividend (zeros already annexed) by a whole-number divisor, worked digit by digit.
   opts: annexFrom (column where annexed zeros start), more (pattern repeats), label. */
function LD(dividend, divisor, opts = {}) {
  const cols = dividend.split(''), dot = cols.indexOf('.'), n = cols.length;
  const digitCols = cols.map((c, i) => c === '.' ? -1 : i).filter(i => i >= 0);
  const blank = () => Array(n).fill('');
  const place = (val, end) => { const row = blank(), s = String(val); let k = digitCols.indexOf(end); for (let j = s.length - 1; j >= 0 && k >= 0; j--, k--) row[digitCols[k]] = s[j]; return row; };
  const unitsCol = dot >= 0 ? digitCols.filter(i => i < dot).pop() : digitCols[digitCols.length - 1];
  const q = blank(); if (dot >= 0) q[dot] = '.';
  const rows = []; let cur = 0, started = false;
  digitCols.forEach((c, k) => {
    if (!started) cur = cur * 10 + +cols[c];          // after starting, the value was brought down already
    const d = Math.floor(cur / divisor);
    if (!started && d === 0) { if (c === unitsCol) q[c] = '0'; return; }
    started = true; q[c] = String(d);
    const prod = d * divisor; rows.push({ cells: place(prod, c), cls: 'ld-sub' });
    const rem = cur - prod, nx = digitCols[k + 1];
    if (nx === undefined) { rows.push({ cells: place(rem, c), cls: 'ld-rem' }); return; }
    cur = rem * 10 + +cols[nx]; rows.push({ cells: place(cur, nx), cls: 'ld-rem' });
  });
  const bar = new Set(opts.bar || []);
  const cell = (ch, i, extra = '') => `<td class="${i === dot ? 'ld-dt' : ''}${extra}">${ch}</td>`;
  let h = `<table class="tw-ld" role="img" aria-label="${opts.label || 'Long division'}"><tbody>`;
  h += `<tr class="ld-q"><td></td>${q.map((ch, i) => cell(ch, i, bar.has(i) ? ' ld-bar' : '')).join('')}${opts.more ? '<td class="ld-more">…</td>' : ''}</tr>`;
  h += `<tr class="ld-d"><td class="ld-dv">${divisor}</td>${cols.map((ch, i) => cell(ch, i, (i === 0 ? ' ld-br' : '') + ' ld-top' + (opts.annexFrom !== undefined && i >= opts.annexFrom ? ' ld-ax' : ''))).join('')}</tr>`;
  rows.forEach(r => { h += `<tr class="${r.cls}"><td>${r.cls === 'ld-sub' ? '−' : ''}</td>${r.cells.map((ch, i) => cell(ch, i)).join('')}</tr>`; });
  return h + '</tbody></table>';
}
/* 10 × 10 grid = 1 whole; shades a rectangle `cols` tenths wide and `rows` tenths tall. */
function GRID(cols, rows) {
  const c = 26, o = 40; let s = '';
  for (let r = 0; r < 10; r++) for (let k = 0; k < 10; k++) s += `<rect x="${o + k * c}" y="${o + r * c}" width="${c}" height="${c}" class="${k < cols && r < rows ? 'on' : ''}"/>`;
  return `<svg class="tw-grid" viewBox="0 0 ${o + 10 * c + 10} ${o + 10 * c + 10}" role="img" aria-label="10 by 10 grid with a ${cols} by ${rows} rectangle shaded: ${cols * rows} hundredths">${s}
    <text x="${o + cols * c / 2}" y="${o - 12}" text-anchor="middle">0.${cols}</text><text x="${o - 8}" y="${o + rows * c / 2 + 6}" text-anchor="end">0.${rows}</text>
    <rect x="${o}" y="${o}" width="${cols * c}" height="${rows * c}" class="edge"/></svg>`;
}
const step = (n, t) => `<li><span class="tw-n">${n}</span><div>${t}</div></li>`;
const ex = (title, body) => `<section class="tw-card"><h3>${title}</h3>${body}</section>`;

window.TEACH = {
  'M4.2': {
    title: 'Multiplying decimals',
    html:
      ex('How do you multiply two decimals?', `<p>To multiply two decimals, follow these steps:</p>
        <ol class="tw-steps">${step(1, 'Multiply as you would with whole numbers.')}${step(2, 'Count the total number of decimal places in <b>both</b> factors.')}${step(3, 'Move the decimal point in the product one place to the left for each decimal place you counted.')}</ol>
        <p>Let's try it with <b>0.46 × 0.3</b>.</p>
        <p>First, multiply as you would with whole numbers: 46 × 3. (6 × 3 = 18, write 8 and carry the 1; 4 × 3 = 12, plus the 1 = 13.)</p>
        ${MUL(['<sup class="tw-carry">1</sup>&nbsp;', '0.46', '× 0.3', '—', '138'], '46 times 3 equals 138')}
        <p>Now, count the number of decimal places in your factors.</p>
        <ul class="tw-list"><li><b>0.46</b> has <b>2</b> decimal places.</li><li><b>0.3</b> has <b>1</b> decimal place.</li></ul>
        <p>That's 2 + 1 = <b>3</b> decimal places in the factors. So, move the decimal point in the product <b>3</b> places to the left.</p>
        ${MUL(['0.46', '× 0.3', '—', '.138'], '138 becomes .138')}
        <p class="tw-ans">So, 0.46 × 0.3 = <b>0.138</b>!</p>`) +
      ex('Multiplying decimals with grids', `<p>You can use grids to show decimal multiplication. Let's try it with <b>0.3 × 0.5</b>.</p>
        <p>Use a grid to show a rectangle with side lengths 0.3 and 0.5. Each side of the big square is one unit long.</p>
        ${GRID(3, 5)}
        <p>The area of the shaded rectangle is the product 0.3 × 0.5.</p>
        <p>There are <b>100</b> small squares on the grid. So, each small square has an area of <b>0.01</b>, or 1 hundredth.</p>
        <p>The shaded rectangle contains <b>15</b> small squares. So, the area of the shaded rectangle is 15 hundredths, or <b>0.15</b>.</p>
        <p class="tw-ans">0.3 × 0.5 = <b>0.15</b>!</p>`) +
      ex('Multiplying a decimal by a whole number', `<p>To multiply a decimal number by a whole number, follow these steps:</p>
        <ol class="tw-steps">${step(1, 'Multiply as you would with whole numbers.')}${step(2, 'Count the total number of decimal places in your factors.')}${step(3, 'Move the decimal point in the product one place to the left for each decimal place you counted.')}</ol>`) +
      ex('Multiplying decimals by 1-digit whole numbers', `<p>Let's try it with <b>8.3 × 4</b>.</p>
        <p>First, multiply as you would with whole numbers: 83 × 4.</p>
        ${MUL(['83', '× 4', '—', '332'], '83 times 4 equals 332')}
        <p>Now, place the decimal point in your product. Count the number of decimal places in your factors.</p>
        <p><b>8.3</b> has <b>1</b> decimal place. So, move the decimal point <b>1</b> place to the left in your product: 332 → <b>33.2</b></p>
        <p class="tw-ans">So, 8.3 × 4 = <b>33.2</b>!</p>`) +
      ex('Multiplying decimals by 2-digit whole numbers', `<p>Let's try it with <b>0.14 × 23</b>.</p>
        <p>First, multiply as you would with whole numbers: 14 × 23.</p>
        ${MUL(['14', '× 23', '—', '42', '+ 280', '—', '322'], '14 times 23: 42 plus 280 equals 322')}
        <p>Now, place the decimal point in your product. Count the number of decimal places in your factors.</p>
        <p><b>0.14</b> has <b>2</b> decimal places. So, move the decimal point <b>2</b> places to the left in your product: 322 → <b>3.22</b></p>
        <p class="tw-ans">So, 0.14 × 23 = <b>3.22</b>!</p>`),
  },
  'M4.3': {
    title: 'Dividing multi-digit whole numbers',
    html:
      ex('How do you divide multi-digit whole numbers?', `<p>To divide a big number by a 2-digit or 3-digit number, use <b>long division</b>. Repeat these four steps until there are no more digits to bring down:</p>
        <ol class="tw-steps">${step(1, '<b>Divide:</b> How many times does the divisor go into the first digits of the dividend? Write that digit in the quotient.')}${step(2, '<b>Multiply:</b> Multiply that quotient digit by the divisor. Write the product under the digits you used.')}${step(3, '<b>Subtract:</b> Subtract to find what is left. The answer must be smaller than the divisor.')}${step(4, '<b>Bring down:</b> Bring down the next digit of the dividend, then start again at step 1.')}</ol>
        <p>Tip: remember the order with <b>D</b>ivide, <b>M</b>ultiply, <b>S</b>ubtract, <b>B</b>ring down.</p>`) +
      ex('Example: 9,828 ÷ 36', `<p>Let's try it with <b>9,828 ÷ 36</b>.</p>
        <p>36 does not go into 9, so look at the first two digits: <b>98</b>. Estimate: 36 is about 40, and 40 × 2 = 80, so try <b>2</b>.</p>
        ${LD('9828', 36, { label: '9828 divided by 36 equals 273' })}
        <ul class="tw-list"><li>98 ÷ 36 → <b>2</b>. 2 × 36 = 72. 98 − 72 = 26. Bring down the 2 → <b>262</b>.</li>
          <li>262 ÷ 36 → <b>7</b>. 7 × 36 = 252. 262 − 252 = 10. Bring down the 8 → <b>108</b>.</li>
          <li>108 ÷ 36 → <b>3</b>. 3 × 36 = 108. 108 − 108 = <b>0</b>. No remainder!</li></ul>
        <p class="tw-ans">So, 9,828 ÷ 36 = <b>273</b>!</p>
        <p>Check your answer by multiplying: 273 × 36 = 9,828 ✔</p>`) +
      ex('When the quotient has a zero', `<p>Let's try it with <b>4,896 ÷ 16</b>.</p>
        ${LD('4896', 16, { label: '4896 divided by 16 equals 306' })}
        <ul class="tw-list"><li>48 ÷ 16 → <b>3</b>. 3 × 16 = 48. 48 − 48 = 0. Bring down the 9 → <b>9</b>.</li>
          <li>16 does not go into 9, so write <b>0</b> in the quotient. 0 × 16 = 0. 9 − 0 = 9. Bring down the 6 → <b>96</b>.</li>
          <li>96 ÷ 16 → <b>6</b>. 6 × 16 = 96. 96 − 96 = <b>0</b>.</li></ul>
        <p>Don't skip the 0! Without it, you would get 36 instead of 306.</p>
        <p class="tw-ans">So, 4,896 ÷ 16 = <b>306</b>!</p>`),
  },
  'M4.4': {
    title: 'Dividing decimals',
    html:
      ex('How do you divide decimals?', `<p>When you divide by a decimal, first change the divisor to a whole number. Follow these steps:</p>
        <ol class="tw-steps">${step(1, 'Move the decimal point to the right to make the divisor a whole number. Move the decimal point the <b>same number of places</b> to the right in the dividend.')}${step(2, 'Place the decimal point in the quotient directly above the decimal point in the dividend.')}${step(3, 'Divide until there is no remainder, or until the quotient begins to repeat in a pattern. Annex (add) zeros if necessary.')}</ol>`) +
      ex('Example: 1.96 ÷ 0.5', `<p>Let's try it with <b>1.96 ÷ 0.5</b>.</p>
        <p>To make 0.5 a whole number, move the decimal point <b>1</b> place to the right. Remember to move the decimal point the same number of places in both the divisor and the dividend.</p>
        <div class="tw-shift"><span>1.96 ÷ 0.5</span><span class="arr">↓</span><span><b>19.6 ÷ 5</b></span></div>
        <p>Write the problem. Place the decimal point in the quotient. Divide until there is no remainder. You will need to annex a zero (shown in <span class="ax-k">orange</span>).</p>
        ${LD('19.60', 5, { annexFrom: 4, label: '19.6 divided by 5 equals 3.92' })}
        <p class="tw-ans">So, 1.96 ÷ 0.5 = <b>3.92</b>.</p>`) +
      ex('Repeating decimals', `<p>Some decimals keep going in a repeating pattern forever. If your quotient is one of these repeating decimals, you can stop once you see the repeating pattern. Otherwise, you could keep dividing forever!</p>
        <p>Let's try it with <b>0.3 ÷ 2.2</b>. Move the decimal point 1 place to the right in both the divisor and the dividend.</p>
        <div class="tw-shift"><span>0.3 ÷ 2.2</span><span class="arr">↓</span><span><b>3 ÷ 22</b></span></div>
        <p>Now, write the problem and start dividing. Add the decimal point after the 3 and annex some zeros. Remember to place your decimal point in the quotient. Keep annexing zeros until you see a repeating pattern.</p>
        ${LD('3.00000', 22, { annexFrom: 2, more: true, label: '3 divided by 22 equals 0.13636 and so on' })}
        <p>Notice how the <b>3</b> and <b>6</b> keep repeating: 0.1363636…</p>
        <p>You can write a repeating decimal by drawing a bar over the repeating digits: <b class="tw-rep">0.1<span class="ov">36</span></b></p>
        <p>The bar tells you that the digits 3 and 6 repeat forever.</p>
        <p class="tw-ans">So, 0.3 ÷ 2.2 = <b class="tw-rep">0.1<span class="ov">36</span></b>!</p>`),
  },
  'M4.5': {
    title: 'Order of operations with decimals',
    html:
      ex('How do you solve a problem with more than one operation?', `<p>When an expression has more than one operation, always work in this order:</p>
        <ol class="tw-steps">${step(1, '<b>Parentheses</b> first: work out what is inside ( ).')}${step(2, '<b>Multiply and divide</b> next, from left to right.')}${step(3, '<b>Add and subtract</b> last, from left to right.')}</ol>
        <p>Use the same decimal rules you already know: line up the decimal points to add or subtract, count decimal places to multiply, and make the divisor a whole number to divide.</p>`) +
      ex('Example: (4.5 + 3.2) × 2.4', `<p>Let's try it with <b>(4.5 + 3.2) × 2.4</b>.</p>
        <p>First, work out the <b>parentheses</b>. Line up the decimal points and add.</p>
        ${MUL(['4.5', '+ 3.2', '—', '7.7'], '4.5 plus 3.2 equals 7.7')}
        <p>Now, multiply: <b>7.7 × 2.4</b>. Multiply as whole numbers: 77 × 24 = 1,848.</p>
        ${MUL(['77', '× 24', '—', '308', '+ 1540', '—', '1848'], '77 times 24 equals 1848')}
        <p>7.7 has 1 decimal place and 2.4 has 1 decimal place. That's 2 decimal places, so 1848 → <b>18.48</b>.</p>
        <p class="tw-ans">So, (4.5 + 3.2) × 2.4 = <b>18.48</b>!</p>`) +
      ex('Example: 18.6 − 2.5 × 4.2', `<p>Let's try it with <b>18.6 − 2.5 × 4.2</b>. There are no parentheses, so <b>multiply first</b>.</p>
        <p>2.5 × 4.2 → 25 × 42 = 1,050. That's 2 decimal places → <b>10.50 = 10.5</b>.</p>
        <p>Now, subtract. Line up the decimal points.</p>
        ${MUL(['18.6', '− 10.5', '—', '8.1'], '18.6 minus 10.5 equals 8.1')}
        <p class="tw-ans">So, 18.6 − 2.5 × 4.2 = <b>8.1</b>!</p>
        <p>Careful! If you subtract first, (18.6 − 2.5) × 4.2 = 67.62. That is a different problem, so the answer is wrong.</p>`) +
      ex('Example: (12.8 − 4.3) ÷ 0.5', `<p>Let's try it with <b>(12.8 − 4.3) ÷ 0.5</b>.</p>
        <p>First, the <b>parentheses</b>: 12.8 − 4.3 = <b>8.5</b>.</p>
        <p>Now, divide: <b>8.5 ÷ 0.5</b>. Move the decimal point 1 place to the right in both numbers.</p>
        <div class="tw-shift"><span>8.5 ÷ 0.5</span><span class="arr">↓</span><span><b>85 ÷ 5</b></span></div>
        ${LD('85', 5, { label: '85 divided by 5 equals 17' })}
        <p class="tw-ans">So, (12.8 − 4.3) ÷ 0.5 = <b>17</b>!</p>`),
  },
};
window.TW = { MUL, LD, GRID };   // shared with the infographics
})();
