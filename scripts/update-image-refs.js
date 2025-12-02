#!/usr/bin/env node

/**
 * Update all image references in the codebase from .jpg/.png to .webp
 * Run after converting images with convert-to-webp.sh
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'lib/candidatesData.ts',
    'app/PageContent.tsx',
    'app/candidats/page.tsx',
];

console.log('🔄 Updating image references to WebP...\n');

let totalReplacements = 0;

filesToUpdate.forEach(file => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;

    // Replace image extensions
    const patterns = [
        { from: /\.jpg"/g, to: '.webp"' },
        { from: /\.jpeg"/g, to: '.webp"' },
        { from: /\.png"/g, to: '.webp"' },
        { from: /\.JPG"/g, to: '.webp"' },
        { from: /\.JPEG"/g, to: '.webp"' },
        { from: /\.PNG"/g, to: '.webp"' },
    ];

    patterns.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
            replacements += matches.length;
            content = content.replace(from, to);
        }
    });

    if (replacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file}: ${replacements} replacements`);
        totalReplacements += replacements;
    } else {
        console.log(`ℹ️  ${file}: No changes needed`);
    }
});

console.log(`\n✨ Done! Total replacements: ${totalReplacements}`);
console.log('\nNext: Test your website to ensure all images load correctly.');
