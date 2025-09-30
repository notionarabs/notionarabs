'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/dateUtils';

const jobOpenings = [
  {
    id: 1,
    title: "مطور ويب Frontend",
    department: "التطوير",
    location: "الرياض - عن بُعد",
    type: "دوام كامل",
    experience: "2-4 سنوات",
    description: "نبحث عن مطور ويب متخصص في React وNext.js للمساهمة في تطوير واجهة المستخدم لمنصتنا",
    requirements: [
      "خبرة 2-4 سنوات في تطوير الواجهات الأمامية",
      "إتقان React, Next.js, وTypeScript",
      "خبرة في Tailwind CSS",
      "فهم عميق لـ JavaScript الحديث",
      "خبرة في Git وGitHub",
      "خبرة في العمل مع APIs"
    ],
    benefits: [
      "راتب تنافسي",
      "تأمين صحي شامل",
      "إجازة سنوية 25 يوم",
      "مكتب مرن أو عمل عن بُعد",
      "ميزانية للتعلم والتطوير",
      "بيئة عمل إبداعية"
    ],
    postedDate: "2024-01-15",
    applicationDeadline: "2024-02-15"
  },
  {
    id: 2,
    title: "مصمم تجربة مستخدم",
    department: "التصميم",
    location: "الرياض",
    type: "دوام كامل",
    experience: "3-5 سنوات",
    description: "نبحث عن مصمم تجربة مستخدم مبدع لتصميم واجهات مستخدم جذابة وسهلة الاستخدام",
    requirements: [
      "خبرة 3-5 سنوات في تصميم UX/UI",
      "إتقان Figma وAdobe Creative Suite",
      "فهم مبادئ التصميم والتفاعل",
      "خبرة في البحث والاختبار",
      "خبرة في تصميم التطبيقات والمواقع",
      "مهارات التواصل والعرض"
    ],
    benefits: [
      "راتب تنافسي",
      "تأمين صحي شامل",
      "إجازة سنوية 25 يوم",
      "مكتب حديث ومجهز",
      "ميزانية للأدوات والبرامج",
      "فرص للتطوير المهني"
    ],
    postedDate: "2024-01-10",
    applicationDeadline: "2024-02-10"
  },
  {
    id: 3,
    title: "مدير تسويق رقمي",
    department: "التسويق",
    location: "الرياض - عن بُعد",
    type: "دوام كامل",
    experience: "4-6 سنوات",
    description: "نبحث عن مدير تسويق رقمي لقيادة استراتيجيات التسويق الرقمي وزيادة الوعي بالعلامة التجارية",
    requirements: [
      "خبرة 4-6 سنوات في التسويق الرقمي",
      "خبرة في إدارة الحملات الإعلانية",
      "إتقان Google Analytics وFacebook Ads",
      "خبرة في إدارة وسائل التواصل الاجتماعي",
      "مهارات في تحليل البيانات",
      "خبرة في التسويق بالمحتوى"
    ],
    benefits: [
      "راتب تنافسي",
      "تأمين صحي شامل",
      "إجازة سنوية 25 يوم",
      "عمل مرن",
      "ميزانية للحملات التسويقية",
      "فرص للنمو المهني"
    ],
    postedDate: "2024-01-08",
    applicationDeadline: "2024-02-08"
  },
  {
    id: 4,
    title: "مطور Backend",
    department: "التطوير",
    location: "الرياض",
    type: "دوام كامل",
    experience: "3-5 سنوات",
    description: "نبحث عن مطور Backend متخصص في Node.js وMongoDB لبناء وتطوير APIs قوية وآمنة",
    requirements: [
      "خبرة 3-5 سنوات في تطوير Backend",
      "إتقان Node.js وExpress",
      "خبرة في قواعد البيانات (MongoDB, PostgreSQL)",
      "فهم أمن التطبيقات",
      "خبرة في APIs وRESTful services",
      "خبرة في Git وGitHub"
    ],
    benefits: [
      "راتب تنافسي",
      "تأمين صحي شامل",
      "إجازة سنوية 25 يوم",
      "مكتب حديث",
      "ميزانية للتعلم",
      "بيئة عمل تقنية متقدمة"
    ],
    postedDate: "2024-01-05",
    applicationDeadline: "2024-02-05"
  }
];

