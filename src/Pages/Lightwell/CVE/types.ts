export interface LightwellCVEReference {
  url: string;
  type: string;
}

export interface LightwellCVEAffectedRange {
  type: string;
  events: { introduced?: string; fixed?: string }[];
}

export interface LightwellCVEAffectedPackage {
  package: {
    ecosystem: string;
    name: string;
    purl: string;
  };
  ranges: LightwellCVEAffectedRange[];
}

export interface LightwellCVECredit {
  name: string;
  type: string;
}

export interface LightwellCVE {
  schema_version: string;
  id: string;
  modified: string;
  aliases: string[];
  details: string;
  references: LightwellCVEReference[];
  affected: LightwellCVEAffectedPackage[];
  credits: LightwellCVECredit[];
  database_specific: {
    lightwell: {
      source: string;
      backport_base_version: string;
      golden_pipeline_id: string;
    };
  };
}
