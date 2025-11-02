import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

export interface ScormManifest {
  identifier: string;
  title: string;
  description: string;
  version: string;
  duration?: number;
  sectionCount?: number;
}

export async function parseScormManifest(manifestPath: string): Promise<ScormManifest> {
  try {
    const xmlContent = fs.readFileSync(manifestPath, 'utf-8');
    const result = await parseStringPromise(xmlContent);

    const manifest = result.manifest;
    const metadata = manifest.metadata?.[0];
    const lom = metadata?.lom?.[0];
    const general = lom?.general?.[0];
    const organizations = manifest.organizations?.[0];
    const organization = organizations?.organization?.[0];

    const identifier = manifest.$?.identifier || 'unknown';
    const version = manifest.$?.version || '1.0';
    const title = general?.title?.[0]?.string?.[0]?._ || general?.title?.[0]?.string?.[0] || 'Untitled Course';
    const description = general?.description?.[0]?.string?.[0]?._ || general?.description?.[0]?.string?.[0] || '';

    const items = organization?.item || [];
    const sectionCount = items.length;

    return {
      identifier,
      title,
      description,
      version,
      sectionCount,
    };
  } catch (error) {
    console.error('Error parsing SCORM manifest:', error);
    throw error;
  }
}

export async function parseBreezeManifest(manifestPath: string): Promise<{ duration: number; sectionCount: number }> {
  try {
    const xmlContent = fs.readFileSync(manifestPath, 'utf-8');
    const result = await parseStringPromise(xmlContent);

    const breezeManifest = result['breeze-manifest'];
    const document = breezeManifest?.document?.[0];

    const duration = parseFloat(document.$?.duration || '0');
    const sectionCount = parseInt(document.$?.['section-count'] || '0', 10);

    return {
      duration,
      sectionCount,
    };
  } catch (error) {
    console.error('Error parsing Breeze manifest:', error);
    return { duration: 0, sectionCount: 0 };
  }
}
