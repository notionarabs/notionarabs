'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Twitter, Globe, Users } from 'lucide-react';

const teamMembers = [
    {
        name: "مصطفى ياسر",
        role: "Co-Founder | Notion Expert",
        image: "/team/mostafa_yasser_orange_ai.png",
        social: {
            website: "https://www.mostafayasser.com/en",
            linkedin: "https://www.linkedin.com/in/engmsyasser/"
        },
        className: ""
    },
    {
        name: "حازم ياسر",
        role: "Co-Founder | Software Engineer",
        image: "/team/hazem_orange_ai.png",
        social: {
            linkedin: "https://www.linkedin.com/in/hazem-dev/",
            website: "https://hazem.vip/"
        },
        className: ""
    },
    /*
    {
        name: "مصطفى إسماعيل",
        role: "Automation Expert | Notion Consultant",
        image: "/team/mostafa_general_orange_ai.png",
        social: {
            linkedin: "https://www.linkedin.com/in/mostafa-notion/"
        },
        className: ""
    },
    {
        name: "مصطفى عجاج",
        role: "Notion Expert | AI Specialist",
        image: "/team/mostafa_ajaj_orange_ai.png",
        social: {
            linkedin: "https://www.linkedin.com/in/mustafa-ajaj/"
        },
        className: ""
    }
    */
];

const TeamCard = ({ member, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative flex flex-col bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border-none shadow-soft hover:shadow-large transition-all duration-500"
    >
        {/* Image Container - Immersive */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/20 dark:bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Social Icons - Floating on Image */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 translate-x-0 lg:translate-x-16 lg:group-hover:translate-x-0 transition-transform duration-500 delay-100">
                {member.social.website && (
                    <a href={member.social.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur-xl text-primary rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shadow-large">
                        <Globe size={20} />
                    </a>
                )}
                {member.social.linkedin && (
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur-xl text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-large">
                        <Linkedin size={20} />
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

        </div>
    </motion.div>
);

export default function TeamSection() {
    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-visible z-10">
            {/* Removed Background Texture for cleaner mesh look */}

            <div className="container-custom relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-8 border-none shadow-soft uppercase tracking-widest"
                    >
                        <Users size={14} />
                        <span>المؤسسون</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tighter leading-tight"
                    >
                        مؤسسو <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]">نوشن عرب</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-accent-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        تعرّف على الأشخاص الذين أسسوا نوشن عرب وأشعلوا شرارة هذه الرحلة. رؤيتهم هي التي تحرّك كل ما نبنيه.
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
                        className="w-full h-full aspect-[4/5] group relative flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all duration-500 shadow-soft hover:shadow-large"
                    >
                        <div className="flex flex-col items-center justify-center flex-grow text-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-glow">
                                <Users className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-3xl font-black text-accent-900 dark:text-white mb-4">
                                مكانك شاغر!
                            </h3>
                             <p className="text-lg text-accent-600 dark:text-gray-400 mb-10 font-medium">
                                نبحث دائماً عن مواهب استثنائية لتنضم إلينا في رحلتنا.
                            </p>
                            <Link href="/careers" className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-large hover:scale-105 transition-all">
                                انضم للفريق
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
