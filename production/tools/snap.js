const puppeteer=require('puppeteer-core');const fs=require('fs');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new'});const p=await b.newPage();
await p.setViewport({width:1100,height:300,deviceScaleFactor:1});
const svg=fs.readFileSync(process.argv[2],'utf8');
await p.setContent(`<body style="margin:0;background:#fff;display:grid;place-items:center;height:300px"><div style="width:1088px">${svg.replace('width="136" height="18"','width="1088" height="144"')}</div></body>`);
await p.screenshot({path:process.argv[3]});await b.close();})();
