/**
 * Conservative CSS minifier (no dependencies). It only removes what cannot change how CSS parses:
 * comments, runs of whitespace, spaces next to `{ } ; , >`, spaces just inside `( )`, and the last
 * `;` of a block. Strings and url(...) are copied as they are. Spaces before `(` stay (`and (` in
 * media queries must not become a function), and so do spaces around `+`, `-`, `*` and `:`.
 */
const DROP_AFTER = new Set(['{', '}', ';', ',', '>', '(']);
const DROP_BEFORE = new Set(['{', '}', ';', ',', '>', ')']);

export function minifyCss(css) {
  let out = '';
  let pendingSpace = false;
  let i = 0;
  const n = css.length;
  const emit = (text) => {
    if (pendingSpace && out && !DROP_AFTER.has(out.at(-1)) && !DROP_BEFORE.has(text[0])) out += ' ';
    pendingSpace = false;
    out += text;
  };
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
      pendingSpace = true;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && css[j] !== c) j += css[j] === '\\' ? 2 : 1;
      emit(css.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (/\s/.test(c)) {
      while (i < n && /\s/.test(css[i])) i++;
      pendingSpace = true;
      continue;
    }
    if (c === '}' && out.at(-1) === ';') out = out.slice(0, -1);
    if (/^url\(/i.test(css.slice(i, i + 4))) {
      const end = css.indexOf(')', i);
      const inner = css.slice(i + 4, end).trim();
      // Quoted urls are handled as strings; unquoted ones are copied whole.
      if (!inner.startsWith('"') && !inner.startsWith("'")) {
        emit(css.slice(i, end + 1));
        i = end + 1;
        continue;
      }
    }
    emit(c);
    i++;
  }
  return out.trim();
}
