import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:shell',
              onlyDependOnLibsWithTags: ['scope:accounts', 'scope:transfers', 'scope:cards', 'scope:platform'],
            },
            {
              sourceTag: 'scope:accounts',
              onlyDependOnLibsWithTags: ['scope:accounts', 'scope:platform'],
            },
            {
              sourceTag: 'scope:transfers',
              onlyDependOnLibsWithTags: ['scope:transfers', 'scope:platform'],
            },
            {
              sourceTag: 'scope:cards',
              onlyDependOnLibsWithTags: ['scope:cards', 'scope:platform'],
            },
            {
              sourceTag: 'scope:platform',
              onlyDependOnLibsWithTags: ['scope:platform'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:contract', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
          ],
        },
      ],
    },
  },
];
