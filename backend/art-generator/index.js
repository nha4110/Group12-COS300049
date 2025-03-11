//when this code runs it automatically creates 3 files (2 pic variation and 1 file desc)
//So the idea is to use this pictures to upload it into main page after someone buys nft

const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const sharp = require('sharp');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'NFT-art');

const template = `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- head -->
        <!-- hair -->
        <!-- eyes -->
        <!-- nose -->
        <!-- mouth -->
        <!-- beard -->
    </svg>
`;

// Ensure the output directory exists
if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

function randInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName() {
    const adjectives = 'fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical'.split(' ');
    const names = 'aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis'.split(' ');
    
    return `${randElement(adjectives)}-${randElement(names)}`;
}

function getLayer(name, skip = 0.0) {
    const filePath = path.join(__dirname, 'layers', `${name}.svg`);
    if (!existsSync(filePath)) return ''; // Avoid errors if file is missing
    const svg = readFileSync(filePath, 'utf-8');
    const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
    const layer = svg.match(re)?.[0] || '';
    return Math.random() > skip ? layer : '';
}

async function svgToPng(name) {
    const src = path.join(OUTPUT_DIR, `${name}.svg`);
    const dest = path.join(OUTPUT_DIR, `${name}.png`);
    
    await sharp(src).resize(1024).toFile(dest);
    console.log(`✅ Image Saved: ${dest}`);
}

function createImage() {
    const idx = Date.now(); // Unique ID based on timestamp
    const name = getRandomName();

    const bg = randInt(5);
    const hair = randInt(7);
    const eyes = randInt(9);
    const nose = randInt(4);
    const mouth = randInt(5);
    const beard = randInt(3);

    const final = template
        .replace('<!-- bg -->', getLayer(`bg${bg}`))
        .replace('<!-- head -->', getLayer('head0'))
        .replace('<!-- hair -->', getLayer(`hair${hair}`))
        .replace('<!-- eyes -->', getLayer(`eyes${eyes}`))
        .replace('<!-- nose -->', getLayer(`nose${nose}`))
        .replace('<!-- mouth -->', getLayer(`mouth${mouth}`))
        .replace('<!-- beard -->', getLayer(`beard${beard}`, 0.5));

    // File paths
    const svgPath = path.join(OUTPUT_DIR, `${idx}.svg`);
    const jsonPath = path.join(OUTPUT_DIR, `${idx}.json`);

    // Save metadata and SVG
    writeFileSync(jsonPath, JSON.stringify({ name, image: `${idx}.png` }, null, 2));
    writeFileSync(svgPath, final);

    // Convert to PNG and save
    svgToPng(idx).catch(err => console.error(`❌ PNG Conversion Error: ${err.message}`));
}

// Generate ONE image per trigger
createImage();