const departments = [
  { name: "الكل", value: "all" },
  { name: "التطوير", value: "التطوير" },
  { name: "التصميم", value: "التصميم" },
  { name: "التسويق", value: "التسويق" },
  { name: "المبيعات", value: "المبيعات" },
  { name: "الدعم الفني", value: "الدعم الفني" }
];

const companyValues = [
  {
    title: "الابتكار",
    description: "نشجع التفكير الإبداعي والابتكار في جميع جوانب العمل",
    icon: "💡"
  },
  {
    title: "التعاون",
    description: "نؤمن بقوة العمل الجماعي والتعاون لتحقيق الأهداف",
    icon: "🤝"
  },
  {
    title: "التميز",
    description: "نسعى للتميز في كل ما نقوم به ونقدمه",
    icon: "⭐"
  },
  {
    title: "التعلم",
    description: "نشجع التعلم المستمر والتطوير المهني",
    icon: "📚"
  }
];

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState(jobOpenings);

  // Filter jobs by department
  useEffect(() => {
    if (selectedDepartment === 'all') {
      setFilteredJobs(jobOpenings);
    } else {
      setFilteredJobs(jobOpenings.filter(job => job.department === selectedDepartment));
    }
  }, [selectedDepartment]);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6">انضم إلى فريقنا</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              نبحث عن مواهب مبدعة ومتحمسة للمساهمة في بناء مستقبل التنظيم والإنتاجية في العالم العربي
            </p>
          </div>

          {/* Company Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {companyValues.map((value, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-3">
                  {value.title}
                </h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">الوظائف المتاحة</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto mb-8">
              اكتشف الفرص المتاحة للانضمام إلى فريقنا
            </p>

            {/* Department Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {departments.map((dept) => (
                <button
                  key={dept.value}
                  onClick={() => setSelectedDepartment(dept.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedDepartment === dept.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-dark-tertiary text-accent-600 dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-dark-quaternary'
                    }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="card p-8 hover:shadow-large transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                      <h3 className="heading-3 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-accent-600 dark:text-dark-text-secondary mb-4">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {job.department}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {job.type}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          {job.experience}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="btn-primary">
                        تقدم للوظيفة
                      </button>
                      <button className="btn-outline">
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>

                  <p className="text-accent-600 dark:text-dark-text-secondary mb-6">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-3">المتطلبات</h4>
                      <ul className="space-y-2">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-accent-600 dark:text-dark-text-secondary">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {req}
                          </li>
                        ))}
                        {job.requirements.length > 3 && (
                          <li className="text-sm text-accent-500 dark:text-orange-500">
                            +{job.requirements.length - 3} متطلبات أخرى
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-3">المميزات</h4>
                      <ul className="space-y-2">
                        {job.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-accent-600 dark:text-dark-text-secondary">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {benefit}
                          </li>
                        ))}
                        {job.benefits.length > 3 && (
                          <li className="text-sm text-accent-500 dark:text-orange-500">
                            +{job.benefits.length - 3} مميزات أخرى
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-card-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-sm text-accent-500 dark:text-dark-text-secondary">
                        <span>تاريخ النشر: {formatDate(job.postedDate)}</span>
                        <span className="mx-2">•</span>
                        <span>آخر موعد للتقديم: {formatDate(job.applicationDeadline)}</span>
                      </div>
                      <button className="btn-outline text-sm">
                        مشاركة الوظيفة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h3 className="text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">لا توجد وظائف متاحة</h3>
              <p className="text-accent-600 dark:text-dark-text-secondary mb-6">لا توجد وظائف متاحة في هذا القسم حالياً</p>
              <button
                onClick={() => setSelectedDepartment('all')}
                className="btn-primary"
              >
                عرض جميع الوظائف
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            لم تجد الوظيفة المناسبة؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            أرسل لنا سيرتك الذاتية وسنتواصل معك عند توفر فرص مناسبة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              أرسل سيرتك الذاتية
            </Link>
            <Link href="/about" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
              تعرف على ثقافة الشركة
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="body-medium text-gray-400 dark:text-dark-text-tertiary mb-6">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">المنتج</h4>
              <ul className="space-y-3">
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                <li><Link href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</Link></li>
                <li><Link href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                <li><Link href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</Link></li>
                <li><Link href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</Link></li>
                <li><a href="https://hazem.vip" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مطور الموقع</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
