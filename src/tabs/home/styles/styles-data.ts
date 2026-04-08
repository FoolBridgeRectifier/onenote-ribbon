export interface StyleDef {
  label: string;
  style: string;
  prefix: string;
  suffix?: string;
}

export const STYLES_LIST: StyleDef[] = [
  {
    label: "Heading 1",
    style: "font-size:15px;font-weight:700;color:#5B9BD5;letter-spacing:-0.5px",
    prefix: "# ",
  },
  {
    label: "Heading 2",
    style: "font-size:13px;font-weight:700;color:#5B9BD5",
    prefix: "## ",
  },
  {
    label: "Heading 3",
    style: "font-size:12px;font-weight:700;color:#5B9BD5",
    prefix: "### ",
  },
  {
    label: "Heading 4",
    style: "font-size:12px;font-weight:700;font-style:italic;color:#5B9BD5",
    prefix: "#### ",
  },
  {
    label: "Heading 5",
    style: "font-size:11px;font-weight:700;color:#5B9BD5",
    prefix: "##### ",
  },
  {
    label: "Heading 6",
    style: "font-size:11px;font-style:italic;color:#5B9BD5",
    prefix: "###### ",
  },
  {
    label: "Page Title",
    style: "font-size:20px;font-weight:700;color:#fff",
    prefix: "# ",
  },
  {
    label: "Citation",
    style: "font-size:11px;color:#888;font-style:italic",
    prefix: "> ",
  },
  {
    label: "Quote",
    style: "font-size:12px;font-style:italic;color:#ccc",
    prefix: "> ",
  },
  {
    label: "Code",
    style:
      "font-family:monospace;font-size:11px;background:#222;padding:0 4px;color:#e0e0e0",
    prefix: "```\n",
    suffix: "\n```",
  },
  { label: "Normal", style: "font-size:12px;color:#e0e0e0", prefix: "" },
];
