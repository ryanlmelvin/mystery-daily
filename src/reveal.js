// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only

function pause(ms, signal) {
  return new Promise((resolve) => {
    function finish() {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    }
    const timer = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
}

// Size the slots with their answers from the outset so later tiles never reflow
// a half-read sentence. Only the display changes as each word lands. `onSeat` is told
// as each tile lands (the cabinet makes a noise).
export async function revealSolution(plates, signal, { onSeat = () => {} } = {}) {
  if (signal.aborted) return;
  const reading = plates.ownerDocument.getElementById('reveal-reading');
  plates.classList.add('revealing');
  for (const slot of plates.querySelectorAll('.slot')) slot.setAttribute('aria-hidden', 'true');

  let beat = 450;
  for (const panel of plates.querySelectorAll('[data-panel]')) {
    const slots = panel.querySelectorAll('.slot');
    for (const slot of slots) {
      await pause(beat, signal);
      if (signal.aborted) return;
      slot.removeAttribute('aria-hidden');
      slot.classList.add('seated');
      onSeat();
      beat = 700;
    }
    if (reading) {
      const sentence = panel.querySelector('p')?.textContent
        ?? Array.from(slots, (slot) => slot.getAttribute('aria-label')).join('. ');
      reading.textContent = `${panel.querySelector('h3').textContent}. ${sentence}`;
    }
    beat = 1600;
  }
  await pause(4000, signal);
}
