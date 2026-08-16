/**
 * Scopes internal <style> blocks in raw HTML to a specific container class.
 * Prevents blog post CSS from leaking into global site elements like Navbar and Footer.
 */
export function scopeBlogHtml(html: string, scopeClass: string = 'blog-article-content'): string {
  if (!html) return '';

  // Clean meta, title, link rel=stylesheet from body content if present
  const cleaned = html
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<title[^>]*>.*?<\/title>/gi, '')
    .replace(/<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '');

  // Scope <style> blocks
  return cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent: string) => {
    const scopedCss = scopeCssContent(cssContent, scopeClass);
    return `<style>${scopedCss}</style>`;
  });
}

function scopeCssContent(css: string, scopeClass: string): string {
  // Remove comments
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Helper to scope a list of selectors (comma-separated)
  const scopeSelectors = (selectorsStr: string): string => {
    return selectorsStr
      .split(',')
      .map(sel => {
        let s = sel.trim();
        if (!s) return '';

        // Handle root/body/html selectors
        if (/^(:root|html|body)$/i.test(s)) {
          return `.${scopeClass}`;
        }

        // Replace body/html at start of selector chain e.g. "body .hero"
        s = s.replace(/^(body|html)\b/i, `.${scopeClass}`);

        // Replace universal selector "*" e.g. "* {" -> ".blog-article-content * {"
        if (s === '*') {
          return `.${scopeClass} *`;
        }

        // If selector already contains the scopeClass, return as is
        if (s.includes(`.${scopeClass}`)) {
          return s;
        }

        return `.${scopeClass} ${s}`;
      })
      .filter(Boolean)
      .join(', ');
  };

  // Process CSS block structure (including @media rules)
  let result = '';
  let pos = 0;
  const len = noComments.length;

  while (pos < len) {
    const openBrace = noComments.indexOf('{', pos);
    if (openBrace === -1) {
      result += noComments.slice(pos);
      break;
    }

    const header = noComments.slice(pos, openBrace).trim();

    let braceCount = 1;
    let closeBrace = openBrace + 1;
    while (closeBrace < len && braceCount > 0) {
      if (noComments[closeBrace] === '{') braceCount++;
      else if (noComments[closeBrace] === '}') braceCount--;
      closeBrace++;
    }

    const body = noComments.slice(openBrace + 1, closeBrace - 1);

    if (header.startsWith('@media')) {
      const scopedMediaBody = scopeCssContent(body, scopeClass);
      result += `${header} {\n${scopedMediaBody}\n}\n`;
    } else if (header.startsWith('@keyframes') || header.startsWith('@font-face') || header.startsWith('@import')) {
      result += `${header} {${body}}\n`;
    } else if (header) {
      const scopedHeader = scopeSelectors(header);
      result += `${scopedHeader} {\n${body}\n}\n`;
    }

    pos = closeBrace;
  }

  return result;
}
