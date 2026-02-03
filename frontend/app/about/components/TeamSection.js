'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Linkedin, Twitter, Globe, Users } from 'lucide-react';

const teamMembers = [
    {
        name: "مصطفى ياسر",
        role: "الشريك المؤسس والرئيس التنفيذي | خبير نوشن",
        image: "/team/mostafa_yasser_orange_ai.png",
        bio: "يقود دفة عرب نوشن برؤية استراتيجية، ويمزج خبرته العميقة في نوشن لتمكين المجتمع العربي من أدوات الإنتاجية الحديثة.",
        social: {
            website: "https://www.mostafayasser.com/en",
            linkedin: "https://www.linkedin.com/in/engmsyasser/"
        },
        className: ""
    },
    {
        name: "حازم ياسر",
        role: "الشريك المؤسس والرئيس التقني",
        image: "/team/hazem_orange_ai.png",
        bio: "يقود الابتكار التقني في المنصة، مصمماً أدوات وتكاملات برمجية فريدة توسع قدرات نوشن لتلبي احتياجات المستخدم العربي.",
        social: {
            linkedin: "https://www.linkedin.com/in/hazem-dev/",
            website: "https://hazem.vip/"
        },
        className: ""
    },
    {
        name: "مصطفى عجاج",
        role: "خبير نوشن",
        image: "/team/mostafa_ajaj_orange_ai.png",
        bio: "يتقن فن الهيكلة والتنظيم، ويبني قواعد بيانات مترابطة تجعل من مساحة عملك محركاً للإنتاجية لا مستودعاً للملفات.",
        social: {
            linkedin: "https://www.linkedin.com/in/mustafa-ajaj/"
        },
        className: ""
    },
    {
        name: "مصطفى إسماعيل",
        role: "خبير نوشن",
        image: "/team/mostafa_general_orange_ai.png",
        bio: "مبدع في تخصيص تجربة نوشن، وصناعة قوالب ذكية تضفي المتعة والسهولة على إنجاز مهامك اليومية.",
        social: {
            linkedin: "https://www.linkedin.com/in/mostafa-notion/"
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
        className="group relative flex flex-col bg-white dark:bg-dark-card-bg rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-card-border shadow-soft hover:shadow-2xl transition-all duration-500"
    >
        {/* Image Container - Large & Immersive */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Social Icons - Floating on Image */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-0 lg:translate-x-12 lg:group-hover:translate-x-0 transition-transform duration-500 delay-100">
                {member.social.twitter && (
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white hover:text-blue-500 transition-all duration-300">
                        <Twitter size={18} />
                    </a>
                )}
                {member.social.linkedin && (
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white hover:text-blue-700 transition-all duration-300">
                        <Linkedin size={18} />
                    </a>
                )}
                {member.social.website && (
                    <a href={member.social.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300">
                        <Globe size={18} />
                    </a>
                )}
            </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-grow p-6 relative z-10">
            {/* Role Tag */}
            <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold tracking-wide border border-primary-100 dark:border-primary-800/30">
                    {member.role}
                </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {member.name}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500 mb-4">
                {member.bio}
            </p>

            {/* Bottom Decoration */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 group-hover:w-full transition-all duration-700"></div>
            </div>
        </div>
    </motion.div>
);

export default function TeamSection() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-dark-tertiary relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="container-custom relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-6 shadow-sm backdrop-blur-sm"
                    >
                        <Users size={16} />
                        <span>فريقنا</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
                    >
                        العقول خلف <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">الإبداع</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        نؤمن بأن العمل العظيم يبدأ بفريق عظيم. تعرف على الشغوفين الذين يبنون مستقبل الإنتاجية.
                    </motion.p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map((member, index) => (
                        <TeamCard key={index} member={member} index={index} />
                    ))}

                    {/* Join Us Card - Styled to Match */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="w-full h-full aspect-[4/5] group relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-dark-card-bg dark:to-dark-elem-bg rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center justify-center flex-grow">
                            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                                <Users className="w-10 h-10 text-primary-500 dark:text-primary-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                                مكانك شاغر!
                            </h3>
                            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-[200px]">
                                نبحث دائماً عن مواهب استثنائية لتنضم إلينا.
                            </p>
                            <a href="/careers" className="px-6 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 font-bold text-gray-900 dark:text-white hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                                انضم للفريق
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
