/* "Infographic" posters: how to solve each lesson's type of problem, step by step, keyed by lesson code.
   A lesson gets an Infographic button only when it has an entry here. Uses MUL / LD drawings from teach.js. */
(function () {
const { MUL, LD } = window.TW || {};
const hl = t => `<span class="ig-hl">${t}</span>`;          // highlighted part of the example
const big = t => `<div class="ig-big">${t}</div>`;           // large expression line
const chips = a => `<div class="ig-chips">${a.map(c => `<span>${c}</span>`).join('')}</div>`;

window.INFO = {
  'M4.2': {
    title: 'How to multiply decimals',
    example: '4.8 × 3.5',
    steps: [
      { icon: '🙈', t: 'Ignore the decimal points', d: 'Write the numbers without their decimal points.',
        b: big(`4.8 × 3.5 <span class="ig-arr">→</span> ${hl('48 × 35')}`) },
      { icon: '✖️', t: 'Multiply like whole numbers', d: 'Use column multiplication.',
        b: MUL(['48', '× 35', '—', '240', '+ 1440', '—', '1680'], '48 times 35 equals 1680') },
      { icon: '🔢', t: 'Count the decimal places', d: 'Count the digits after the point in <b>both</b> factors and add them.',
        b: chips(['4.<b>8</b> → 1', '3.<b>5</b> → 1', 'Total = <b>2</b>']) },
      { icon: '⬅️', t: 'Move the point to the left', d: 'Move the decimal point left one place for each decimal place you counted.',
        b: big(`1680 <span class="ig-arr">→</span> 16.80 <span class="ig-arr">→</span> ${hl('16.8')}`) },
    ],
    warn: 'Do <b>not</b> line up the decimal points when you multiply. That rule is for adding and subtracting.',
    check: 'Estimate: 4.8 is about 5, and 5 × 3.5 = 17.5. That is close to 16.8 ✔',
    answer: '4.8 × 3.5 = 16.8',
  },
  'M4.3': {
    title: 'How to divide multi-digit whole numbers',
    example: '9,828 ÷ 36',
    loop: [1, 4],   // steps 2–5 repeat
    steps: [
      { icon: '📝', t: 'Set it up', d: 'The divisor goes outside the bracket, the dividend goes inside.',
        b: big(`<span class="ig-ld0"><b>36</b><span>9828</span></span>`) },
      { icon: '➗', t: 'Divide', d: 'How many times does 36 go into the first digits? 36 does not go into 9, so use 98.',
        b: big(`98 ÷ 36 → ${hl('2')}`) },
      { icon: '✖️', t: 'Multiply', d: 'Multiply the quotient digit by the divisor.',
        b: big(`2 × 36 = ${hl('72')}`) },
      { icon: '➖', t: 'Subtract', d: 'Subtract. The result must be <b>smaller</b> than the divisor.',
        b: big(`98 − 72 = ${hl('26')} <small>(26 &lt; 36 ✔)</small>`) },
      { icon: '⬇️', t: 'Bring down', d: 'Bring down the next digit, then go back to <b>Divide</b>. Stop when there are no digits left.',
        b: LD('9828', 36, { label: '9828 divided by 36 equals 273' }) },
    ],
    warn: 'If the divisor does not go in, write a <b>0</b> in the quotient. Never skip it! (4,896 ÷ 16 = 3<b>0</b>6)',
    check: 'Multiply back: 273 × 36 = 9,828 ✔',
    answer: '9,828 ÷ 36 = 273',
  },
  'M4.4': {
    title: 'How to divide decimals',
    example: '18.75 ÷ 2.5',
    steps: [
      { icon: '🎯', t: 'Make the divisor whole', d: 'Move the decimal point in the divisor to the right until it is a whole number.',
        b: big(`2.5 <span class="ig-arr">→</span> ${hl('25')} <small>(1 place right)</small>`) },
      { icon: '➡️', t: 'Move the dividend the same', d: 'Move the point in the dividend the <b>same</b> number of places.',
        b: big(`18.75 <span class="ig-arr">→</span> ${hl('187.5')} <small>(1 place right)</small>`) },
      { icon: '⬆️', t: 'Place the point in the quotient', d: 'Put the decimal point in the quotient straight above the point in the dividend.',
        b: big(`18.75 ÷ 2.5 <span class="ig-arr">→</span> ${hl('187.5 ÷ 25')}`) },
      { icon: '➗', t: 'Divide like whole numbers', d: 'Use long division. Annex zeros if you need more digits.',
        b: LD('187.5', 25, { label: '187.5 divided by 25 equals 7.5' }) },
    ],
    warn: 'Move the point the <b>same</b> number of places in both numbers. If the digits start repeating, stop and draw a bar over them.',
    check: 'Multiply back: 7.5 × 2.5 = 18.75 ✔',
    answer: '18.75 ÷ 2.5 = 7.5',
  },
  'M4.5': {
    title: 'How to use the order of operations with decimals',
    example: '2.4 × (4.5 + 3.2) − 6.8',
    steps: [
      { icon: '🔍', t: 'Look before you solve', d: 'Find the parentheses and every operation sign.',
        b: big(`2.4 ${hl('×')} ${hl('(')}4.5 ${hl('+')} 3.2${hl(')')} ${hl('−')} 6.8`) },
      { icon: '( )', t: 'Parentheses first', d: 'Work out what is inside the parentheses. Line up the points to add.',
        b: big(`${hl('4.5 + 3.2 = 7.7')}<br><span class="ig-sm">2.4 × 7.7 − 6.8</span>`) },
      { icon: '✖️➗', t: 'Then multiply and divide', d: 'Work from left to right. Count decimal places to multiply.',
        b: big(`${hl('2.4 × 7.7 = 18.48')}<br><span class="ig-sm">18.48 − 6.8</span>`) },
      { icon: '➕➖', t: 'Then add and subtract', d: 'Work from left to right. Line up the decimal points, and annex a zero if needed.',
        b: MUL(['18.48', '− 6.80', '—', '11.68'], '18.48 minus 6.80 equals 11.68') },
    ],
    warn: 'Multiply and divide <b>before</b> you add and subtract, even if the + or − comes first.',
    check: 'Estimate: 2.4 × 8 ≈ 19, and 19 − 7 = 12. That is close to 11.68 ✔',
    answer: '2.4 × (4.5 + 3.2) − 6.8 = 11.68',
  },
};
})();
