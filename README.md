# گزارش‌یار — فرانت‌اند (Vue 3)

رابط کاربری فارسی و راست‌به‌چپ برای بک‌اند «Smart Reporting API» (FastAPI + ChromaDB + PageIndex).

## اجرا

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

بک‌اند باید روی `http://127.0.0.1:8000` اجرا باشد (از ریشهٔ پروژهٔ بک‌اند: `uvicorn app.main:app --reload`).
این نسخه با بک‌اند جدید (`backend_fixed.zip`) هماهنگ است.

## پشتهٔ فنی

| کار | کتابخانه |
|---|---|
| فریم‌ورک | Vue 3 (Composition API, `<script setup>`) + Vite |
| مسیریابی / حالت | Vue Router 4 · Pinia |
| استایل | Tailwind CSS v4 با توکن‌های CSS (تم روشن/تیره) |
| نمودار | ECharts (tree-shaken) + vue-echarts |
| HTTP | Axios با نرمال‌سازی خطاهای FastAPI |
| ابزار | VueUse · lucide-vue-next · vue-sonner · marked + DOMPurify |
| فونت | Vazirmatn (متغیر، self-hosted از npm) |

## ساختار

```
src/
├─ api/          لایهٔ شبکه (sources, chat, search, reports, health)
├─ stores/       Pinia: sources، chat (با sessionId)، dashboard
├─ composables/  useTheme, useHealth, useChartTheme
├─ views/        Dashboard, Sources, Chat, Search, NotFound
├─ components/
│  ├─ dashboard/ DashboardRenderer, KpiRenderer, ChartRenderer, TableRenderer, NarrativePanel
│  ├─ charts/    BaseChart (ثبت بخش‌های ECharts)
│  └─ ...        common, layout, sources, chat
└─ utils/        format (اعداد/واحد فارسی)، chartModel (ساخت option نمودار)، constants، markdown
```

## نگاشت به endpointها

| صفحه | endpoint |
|---|---|
| اسناد | `POST/GET/DELETE /sources` ، `/sources/{id}/process · chunk · embed · ingest · pageindex` |
| پرسش و پاسخ | `POST /chat` (با `session_id`) ، `DELETE /chat/{session_id}` |
| جست‌وجو | `POST /search` |
| داشبورد | `GET/POST /reports/{id}/dashboard` |

## داشبورد عمومی

- هر نوع component بک‌اند رندر می‌شود: `kpi`، `chart` (bar/line/area/pie)، `table`، `text`، `insight`.
- منطق نمودار در `utils/chartModel.js` است (مستقل از Vue و قابل تست با Node): انتخاب خودکار نمودار افقی برای برچسب‌های بلند،
  محور دوم برای سری‌های با مقیاس متفاوت، مرتب‌سازی تک‌سری، خط میانگین، نقطهٔ بیشینه/کمینه، zoom برای دادهٔ زیاد و گروه‌بندی «سایر» در دایره‌ای.
- کاربر می‌تواند نوع نمودار را عوض کند، دادهٔ خام را ببیند و تصویر PNG بگیرد. جدول‌ها مرتب‌سازی، CSV و ردیف جمع کل دارند.
- خروجی: JSON و چاپ/PDF (برای PDF بهتر است تم روشن فعال باشد).
- هیچ چیز به موضوع فروش وابسته نیست؛ نام ستون‌ها، واحدها و برچسب‌ها از خود سند می‌آیند.

## گفتگوی دارای حافظه

فرانت `session_id` برگردانده‌شده را ذخیره و در هر پیام می‌فرستد؛ پس پاسخ‌هایی مثل «بله» به پیشنهاد قبلی دستیار وصل می‌شود.
«گفتگوی جدید» حافظهٔ بک‌اند را هم پاک می‌کند.
