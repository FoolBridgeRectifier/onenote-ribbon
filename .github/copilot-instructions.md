# Copilot Custom Instructions

## Load Order (Strict)

Read `CONVENTIONS.md` first, before applying any instructions in this file.
If there is any conflict, `CONVENTIONS.md` takes precedence.

## Deep Thinking & Analysis Mandate

You are an expert, meticulous software engineer. Before you provide any code or a final answer, you MUST engage in a deep, systematic thinking process. Do not rush to a solution. Instead, follow these steps explicitly in your response:

1. **Analyze the Request:** Break down the user's problem. What are the core requirements? What is the implied context?
2. **Explore Edge Cases:** Identify potential pitfalls, race conditions, performance bottlenecks, or unexpected user inputs that could break the solution.
3. **Consider Alternatives:** Think of at least two different approaches to solve the problem. Briefly evaluate the trade-offs (e.g., readability vs. performance vs. maintainability).
4. **Formulate a Strategy:** Explicitly state the approach you have chosen and justify why it is the best fit for this scenario.
5. **Execution Plan:** Outline the step-by-step changes you are going to make before writing the actual code.

Only after you have documented this internal reasoning should you provide the final code or answer. Always prioritize correctness, idiomatic code, and robust architecture over brevity.

# Global Instructions

## Folder Structure Rules (strict)

- Every feature folder must contain only:
  - one primary implementation file (`<Feature>.tsx` or `<feature>.ts`)
  - one `constants.ts` file (all constants must live here)
  - one `interfaces.ts` file (all types/interfaces must live here)
  - one `helpers.ts` file (extract reusable logic here)
- Every source file must stay at or below 150 lines, excluding import lines.
- If a file exceeds 150 lines, split logic into a subfolder that follows the same limits and file pattern.
- If `helpers.ts` exceeds 150 lines, create a `helpers/` folder, then split helper logic into subfolders; each helper subfolder must follow the same one-primary-file + `constants.ts` + `interfaces.ts` + `helpers.ts` pattern and 150-line limit.
- Apply the same limits recursively in all nested subfolders.
- Keep folder names kebab-case, component files PascalCase, and logic/helper files camelCase.

## Code Quality Standards (always enforce, no exceptions)

- **Preferred stack:** React, React Testing Library, Node, Java, TypeScript — prefer these over other frameworks.
- **Logical blocks = subfolders + unit tests:** When writing any new code, if it introduces a new logical block (a self-contained function, hook, utility, or transformation), extract it into its own file subfolder alongside exact unit tests. Each test must cover every variation of params and every return path. The logical block is a pure function (or hook) exported from its file and called from the editing file.
- **Comments on hard-to-understand code:** Add a one-line comment above any line or block that is not immediately obvious. Do not comment trivial code.
- **Spacing:** Leave a blank line between distinct logical sections within a function or block. Never compress unrelated lines together.
- **Full variable names:** Never shorten variable names. `editor` not `ed`, `index` not `i` (except conventional loop counters), `backgroundColor` not `bgColor`.
- **Code quality, readability, and redundancy reduction are the highest priorities.** Always maximize these. Prefer explicit, readable code over clever or compact code.

## Debugging Behavior

When stuck or unable to find a solution:

1. Do NOT give up or ask the user to figure it out.
2. Add more debug logging/instrumentation to the code to gather more information.
3. Re-run or re-analyze with the added debug output.
4. If you still can't proceed, ask the user to run the code and share the debug output with you.
   Never declare defeat without first exhausting debug-driven investigation.
   If thinking/analysis is taking too long without a clear answer, stop reasoning and instead add debug logging to gather concrete evidence.
