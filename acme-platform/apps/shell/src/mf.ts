import { lazy, type ComponentType } from 'react';
import { registerRemotes, loadRemote } from '@module-federation/runtime';

// Dynamic provider registry for Nexus Bank Micro-Frontend Platform
const PROVIDERS: Array<{ alias: string; name: string; entry: string }> = [
  {
    alias: 'accounts',
    name: 'accounts',
    entry: 'http://localhost:5101/remoteEntry.js',
  },
  {
    alias: 'transfers',
    name: 'transfers',
    entry: 'http://localhost:5102/remoteEntry.js',
  },
  {
    alias: 'cards',
    name: 'cards',
    entry: 'http://localhost:5103/remoteEntry.js',
  },
];

registerRemotes(PROVIDERS.map((remote) => ({ ...remote, type: 'module' })));

export function lazyProvider<Props = unknown>(
  alias: string,
  exposeName: string
) {
  return lazy(async () => {
    const mod = await loadRemote<{ default: ComponentType<Props> }>(
      `${alias}/${exposeName}`
    );
    return { default: mod!.default };
  });
}
