// src/lib/markdown.ts
//
// Conversor mínimo de Markdown para HTML.
// Suporta apenas o que usamos nos textos editoriais dos reports:
//   - **negrito**
//   - *itálico*
//   - <span class="bad">…</span> e <span class="good">…</span> (passa direto)
// Mantém a saída segura: escapa HTML que não seja marcação suportada.

const ALLOWED_SPAN_CLASSES = ['bad', 'good'];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function mdToHtml(text: string): string {
  // Primeiro, captura spans permitidos antes de escapar
  const placeholders: string[] = [];
  let safe = text.replace(
    /<span\s+class="(bad|good)">([^<]*)<\/span>/g,
    (_match, cls: string, content: string) => {
      if (!ALLOWED_SPAN_CLASSES.includes(cls)) return content;
      const idx = placeholders.length;
      placeholders.push(`<span class="${cls}">${escapeHtml(content)}</span>`);
      return `__SPAN_${idx}__`;
    }
  );

  // Escapa o resto
  safe = escapeHtml(safe);

  // Re-injeta spans
  safe = safe.replace(/__SPAN_(\d+)__/g, (_m, i: string) => placeholders[parseInt(i, 10)]);

  // Marcações simples
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Quebras de linha duplas viram parágrafos
  if (safe.includes('\n\n')) {
    safe = safe
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  } else {
    safe = safe.replace(/\n/g, '<br>');
  }

  return safe;
}
