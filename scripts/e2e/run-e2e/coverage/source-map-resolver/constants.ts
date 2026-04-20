export const VLQ_BASE_SHIFT = 5;
export const VLQ_BASE_MASK = (1 << VLQ_BASE_SHIFT) - 1;
export const VLQ_CONTINUATION_BIT = 1 << VLQ_BASE_SHIFT;

// All Base64 characters used in VLQ encoding
export const VLQ_BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Pre-built decode map for O(1) character lookup
export const VLQ_BASE64_DECODE: Map<string, number> = new Map();

for (let index = 0; index < VLQ_BASE64_CHARS.length; index++) {
  VLQ_BASE64_DECODE.set(VLQ_BASE64_CHARS[index], index);
}
