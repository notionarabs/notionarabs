'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Linkedin, Twitter, Globe, Users } from 'lucide-react';

const teamMembers = [
    {
        name: "حازم ياسر",
        role: "المؤسس والرئيس التنفيذي",
        image: "/team/hazem.jpg", // Placeholder - make sure to have images or use avatars
        bio: "خبير في أنظمة الإنتاجية وبناء المجتمعات الرقمية. شغوف بتمكين المحتوى العربي.",
        social: {
            twitter: "#",
            linkedin: "#"
        },
        className: "md:col-span-2 md:row-span-2" // Large Featured Card
    },
    {
        name: "سارة أحمد",
        role: "مديرة المحتوى",
        image: "/team/sara.jpg",
        bio: "كاتبة محتوى إبداعي متخصصة في تبسيط المفاهيم التقنية.",
        social: {
            linkedin: "#"
        },
        className: ""
    },
    {
        name: "عمر خالد",
        role: "مطور واجهات",
        image: "/team/omar.jpg",
        bio: "مهندس برمجيات يعشق بناء تجارب مستخدم سلسة وتفاعلية.",
        social: {
            twitter: "#",
            website: "#"
        },
        className: ""
    },
    {
        name: "نورا علي",
        role: "مصممة جرافيك",
        image: "/team/nora.jpg",
        bio: "تحول الأفكار المعقدة إلى تصاميم بصرية جذابة وسهلة الفهم.",
        social: {
            linkedin: "#"
        },
        className: ""
    }
];

const TeamCard = ({ member, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group relative overflow-hidden bg-white dark:bg-dark-card-bg rounded-3xl border border-gray-100 dark:border-dark-card-border shadow-soft hover:shadow-lg transition-all duration-300 ${member.className}`}
    >
        <div className="flex flex-col h-full p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden relative border-2 border-white dark:border-gray-700 shadow-md">
                    {/* Fallback avatar if no image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Users size={32} />
                    </div>
                    {/* <Image src={member.image} alt={member.name} layout="fill" objectFit="cover" /> */}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0 rtl:-translate-x-4 rtl:group-hover:translate-x-0">
                    {member.social.twitter && (
                        <a href={member.social.twitter} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            <Twitter size={18} />
                        </a>
                    )}
                    {member.social.linkedin && (
                        <a href={member.social.linkedin} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            <Linkedin size={18} />
                        </a>
                    )}
                </div>
            </div>

            <div className="mt-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-accent-800 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-3">
                    {member.role}
                </p>
                <p className="text-accent-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                    {member.bio}
                </p>
            </div>
        </div>
    </motion.div>
);

export default function TeamSection() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-tertiary">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-medium text-sm mb-4"
                    >
                        <Users size={16} />
                        <span>فريقنا</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-800 dark:text-white mb-4"
                    >
                        العقول خلف الكواليس
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-accent-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        مجموعة من الشغوفين يجمعهم هدف واحد: إثراء المحتوى العربي.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {teamMembers.map((member, index) => (
                        <TeamCard key={index} member={member} index={index} />
                    ))}

                    {/* Join Us Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                        </div>
                        <h3 className="text-xl font-bold text-accent-600 dark:text-gray-300 mb-2">دورك هنا؟</h3>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-4">
                            نبحث دائماً عن مواهب جديدة.
                        </p>
                        <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:underline">
                            انضم للفريق &larr;
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
