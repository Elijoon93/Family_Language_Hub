# Family Language OS v6.1 — Learning Engine Core

سامانه خانوادگی آموزش انگلیسی و آلمانی برای سعید، آرزو، النا و آریا.

## اجرای محلی
فایل `index.html` را از یک وب‌سرور استاتیک یا GitHub Pages اجرا کنید. نسخه Standalone نیز همراه Release ساخته می‌شود.

## قابلیت‌های این مرحله
- ۱۸۴ واحد A0 تا C2 و PRE
- نشست تطبیقی پایدار و قابل ادامه
- Mastery، پایداری، مهارت و قفل واحد
- مرور فاصله‌دار واژگان
- خطانامه خودکار
- ارزیابی سطح داخلی
- تصاویر واقعی چهار عضو خانواده
- PWA و Offline Cache
- Event Merge و آمادگی همگام‌سازی دو دستگاه

## آزمون‌ها
```bash
find js -name '*.js' -print0 | xargs -0 -n1 node --check
node tests/core.test.js
python tests/browser_embedded_smoke.py
python tests/mobile_smoke.py
```

## Supabase
1. پروژه Supabase بسازید.
2. `supabase/schema.sql` را اجرا کنید.
3. فقط URL و Anon/Publishable Key را در `config.js` بگذارید.
4. Service Role Key هرگز نباید در مخزن عمومی قرار گیرد.

## شاخه توسعه
`v6.1-learning-engine-core`

`main` تا عبور نسخه از گیت‌های پذیرش دست‌نخورده می‌ماند.
