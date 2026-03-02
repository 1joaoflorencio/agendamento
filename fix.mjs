import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
for (let file of files) {
    if (file === 'src/lib/prisma.ts') continue;
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('new PrismaClient()')) {
        content = content.replace("import { PrismaClient } from '@prisma/client'", "import prisma from '@/lib/prisma'");
        content = content.replace("const prisma = new PrismaClient()\n\n", "");
        content = content.replace("const prisma = new PrismaClient()\n", "");
        content = content.replace("const prisma = new PrismaClient()", "");
        fs.writeFileSync(file, content);
        console.log("Fixed " + file);
    }
}
