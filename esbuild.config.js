const { buildSync } = require('esbuild')

// إعداد وتكوين متغيرات لبناء المشروع
buildSync({
  entryPoints: ['./index.ts'],  // نقطة الدخول للتطبيق
  tsconfig: './tsconfig.json',  // ملف تكوين TypeScript
  sourcemap: 'external',  // خريطة المصدر خارجية
  outdir: './build',  // المسار الذي سيتم فيه حفظ الملفات الناتجة
  platform: 'node',  // منصة التشغيل (Node.js)
  target: 'node16',  // النسخة المستهدفة من Node.js
  minify: true,  // ضغط الملفات
  bundle: true,  // دمج الملفات في ملف واحد
  define: {
    'process.env.FLUENTFFMPEG_COV': JSON.stringify(false),  // تحديد متغير بيئي
  },
  loader: {
    '.node': 'file',  // تحديد كيفية تحميل الملفات بامتداد .node
  },
  logLevel: 'info'  // مستوى السجلات للإخراج
})
