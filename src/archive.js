// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { LAUNCH } from './daily.js';

const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateName = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' });
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const results = {
  won: { mark: '★', label: 'Solved' },
  lost: { mark: '×', label: 'Out of pennies' },
  play: { mark: '•', label: 'In play' }
};

// Build just the visible month. The caller can read each day's save without composing the case.
export function archiveCalendar({ month, today, selected, statusFor }) {
  const [year, number] = month.split('-').map(Number);
  const monthStart = new Date(Date.UTC(year, number - 1, 1));
  const dayCount = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const previous = new Date(Date.UTC(year, number - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(year, number, 1)).toISOString().slice(0, 7);
  const cells = Array(monthStart.getUTCDay()).fill('<td></td>');
  const seen = new Set();

  for (let day = 1; day <= dayCount; day++) {
    const date = new Date(Date.UTC(year, number - 1, day));
    const iso = date.toISOString().slice(0, 10);
    if (iso < LAUNCH || iso > today) {
      cells.push(`<td><span class="archive-unavailable">${day}</span></td>`);
      continue;
    }
    const status = statusFor(iso);
    const result = Object.hasOwn(results, status) ? results[status] : null;
    if (result) seen.add(status);
    const label = [dateName.format(date), iso === today && 'today', iso === selected && 'open edition',
      result?.label || 'Not played'].filter(Boolean).join(', ');
    cells.push(`<td><button type="button" class="plain archive-day${iso === selected ? ' is-selected' : ''}"
      data-date="${iso}"${iso === today ? ' aria-current="date"' : ''} aria-label="${label}" title="${label}">
      ${day}${result ? `<span aria-hidden="true" class="archive-mark is-${status}">${result.mark}</span>` : ''}
    </button></td>`);
  }
  while (cells.length % 7) cells.push('<td></td>');
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
  const key = Object.entries(results).filter(([status]) => seen.has(status)).map(([status, result]) =>
    `<span><b class="is-${status}" aria-hidden="true">${result.mark}</b> ${result.label}</span>`).join('');

  return `<h3 id="archive-title">Archive</h3>
    <div class="archive-nav">
      <button type="button" class="plain" aria-label="Previous month" data-month="${previous}"${previous < LAUNCH.slice(0, 7) ? ' disabled' : ''}>‹</button>
      <h4 id="archive-month" aria-live="polite">${monthName.format(monthStart)}</h4>
      <button type="button" class="plain" aria-label="Next month" data-month="${next}"${next > today.slice(0, 7) ? ' disabled' : ''}>›</button>
    </div>
    <table class="archive-calendar" aria-labelledby="archive-month">
      <thead><tr>${weekdays.map(name => `<th scope="col" abbr="${name}">${name.slice(0, 2)}</th>`).join('')}</tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
    ${key ? `<p class="archive-key">${key}</p>` : ''}`;
}
