import {
  CLI_FLAG_KEEP_VAULT,
  CLI_FLAG_LAUNCH,
  CLI_FLAG_PORT,
  CLI_FLAG_SUITE,
  DEFAULT_CDP_PORT,
} from '../../constants';

import type { ParsedCliArguments } from '../interfaces';

function getFlagValue(
  argumentsList: string[],
  flagName: string,
): string | null {
  const flagIndex = argumentsList.indexOf(flagName);

  if (flagIndex === -1) {
    return null;
  }

  const flagValue = argumentsList[flagIndex + 1];

  if (!flagValue || flagValue.startsWith('--')) {
    throw new Error(`Missing value for ${flagName}`);
  }

  return flagValue;
}

export function parseCliArguments(argumentsList: string[]): ParsedCliArguments {
  const portValue = getFlagValue(argumentsList, CLI_FLAG_PORT);
  const suiteValue = getFlagValue(argumentsList, CLI_FLAG_SUITE);

  const cdpPort = portValue ? Number.parseInt(portValue, 10) : DEFAULT_CDP_PORT;

  if (Number.isNaN(cdpPort)) {
    throw new Error(`Invalid value for ${CLI_FLAG_PORT}: ${portValue}`);
  }

  const suiteFilter = suiteValue
    ? suiteValue
        .split(',')
        .map((suiteName) => suiteName.trim())
        .filter(Boolean)
    : null;

  if (suiteValue && suiteFilter && suiteFilter.length === 0) {
    throw new Error(`Expected at least one suite name after ${CLI_FLAG_SUITE}`);
  }

  return {
    cdpPort,
    keepVault: argumentsList.includes(CLI_FLAG_KEEP_VAULT),
    launchFresh: argumentsList.includes(CLI_FLAG_LAUNCH),
    suiteFilter,
  };
}
