/** MD type → HTML element mapping for downgrade logic (R20). */
export const MD_TO_HTML_ELEMENT: Readonly<Record<string, string>> = { bold: 'b', italic: 'i', strikethrough: 's' };

/** HTML element → MD delimiter mapping for downgrade logic (R20). */
export const HTML_TO_MD_DELIM: Readonly<Record<string, string>> = { b: '**', i: '*', s: '~~' };
