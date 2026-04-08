export interface TagDef {
  label: string;
  icon: string;
  iconStyle: string;
  cmd: string;
}

export const ALL_TAGS: TagDef[] = [
  {
    label: "To Do",
    cmd: "tag-todo",
    icon: "✔",
    iconStyle: "background:#4472C4;color:#fff",
  },
  {
    label: "Important",
    cmd: "tag-important",
    icon: "★",
    iconStyle: "background:#F5A623;color:#fff",
  },
  {
    label: "Question",
    cmd: "tag-question",
    icon: "?",
    iconStyle: "background:#7030A0;color:#fff",
  },
  {
    label: "Remember for later",
    cmd: "tag-remember",
    icon: "🔔",
    iconStyle: "background:#ED7D31;color:#fff",
  },
  {
    label: "Definition",
    cmd: "tag-definition",
    icon: "📖",
    iconStyle: "background:#70AD47;color:#fff",
  },
  {
    label: "Highlight",
    cmd: "tag-highlight",
    icon: "✏",
    iconStyle: "background:#FFFF00;color:#333;border:1px solid #ccc",
  },
  {
    label: "Contact",
    cmd: "tag-contact",
    icon: "👤",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Address",
    cmd: "tag-address",
    icon: "🏠",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Phone number",
    cmd: "tag-phone",
    icon: "📞",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Web site to visit",
    cmd: "tag-website",
    icon: "🌐",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Idea",
    cmd: "tag-idea",
    icon: "💡",
    iconStyle: "background:#FFD700;color:#333",
  },
  {
    label: "Password",
    cmd: "tag-password",
    icon: "🔑",
    iconStyle: "background:#808080;color:#fff",
  },
  {
    label: "Critical",
    cmd: "tag-critical",
    icon: "!",
    iconStyle: "background:#FF0000;color:#fff",
  },
  {
    label: "Project A",
    cmd: "tag-project-a",
    icon: " ",
    iconStyle: "background:#FF6B6B",
  },
  {
    label: "Project B",
    cmd: "tag-project-b",
    icon: " ",
    iconStyle: "background:#FFD700",
  },
  {
    label: "Movie to see",
    cmd: "tag-movie",
    icon: "🎬",
    iconStyle: "background:#333;color:#fff",
  },
  {
    label: "Book to read",
    cmd: "tag-book",
    icon: "📚",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Music to listen to",
    cmd: "tag-music",
    icon: "♪",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Source for article",
    cmd: "tag-source",
    icon: "🔍",
    iconStyle: "background:#808080;color:#fff",
  },
  {
    label: "Remember for blog",
    cmd: "tag-blog",
    icon: "📝",
    iconStyle: "background:#333;color:#fff",
  },
  {
    label: "Discuss with A",
    cmd: "tag-discuss-a",
    icon: "💬",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Discuss with B",
    cmd: "tag-discuss-b",
    icon: "💬",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Discuss w/ manager",
    cmd: "tag-discuss-mgr",
    icon: "💬",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Send in email",
    cmd: "tag-email",
    icon: "✉",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Schedule meeting",
    cmd: "tag-meeting",
    icon: "📅",
    iconStyle: "background:#4472C4;color:#fff",
  },
  {
    label: "Call back",
    cmd: "tag-call",
    icon: "📞",
    iconStyle: "background:#70AD47;color:#fff",
  },
  {
    label: "To Do priority 1",
    cmd: "tag-todo-p1",
    icon: "✔",
    iconStyle: "background:#4472C4;color:#fff",
  },
  {
    label: "To Do priority 2",
    cmd: "tag-todo-p2",
    icon: "✔",
    iconStyle: "background:#4472C4;color:#fff",
  },
];

export const TAG_CMD_TO_DEF: Record<string, TagDef> = {};
for (const t of ALL_TAGS) TAG_CMD_TO_DEF[t.cmd] = t;

/** Map tag cmd → Markdown notation to insert/toggle. */
export function tagNotation(cmd: string): string {
  const map: Record<string, string> = {
    "tag-todo": "- [ ] ",
    "tag-todo-p1": "- [ ] 🔴 ",
    "tag-todo-p2": "- [ ] 🟡 ",
    "tag-important": "> [!important]\n> ",
    "tag-question": "> [!question]\n> ",
    "tag-remember": "> [!note] Remember for later\n> ",
    "tag-definition": "> [!info] Definition\n> ",
    "tag-highlight": "==",
    "tag-contact": "> [!tip] Contact\n> ",
    "tag-address": "> [!abstract] Address\n> ",
    "tag-phone": "> [!example] Phone\n> ",
    "tag-website": "> [!todo] Website\n> ",
    "tag-idea": "> [!tip] 💡 Idea\n> ",
    "tag-password": "> [!warning] Password\n> ",
    "tag-critical": "> [!danger] Critical\n> ",
    "tag-project-a": "> [!failure] Project A\n> ",
    "tag-project-b": "> [!bug] Project B\n> ",
    "tag-movie": "> [!note] 🎬 Movie to see\n> ",
    "tag-book": "> [!note] 📚 Book to read\n> ",
    "tag-music": "> [!note] ♪ Music\n> ",
    "tag-source": "> [!note] Source\n> ",
    "tag-blog": "> [!note] Blog\n> ",
    "tag-discuss-a": "> [!tip] Discuss with A\n> ",
    "tag-discuss-b": "> [!tip] Discuss with B\n> ",
    "tag-discuss-mgr": "> [!tip] Discuss with manager\n> ",
    "tag-email": "> [!todo] Send in email\n> ",
    "tag-meeting": "> [!todo] Schedule meeting\n> ",
    "tag-call": "> [!todo] Call back\n> ",
  };
  return map[cmd] ?? "";
}
