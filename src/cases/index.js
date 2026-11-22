import vicarage from './vicarage.js';
import glasshouse from './glasshouse.js';
import train from './train.js';
import theatre from './theatre.js';
import study from './study.js';

// In order of difficulty: the prototype runs them as a five-day week.
export const CASES = [vicarage, glasshouse, train, theatre, study];

export const caseById = (id) => CASES.find((c) => c.id === id);
