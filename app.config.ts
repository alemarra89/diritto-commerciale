import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const basePath = process.env.GITHUB_PAGES_BASE_PATH;
  return {
    ...config,
    name: config.name ?? 'Commerciale · Quiz e ripasso',
    slug: config.slug ?? 'diritto-commerciale',
    experiments: {
      ...config.experiments,
      ...(basePath !== undefined ? { baseUrl: basePath } : {}),
    },
  };
};
