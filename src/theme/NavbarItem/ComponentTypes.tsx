import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import GitHubStats from '@site/src/components/GitHubStats';

// Register a custom navbar item type so docusaurus.config.ts can place the
// live GitHub star/fork widget via `{type: 'custom-githubStats'}`.
export default {
  ...ComponentTypes,
  'custom-githubStats': GitHubStats,
};
