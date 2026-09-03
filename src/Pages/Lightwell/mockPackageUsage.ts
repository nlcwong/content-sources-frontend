export type PackageUsageScore = {
  packageKey: string;
  usageScore: number;
};

const mockPackageUsageScores: PackageUsageScore[] = [
  { packageKey: '22222222-2222-4222-8222-222222222222:org.apache.logging.log4j:log4j-core', usageScore: 98 },
  { packageKey: '22222222-2222-4222-8222-222222222222:org.json:json', usageScore: 95 },
  { packageKey: '11111111-1111-4111-8111-111111111111:com.fasterxml.jackson.core:jackson-databind', usageScore: 92 },
  { packageKey: '11111111-1111-4111-8111-111111111111:org.apache.commons:commons-lang3', usageScore: 88 },
  { packageKey: '33333333-3333-4333-8333-333333333333::python-requests', usageScore: 85 },
  { packageKey: '44444444-4444-4444-8444-444444444444::cryptography', usageScore: 82 },
  { packageKey: '22222222-2222-4222-8222-222222222222:com.jayway.jsonpath:json-path', usageScore: 78 },
  { packageKey: '44444444-4444-4444-8444-444444444444::pydantic', usageScore: 74 },
  { packageKey: '11111111-1111-4111-8111-111111111111:commons-fileupload:commons-fileupload', usageScore: 70 },
  { packageKey: '33333333-3333-4333-8333-333333333333::python-urllib3', usageScore: 65 },
  { packageKey: '22222222-2222-4222-8222-222222222222:org.springframework:spring-core', usageScore: 60 },
  { packageKey: '44444444-4444-4444-8444-444444444444::flask', usageScore: 55 },
  { packageKey: '11111111-1111-4111-8111-111111111111:org.slf4j:slf4j-api', usageScore: 50 },
  { packageKey: '22222222-2222-4222-8222-222222222222:io.netty:netty-handler', usageScore: 45 },
  { packageKey: '44444444-4444-4444-8444-444444444444::requests', usageScore: 40 },
];

export const getMockPackageUsageScore = (packageKey: string): number =>
  mockPackageUsageScores.find((entry) => entry.packageKey === packageKey)?.usageScore ?? 0;

export const getMockPackageUsageScores = (): PackageUsageScore[] => [...mockPackageUsageScores];
