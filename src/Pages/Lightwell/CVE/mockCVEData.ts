import type { LightwellCVE } from './types';

const cveTemplates: Omit<LightwellCVE, 'id' | 'affected' | 'database_specific'>[] = [
  {
    schema_version: '1.6.8',
    modified: '2026-07-15T19:35:48Z',
    aliases: ['CVE-2024-38816', 'GHSA-cx7f-g6mp-7hqm'],
    details:
      'Applications serving static resources through the functional web frameworks WebMvc.fn or WebFlux.fn are vulnerable to path traversal attacks. An attacker can craft malicious HTTP requests and obtain any file on the file system that is also accessible to the process in which the Spring application is running.',
    references: [
      { url: 'https://security.netapp.com/advisory/ntap-20241227-0001/', type: 'WEB' },
      { url: 'https://spring.io/security/cve-2024-38816', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-06-20T14:12:00Z',
    aliases: ['CVE-2024-22262', 'GHSA-qhqg-9fjr-c8w6'],
    details:
      'Applications that use UriComponentsBuilder to parse an externally provided URL and perform validation checks on the host of the parsed URL may be vulnerable to an open redirect attack or an SSRF attack if the URL is used after passing validation checks.',
    references: [
      { url: 'https://spring.io/security/cve-2024-22262', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-05-10T08:45:00Z',
    aliases: ['CVE-2024-38809', 'GHSA-6qvp-cxr9-pq5r'],
    details:
      'Applications that parse ETags from "If-Match" or "If-None-Match" request headers are vulnerable to a denial of service attack. An attacker can send a very long ETag value that causes excessive memory allocation and CPU usage when parsed.',
    references: [
      { url: 'https://spring.io/security/cve-2024-38809', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-03-22T11:00:00Z',
    aliases: ['CVE-2023-34053', 'GHSA-2wrp-6fg6-hmc5'],
    details:
      'In Spring Framework versions prior to the patched release, when an application is configured to use a proxy server, a specially crafted request can trigger a denial of service condition through excessive resource consumption.',
    references: [
      { url: 'https://spring.io/security/cve-2023-34053', type: 'WEB' },
      { url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-34053', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-04-18T10:30:00Z',
    aliases: ['CVE-2024-22243', 'GHSA-ccgv-vj62-xf9h'],
    details:
      'Applications that use UriComponentsBuilder in Spring Framework to parse an externally provided URL and perform validation checks on the host of the parsed URL may be vulnerable to an open redirect or SSRF attack.',
    references: [
      { url: 'https://spring.io/security/cve-2024-22243', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-02-15T09:00:00Z',
    aliases: ['CVE-2023-44483', 'GHSA-xfrj-6vvc-3xm2'],
    details:
      'All versions of Apache Santuario are vulnerable to an XML Signature Wrapping attack when verifying signed XML documents. This can lead to arbitrary XML injection and signature bypass.',
    references: [
      { url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-44483', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-06-05T16:20:00Z',
    aliases: ['CVE-2024-29025', 'GHSA-5jpm-x58v-624v'],
    details:
      'Netty HttpPostRequestDecoder can be exploited to trigger high memory usage via a crafted multipart request containing an extremely large boundary string, leading to out-of-memory errors.',
    references: [
      { url: 'https://github.com/netty/netty/security/advisories/GHSA-5jpm-x58v-624v', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-05-28T12:00:00Z',
    aliases: ['CVE-2024-47535', 'GHSA-xq3w-v528-pr4g'],
    details:
      'Netty allows a denial of service via an untrusted input to the SslHandler if a certificate chain with an overly large number of certificates is presented during the TLS handshake.',
    references: [
      { url: 'https://github.com/netty/netty/security/advisories/GHSA-xq3w-v528-pr4g', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-01-10T14:45:00Z',
    aliases: ['CVE-2023-46589', 'GHSA-fccv-jmmp-qg76'],
    details:
      'Apache Tomcat may fail to correctly parse HTTP trailer headers, which could lead to a request smuggling attack when used behind a reverse proxy.',
    references: [
      { url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-46589', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
  {
    schema_version: '1.6.8',
    modified: '2026-07-01T08:15:00Z',
    aliases: ['CVE-2024-34750', 'GHSA-w34g-m3j5-gp6x'],
    details:
      'Apache Tomcat fails to properly handle certain HTTP/2 streams, causing an infinite loop in the processing thread. An attacker can exploit this to consume all available threads, leading to a denial of service.',
    references: [
      { url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-34750', type: 'WEB' },
    ],
    credits: [{ name: 'Lightwell', type: 'REMEDIATION_DEVELOPER' }],
  },
];

/**
 * Deterministic pseudo-random number from a string seed.
 * Uses a simple hash to produce consistent results for the same release.
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) | 0;
    return Math.abs(hash) / 2147483647;
  };
}

const cveCache = new Map<string, LightwellCVE[]>();

/**
 * Returns 1-4 mock CVEs for a given release version (e.g. "2.24.1.rhlw-00003").
 * The selection is deterministic — the same release always returns the same CVEs.
 */
export function getMockCVEsForRelease(releaseVersion: string): LightwellCVE[] {
  if (cveCache.has(releaseVersion)) {
    return cveCache.get(releaseVersion)!;
  }

  const rng = seededRandom(releaseVersion);
  const count = Math.floor(rng() * 4) + 1; // 1 to 4

  const shuffled = [...cveTemplates].sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, count);

  const baseVersion = releaseVersion.split('.rhlw')[0] || releaseVersion;
  const pipelineBase = Math.abs(
    releaseVersion.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0),
  );

  const cves: LightwellCVE[] = selected.map((template, idx) => {
    const primaryAlias = template.aliases.find((a) => a.startsWith('CVE-')) ?? template.aliases[0];
    return {
      ...template,
      id: `x_RHLW-${primaryAlias}-${baseVersion}`,
      affected: [
        {
          package: {
            ecosystem: 'Maven',
            name: 'org.springframework:spring-webmvc',
            purl: 'pkg:maven/org.springframework/spring-webmvc',
          },
          ranges: [
            {
              type: 'ECOSYSTEM',
              events: [{ introduced: '0' }, { fixed: releaseVersion }],
            },
          ],
        },
      ],
      database_specific: {
        lightwell: {
          source: 'lightwell-pipeline',
          backport_base_version: baseVersion,
          golden_pipeline_id: String(pipelineBase + idx * 1000),
        },
      },
    };
  });

  cveCache.set(releaseVersion, cves);
  return cves;
}

export function getMockCVEById(cveId: string): LightwellCVE | undefined {
  for (const cves of cveCache.values()) {
    const found = cves.find((cve) => cve.id === cveId || cve.aliases.includes(cveId));
    if (found) return found;
  }
  return undefined;
}

export function getAllMockCVEs(): LightwellCVE[] {
  return Array.from(cveCache.values()).flat();
}
