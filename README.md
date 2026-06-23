# 💎 Luxe Beauty — Performance Management System

نظام متكامل لإدارة وتتبع أداء مسوّقي وسائل التواصل الاجتماعي.

---

## 🚀 التشغيل السريع

### 1. إعداد Supabase

1. اذهب إلى https://supabase.com وأنشئ مشروعاً جديداً
2. افتح **SQL Editor** وانسخ محتوى `supabase-setup.sql` ونفّذه
3. من **Project Settings → API**، انسخ:
   - `Project URL`
   - `anon public` key

### 2. إنشاء حساب المدير

في **Supabase Dashboard → Authentication → Users → Add user**

### 3. إعداد المتغيرات البيئية

```
cp .env.example .env.local
```

عدّل `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. تشغيل المشروع

```
npm install
npm run dev
```

افتح http://localhost:3000

---

## 📊 الصفحات

- /login             → تسجيل دخول المدير
- /dashboard         → إحصائيات اليوم والشهر والمخططات
- /marketers         → إضافة/تعديل/حذف/تفعيل المسوّقين
- /accounts          → إدارة حسابات TikTok و Instagram
- /daily-reports     → إدخال وعرض وتصفية التقارير اليومية
- /monthly-reports   → تقرير شهري مع تصنيف وتصدير
- /leaderboard       → ترتيب المسوّقين حسب الأداء

---

## 📈 منطق الأداء

الهدف اليومي: 30 منشور (15 TikTok + 15 Instagram)

- 100%+ = ممتاز (Excellent)
- 80-99% = جيد (Good)
- أقل من 80% = يحتاج متابعة (Needs Follow Up)

---

## 🌐 النشر على Vercel

```
vercel deploy
```
أضف المتغيرات البيئية في Vercel Dashboard → Settings → Environment Variables.
