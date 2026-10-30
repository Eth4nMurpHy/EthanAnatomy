import fs from 'node:fs';
import path from 'node:path';
fs.mkdirSync('public/legal',{recursive:true});
for(const file of ['LICENSE','NOTICE.md'])fs.copyFileSync(file,path.join('public/legal',file));
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
const notices=['Direct JavaScript dependency license notices','Generated from the locked installed packages. Other applicable transitive and native dependency licenses continue to apply.',''];
for(const name of Object.keys(manifest.dependencies)){
 const root=path.join('node_modules',name),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 notices.push(`===== ${name} ${pkg.version} =====`);
 const files=fs.readdirSync(root,{withFileTypes:true}).filter(file=>file.isFile()&&/^licen[cs]e(?:[._-]|$)/i.test(file.name));
 if(files.length)for(const file of files)notices.push(fs.readFileSync(path.join(root,file.name),'utf8'));
 else notices.push(`License: ${pkg.license??'See package repository'}; ${typeof pkg.repository==='object'?pkg.repository.url:pkg.repository??''}`);
 notices.push('');
}
fs.writeFileSync('public/legal/THIRD_PARTY.txt',notices.join('\n').trimEnd()+'\n');
