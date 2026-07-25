# Family Language OS v6 — برنامه بازسازی عملیاتی

## حکم فنی
نسخه v5 یک Demonstrator قابل اجرا است، اما برای یادگیری واقعی از صفر تا C2 کافی نیست. v6 باید به‌صورت یک Learning OS داده‌محور بازسازی شود، نه اینکه فقط کارت و درس نمایشی بیشتری به همان فایل اضافه شود.

## معماری اصلی
1. **Today** — نشست تطبیقی ۱۰ مرحله‌ای برای بزرگسال و کودک مدرسه‌ای؛ نشست ۶ مرحله‌ای والد‌همراه برای کودک ۳ ساله.
2. **Path** — نقشه کامل A0 تا C2 برای انگلیسی و آلمانی؛ مسیر PRE مستقل برای آریا.
3. **Practice** — واژگان، شنیدار، گفتار، نوشتن، گرامر در عمل، تلفظ، خطانامه و مرور فاصله‌دار.
4. **Library** — IELTS، پژوهش و HSE، خرید و آشپزخانه، مدرسه، زندگی روزمره و IT.
5. **Family** — چهار پرونده مستقل بدون مقایسه رقابتی کودکان و بزرگسالان.
6. **Me** — تنظیمات، تمرکز، پشتیبان، PWA Acceptance و Sync دو دستگاه.

## مسیرهای شخصی
- **سعید:** انگلیسی B1→C1/C2؛ IELTS، اپلای دکتری، پایان‌نامه، مقاله، FMEA، Monte Carlo، P90، HSE و معدن. آلمانی A0→B2.
- **آرزو:** انگلیسی و آلمانی A1→B2؛ خرید، آشپزخانه، ضروریات خانه، مدرسه کودکان، ادارات، فناوری و اشتغال.
- **النا، ۱۱ ساله:** A0→B1؛ الفبا، فونیک، خواندن هدایت‌شده، داستان، علوم، پروژه و ایمنی دیجیتال.
- **آریا، ۳ ساله:** PRE؛ تماس زبانی ۵ تا ۸ دقیقه‌ای، شنیدن، اشاره، حرکت، تصویر و آهنگ؛ بدون آزمون رسمی.

## مدل محتوا
Language → Level → Unit → Lesson Blueprint → Daily Task → Attempt/Event → Mastery/Error/SRS.

هر واحد باید هدف عملکردی، پروژه واقعی، معیار تسلط و خروجی ثبت‌شده داشته باشد. صرف بازکردن صفحه یا لمس کارت به‌عنوان یادگیری ثبت نمی‌شود.

## موتورهای لازم
- Adaptive Session Engine
- Mastery Graph
- Spaced Repetition
- Personal Error Book
- Focus/Pomodoro Analytics
- Skill Analytics
- Diagnostic & Level Promotion
- Real-life Mission Engine
- Local-first Event Store
- Two-device Merge/Sync
- Non-destructive Migration

## گیت‌های انتشار
SOURCE → SYNTAX → STATIC SERVER → BROWSER RUNTIME → ROUTES → TASK COMPLETION → STORAGE ROUNDTRIP → OFFLINE → REAL DEVICE → TWO-DEVICE SYNC → FAMILY ACCEPTANCE.

## وضعیت شاخه
شاخه `v6-learning-os` برای بازسازی ایجاد شده است. نسخه عمومی روی `main` تا عبور v6 از گیت‌های پذیرش تغییر نمی‌کند.
