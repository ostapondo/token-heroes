import { Agent } from '@platform';
import { token } from '@styled/tokens';

// Stacked bars keep this order, so neighbouring colours stay the ones checked side by side.
export const AGENT_ORDER: readonly Agent[] = [
  Agent.Codex,
  Agent.ClaudeCode,
  Agent.GeminiCli,
  Agent.QwenCode,
  Agent.OpenCode,
  Agent.KiloCode,
];

export const AGENT_COLOR: Readonly<Record<Agent, string>> = {
  [Agent.Codex]: token.var('colors.agent.codex'),
  [Agent.ClaudeCode]: token.var('colors.agent.claudeCode'),
  [Agent.GeminiCli]: token.var('colors.agent.geminiCli'),
  [Agent.QwenCode]: token.var('colors.agent.qwenCode'),
  [Agent.OpenCode]: token.var('colors.agent.openCode'),
  [Agent.KiloCode]: token.var('colors.agent.kiloCode'),
};

export const AGENT_LABEL = {
  [Agent.Codex]: 'agent.codex',
  [Agent.ClaudeCode]: 'agent.claude-code',
  [Agent.GeminiCli]: 'agent.gemini-cli',
  [Agent.QwenCode]: 'agent.qwen-code',
  [Agent.OpenCode]: 'agent.open-code',
  [Agent.KiloCode]: 'agent.kilo-code',
} as const;
