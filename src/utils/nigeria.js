import { nigeriaStates } from './nigeriaStates';

/* Keys in the reference list are compact ("AkwaIbom"); show them spaced. */
const DISPLAY_OVERRIDES = { FCT: 'FCT' };
const toDisplay = (key) => DISPLAY_OVERRIDES[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2');

/** [{ value: 'Akwa Ibom', key: 'AkwaIbom' }, …] sorted alphabetically. */
export const STATE_OPTIONS = Object.keys(nigeriaStates)
  .map((key) => ({ key, value: toDisplay(key) }))
  .sort((a, b) => a.value.localeCompare(b.value));

const normalise = (s) => String(s ?? '').replace(/[\s-]+/g, '').toLowerCase();

/** LGAs for a state, matched loosely ("Akwa Ibom", "AkwaIbom" and "akwa-ibom" all work). */
export const lgasFor = (state) => {
  const key = Object.keys(nigeriaStates).find((k) => normalise(k) === normalise(state));
  return key ? nigeriaStates[key] : [];
};
