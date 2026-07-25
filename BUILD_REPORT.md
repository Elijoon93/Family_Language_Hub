# BUILD REPORT — Family Language OS v6.1 Learning Engine Core

## نتیجه
Learning Engine Core ساخته شد و از حالت کارت/پوسته به موتور ثبت عملکرد، تسلط، مرور و مسیر ارتقا تبدیل شد.

## تغییرات اصلی
- Schema 24 و Version `6.1.0-learning-engine-core`.
- ماژول جدید `js/core.js`.
- برنامه روزانه deterministic و قابل Resume.
- Mastery با نمره، استقلال، بازیابی، تکمیل و پایداری.
- جلوگیری از XP تکراری برای همان Task.
- Unit Gate و Level Readiness.
- SRS واقعی برای کارت واژه.
- خطانامه خودکار از پاسخ نادرست.
- ارزیابی سطح داخلی و ثبت Assessment.
- ادغام Event/Snapshot برای دو دستگاه.
- اصلاح تغییر عضو روی موبایل از طریق Active Identity.
- تصاویر واقعی سعید، آرزو، النا و آریا.

## آزمون‌ها
- JavaScript syntax: PASS.
- Core unit tests: 13/13 PASS.
- Embedded Chromium runtime: PASS.
- Desktop routes/profile/diagnostic/alphabet/task completion: PASS.
- Mobile profile switch and visual practice: PASS.
- Four real profile images load: PASS.
- 184 curriculum units: PASS.

## محدودیت محیط آزمون
Chromium در محیط کانتینر دسترسی مستقیم به `localhost` و `file://` را با `ERR_BLOCKED_BY_ADMINISTRATOR` مسدود کرد. Browser Runtime با نسخه Standalone و `page.set_content` اجرا و PASS شد. آزمون GitHub Pages واقعی هنوز لازم است.

## باقی‌مانده برای Final Release
- تألیف و ممیزی محتوای کامل A0 تا C2.
- ضبط صدای واقعی/میکروفن و بازپخش.
- Supabase Auth و Sync زنده.
- Conflict Test واقعی روی دو دستگاه.
- GitHub Pages green deployment.
- پذیرش روی Android، iPhone و Windows.
- پذیرش محتوایی خانواده.
