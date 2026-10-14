// Removes document metadata (Info dictionary: author, creator, producer, dates, title...) and the XMP
// metadata stream from the published resume. Idempotent: the file is rewritten only when something was removed.
// Usage: node scripts/strip-pdf.mjs [file.pdf ...]   (defaults to the CV in public/cv)
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import { ROOT } from './lib/ts.mjs';

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [path.join(ROOT, 'public', 'cv', 'Victor-Augusto-Ferreira-dos-Santos.pdf')];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`strip-pdf: ${file} not found, skipping`);
    continue;
  }
  const bytes = fs.readFileSync(file);
  // updateMetadata:false stops pdf-lib from stamping its own Producer/ModDate.
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  let changed = false;

  const infoRef = doc.context.trailerInfo.Info;
  if (infoRef) {
    const info = doc.context.lookup(infoRef);
    if (info instanceof PDFDict && info.keys().length > 0) {
      for (const key of info.keys()) info.delete(key);
      changed = true;
    }
    delete doc.context.trailerInfo.Info;
    changed = true;
  }

  const metaKey = PDFName.of('Metadata');
  if (doc.catalog.has(metaKey)) {
    doc.catalog.delete(metaKey);
    changed = true;
  }

  // Strip the document ID too (it is derived from creation data).
  if (doc.context.trailerInfo.ID) {
    delete doc.context.trailerInfo.ID;
    changed = true;
  }

  if (!changed) {
    console.log(`strip-pdf: ${path.relative(ROOT, file)} already clean`);
    continue;
  }
  const out = await doc.save({ useObjectStreams: false, addDefaultPage: false, updateFieldAppearances: false });
  fs.writeFileSync(file, out);
  console.log(`strip-pdf: cleaned ${path.relative(ROOT, file)} (${bytes.length} -> ${out.length} bytes)`);
}
