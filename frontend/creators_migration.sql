INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '69ad7249b1194ec5fd66dbd6',
    'Nuvin',
    'its.nuvin@gmail.com',
    'its.nuvin',
    'https://lh3.googleusercontent.com/a/ACg8ocLOH8pXS8HsGd2904UBLRxLKzeGlSNHkn1Y_JHpFPfz0zAqHLg=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '697e35eb2e18ee21814c4411',
    'Notion Muslims',
    'notionmuslims@gmail.com',
    'notionmuslims',
    'https://lh3.googleusercontent.com/a/ACg8ocIaVyI-DCw7R_T6PpLt5Ivy7H5_xKVRmWNnfjghlpz6DgneYCs=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '698ea7d4258e06c54c2700db',
    'ADHAM MOHAMED',
    'adhammohamed300s@gmail.com',
    'adhammohamed300s',
    'https://lh3.googleusercontent.com/a/ACg8ocJ1j6z5afquFjQp1LO51-e1BbxEiq6-U6uxQwkphyXXt-24FStU=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '69823da3115e30df353a7637',
    'مصطفى ياسر',
    'mostafa.notion@gmail.com',
    'mostafa.notion',
    'https://lh3.googleusercontent.com/a/ACg8ocJX2wobSC8PX6BY1qM2E-jUNHGiBxwOFvgDZALw4lvzwTmiUA=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '698179d778d3ef30776ee063',
    'Basant Badr',
    'basantbadr17@gmail.com',
    'basantbadr17',
    'https://lh3.googleusercontent.com/a/ACg8ocJOHtKJYoHXyTSpLf9hDJI7Ifch3-t2-IVpmA7sVtZX-PVyCw=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '697cdd113425b2c2d38d4fdf',
    'HAITHAM H, TONY',
    'htony107@gmail.com',
    'htony107',
    'https://lh3.googleusercontent.com/a/ACg8ocKoXNLlA6qW8NTEJM5MOgatBbTYdjyajButNpn-u3HVCbz0cd_L7A=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '691dc0534ce3f2f1b1e40971',
    'AMMAR HARIRI HARIRI',
    'ammarharirihariri@gmail.com',
    'ammarharirihariri',
    'https://lh3.googleusercontent.com/a/ACg8ocJdb91z3QCnIjv008l4Vfgk-JavjB92a7cRfWcBEJGb3l5E2A=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '696ec4189323f84187bdd233',
    'Rayhana Al Islam',
    'rayhanaalislam753@gmail.com',
    'rayhanaalislam753',
    'https://lh3.googleusercontent.com/a/ACg8ocL4kWgwUoP-OIIcBj9khkQddPvC8m-AAdXSVB6IWdsysHT4VnNO=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '696a79d3fdeda5ca156a9899',
    'Ezdehar daradkeh',
    'daradkehmh@gmail.com',
    'daradkehmh',
    '',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_moldtdev',
    'Moldt Dev',
    'moldtdev@gmail.com',
    'moldtdev',
    '',
    'طالب يطمح في هندسة البرمجيات ومحب لنوشن والتنظيم',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_mustafaajaj97',
    'مصطفى عجاج',
    'mustafaajaj97@gmail.com',
    'mustafaajaj97',
    '',
    'إن نظرتي لنوشن تتجاوز مجرد التصميم الجمالي أنا',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_avisional',
    'avisional',
    'avisional.business@gmail.com',
    'avisional',
    '',
    'مصمم جرافيكي ومصمم قوالب، خبرة تمتد لسنوات في نوشن والانتاجية.',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_waeltalaat',
    'Wael Talaat',
    'waelmarashly@gmail.com',
    'waeltalaat',
    '',
    'كاتب هاوى ومنشئ محتوى بدأت رحلتى مع نوشن مبكراً 2021م مولع باستكشاف نوشن وتحديثاتها وتطبيق ما تعلمته عنها فى قوالب اما بانشاء قوالب من الصفر أو بالاضافة لقوالب قمت بتحميلها من الانترنت.',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_hazem',
    'حازم',
    'hazemyasser911@gmail.com',
    'hazem',
    '',
    'مطور ويب',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_moali1362003',
    'محمد علي',
    'mohamedali1362003@gmail.com',
    'moali1362003',
    '',
    'هاوي في التنظيم وحب نوشن',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_hazemmf3501',
    'hazem mohamed',
    'hazemmf3501@gmail.com',
    'hazemmf3501',
    '',
    'مترجم ومدرب لفة صينية، خبره عمليه سنة في مجال',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_mostafa',
    'مصطفى ياسر',
    'engmsyasser@gmail.com',
    'mostafa',
    '',
    'مهندس تخطيط وجدولة وصانع محتوى وقوالب نوشن معتمد بخبرة تتجاوز خمس سنوات. أشارك خبراتي في التنظيم والإنتاجية عبر قوالب مبتكرة وأدوات عملية تساعدك تعمل بذكاء أكثر تابعني لاكتشاف أفضل القوالب والأفكار لتنظيم عملك وحياتك.',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    '6911d012a3e541c894edc87d',
    'Abdelrahman Shehata',
    'bodymasar99@gmail.com',
    'bodymasar99',
    'https://lh3.googleusercontent.com/a/ACg8ocIQZTJULlGOEmBpfRvi6cSYrxcgP-cCKE34b8Stig47v6e6XcIpgg=s400-c',
    '',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';

INSERT INTO public."User" (id, name, email, username, "profilePicture", bio, role, "creatorStatus", "socialLinks", badges, "isActive")
VALUES (
    'user_dr_nourrr',
    '𝑫𝒓 𝑵𝒐𝒖𝒓 𝑴𝒐𝒉𝒂𝒎𝒆𝒅',
    'nourmohamedanwar@gmail.com',
    'dr_nourrr',
    '',
    'طَالب يطلُب عِلم الطب .. مُتخصص في إنشاء قَوالِب نوشن ، ومُهتم بنَشر كلُ ما يتعلمُه',
    'USER',
    'APPROVED',
    '[]'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    "profilePicture" = EXCLUDED."profilePicture",
    bio = EXCLUDED.bio,
    "creatorStatus" = 'APPROVED';