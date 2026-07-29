import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';

import { useLightwellNavigateTo } from 'Hooks/Lightwell/navigation/useLightwellNavigateTo';
import { getMockCVEById } from './mockCVEData';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
  detailsSection: {
    whiteSpace: 'pre-wrap',
  },
});

const CVEDetailsPage = () => {
  const classes = useStyles();
  const { navigateTo } = useLightwellNavigateTo();
  const {
    repoName: repoSlug = '',
    group: groupParam,
    packageName: packageNameParam = '',
    cveId = '',
  } = useParams();

  const packageName = packageNameParam ? decodeURIComponent(packageNameParam) : '';
  const packageGroup = groupParam ? decodeURIComponent(groupParam) : '';
  const decodedCveId = decodeURIComponent(cveId);

  const cve = getMockCVEById(decodedCveId);

  if (!cve) {
    return (
      <Grid className={classes.topContainer}>
        <Stack>
          <Title headingLevel='h1'>CVE not found</Title>
          <Content component='p'>
            No CVE found with ID &quot;{decodedCveId}&quot;.
          </Content>
        </Stack>
      </Grid>
    );
  }

  const primaryAlias = cve.aliases.find((a) => a.startsWith('CVE-')) ?? cve.id;
  const fixedVersion =
    cve.affected[0]?.ranges[0]?.events.find((e) => e.fixed)?.fixed ?? '—';
  const introducedVersion =
    cve.affected[0]?.ranges[0]?.events.find((e) => e.introduced !== undefined)?.introduced ?? '—';
  const affectedPackage = cve.affected[0]?.package;

  const packageDisplayName = packageGroup
    ? `${packageGroup}:${packageName}`
    : packageName;

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-cve-details-breadcrumb'>
              <BreadcrumbItem
                component='button'
                onClick={() => navigateTo('repositories')}
              >
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem
                component='button'
                onClick={() =>
                  navigateTo('repositoryPackages', { repoSlug })
                }
              >
                {repoSlug}
              </BreadcrumbItem>
              <BreadcrumbItem
                component='button'
                onClick={() =>
                  navigateTo('packageDetails', {
                    repoSlug,
                    packageName,
                    groupId: packageGroup || undefined,
                  })
                }
              >
                {packageDisplayName}
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{primaryAlias}</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem className={spacing.ptMd}>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapMd' }}
            >
              <Title headingLevel='h1' ouiaId='lightwell-cve-details-header'>
                {primaryAlias}
              </Title>
              {cve.aliases
                .filter((a) => a !== primaryAlias)
                .map((alias) => (
                  <Label key={alias} variant='outline' isCompact>
                    {alias}
                  </Label>
                ))}
            </Flex>
          </StackItem>
        </Stack>
      </Grid>

      <Grid hasGutter className={`${spacing.pxLg} ${spacing.pbLg}`}>
        <GridItem md={8}>
          <Stack hasGutter>
            <StackItem>
              <Card>
                <CardTitle>Description</CardTitle>
                <CardBody>
                  <Content
                    component='p'
                    className={classes.detailsSection}
                  >
                    {cve.details}
                  </Content>
                </CardBody>
              </Card>
            </StackItem>

            <StackItem>
              <Card>
                <CardTitle>Affected packages</CardTitle>
                <CardBody>
                  {cve.affected.map((affected, idx) => (
                    <DescriptionList key={idx} isHorizontal>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Package</DescriptionListTerm>
                        <DescriptionListDescription>
                          {affected.package.name}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Ecosystem</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Label isCompact variant='outline'>
                            {affected.package.ecosystem}
                          </Label>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>PURL</DescriptionListTerm>
                        <DescriptionListDescription>
                          <code>{affected.package.purl}</code>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      {affected.ranges.map((range, rIdx) => (
                        <DescriptionListGroup key={rIdx}>
                          <DescriptionListTerm>Version range</DescriptionListTerm>
                          <DescriptionListDescription>
                            <Flex gap={{ default: 'gapSm' }}>
                              {range.events.map((event, eIdx) => {
                                if (event.introduced !== undefined) {
                                  return (
                                    <Label key={eIdx} isCompact color='orange'>
                                      Introduced: {event.introduced === '0' ? 'all versions' : event.introduced}
                                    </Label>
                                  );
                                }
                                if (event.fixed) {
                                  return (
                                    <Label key={eIdx} isCompact color='green'>
                                      Fixed: {event.fixed}
                                    </Label>
                                  );
                                }
                                return null;
                              })}
                            </Flex>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      ))}
                    </DescriptionList>
                  ))}
                </CardBody>
              </Card>
            </StackItem>

            <StackItem>
              <Card>
                <CardTitle>References</CardTitle>
                <CardBody>
                  <Stack hasGutter>
                    {cve.references.map((ref, idx) => (
                      <StackItem key={idx}>
                        <a
                          href={ref.url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {ref.url} <ExternalLinkAltIcon />
                        </a>
                      </StackItem>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            </StackItem>
          </Stack>
        </GridItem>

        <GridItem md={4}>
          <Card>
            <CardTitle>Details</CardTitle>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>Lightwell ID</DescriptionListTerm>
                  <DescriptionListDescription>
                    <code>{cve.id}</code>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Last modified</DescriptionListTerm>
                  <DescriptionListDescription>
                    {new Date(cve.modified).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Fixed in</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label isCompact color='green'>
                      {fixedVersion}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Backport base</DescriptionListTerm>
                  <DescriptionListDescription>
                    {cve.database_specific.lightwell.backport_base_version}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Pipeline ID</DescriptionListTerm>
                  <DescriptionListDescription>
                    {cve.database_specific.lightwell.golden_pipeline_id}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Credits</DescriptionListTerm>
                  <DescriptionListDescription>
                    {cve.credits.map((c) => c.name).join(', ')}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Schema version</DescriptionListTerm>
                  <DescriptionListDescription>
                    {cve.schema_version}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </>
  );
};

export default CVEDetailsPage;
