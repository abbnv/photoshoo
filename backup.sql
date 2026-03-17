--
-- PostgreSQL database dump
--

\restrict TKfEYn6p5osAfpsvIbAdiTF15BOG25i8PzosZS1EdbaoO6aHbHW5OTnJhqrhUgr

-- Dumped from database version 16.13
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: admin_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_configs (
    id integer NOT NULL,
    key character varying(50) DEFAULT 'default'::character varying NOT NULL,
    fal_api_key text,
    openai_api_key text,
    default_generations_per_photoshoot integer DEFAULT 12 NOT NULL,
    base_prompt_template text NOT NULL,
    edit_prompt_templates jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    format_presets jsonb,
    impression_options jsonb,
    portrait_prompt_config jsonb,
    runtime_settings jsonb,
    scene_definitions jsonb,
    use_case_options jsonb,
    variation_chips jsonb,
    billing_config jsonb,
    lava_api_key text,
    lava_webhook_api_key text,
    lava_webhook_basic_login character varying(255),
    lava_webhook_basic_password text
);


--
-- Name: admin_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_configs_id_seq OWNED BY public.admin_configs.id;


--
-- Name: billing_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_payments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    lava_contract_id character varying(64) NOT NULL,
    tariff_key character varying(64) NOT NULL,
    tariff_label character varying(255) NOT NULL,
    offer_id character varying(64) NOT NULL,
    tokens integer NOT NULL,
    amount_minor integer,
    currency character varying(8),
    status character varying(32) DEFAULT 'pending'::character varying NOT NULL,
    raw_payload jsonb,
    processed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: billing_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.billing_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: billing_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.billing_payments_id_seq OWNED BY public.billing_payments.id;


--
-- Name: generated_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_images (
    id integer NOT NULL,
    photoshoot_id integer NOT NULL,
    url text NOT NULL,
    cloud_storage_path text,
    is_public boolean DEFAULT true NOT NULL,
    prompt text,
    seed integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: generated_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.generated_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generated_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.generated_images_id_seq OWNED BY public.generated_images.id;


--
-- Name: photoshoots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photoshoots (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    quiz_answers jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: photoshoots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.photoshoots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: photoshoots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.photoshoots_id_seq OWNED BY public.photoshoots.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    session_token text NOT NULL,
    user_id integer NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: source_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_images (
    id integer NOT NULL,
    photoshoot_id integer NOT NULL,
    url text NOT NULL,
    cloud_storage_path text,
    is_public boolean DEFAULT true NOT NULL,
    file_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: source_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.source_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: source_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.source_images_id_seq OWNED BY public.source_images.id;


--
-- Name: token_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    delta integer NOT NULL,
    reason character varying(64) NOT NULL,
    meta jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: token_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_transactions_id_seq OWNED BY public.token_transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    password character varying(255),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    token_balance integer DEFAULT 10 NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: admin_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_configs ALTER COLUMN id SET DEFAULT nextval('public.admin_configs_id_seq'::regclass);


--
-- Name: billing_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_payments ALTER COLUMN id SET DEFAULT nextval('public.billing_payments_id_seq'::regclass);


--
-- Name: generated_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_images ALTER COLUMN id SET DEFAULT nextval('public.generated_images_id_seq'::regclass);


--
-- Name: photoshoots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photoshoots ALTER COLUMN id SET DEFAULT nextval('public.photoshoots_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: source_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_images ALTER COLUMN id SET DEFAULT nextval('public.source_images_id_seq'::regclass);


--
-- Name: token_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transactions ALTER COLUMN id SET DEFAULT nextval('public.token_transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: admin_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_configs (id, key, fal_api_key, openai_api_key, default_generations_per_photoshoot, base_prompt_template, edit_prompt_templates, created_at, updated_at, format_presets, impression_options, portrait_prompt_config, runtime_settings, scene_definitions, use_case_options, variation_chips, billing_config, lava_api_key, lava_webhook_api_key, lava_webhook_basic_login, lava_webhook_basic_password) FROM stdin;
1	default	cbc8aa62-ffc0-4bb3-8b8e-1c690f13ee73:f04f76a01605fbaa40bf61fba8125c1b	replace_with_openrouter_key	5	Keep the person face and identity exactly the same. Create a photorealistic premium portrait of this same person with natural skin texture, believable lighting, and elegant candid realism.	["Keep the person face and identity exactly the same. Create a refined portrait variation with believable {{background}} environment, natural {{lighting}} light, {{expression}} expression, and a polished {{style}} look without changing identity.", "Keep the same person exactly. Transform this scene into a premium {{style}} portrait with a natural {{background}} setting, realistic {{lighting}} lighting, and a subtle {{expression}} emotional tone.", "Preserve identity perfectly. Generate a professional portrait variation with {{background}} atmosphere, {{lighting}} light quality, {{expression}} expression, and a polished but natural {{style}} aesthetic.", "Same face, same identity, same person. Create a candid premium portrait in a {{background}} environment with realistic {{lighting}} light, {{expression}} expression, and clean {{style}} styling."]	2026-03-14 22:46:14.447	2026-03-17 10:10:06.641	[{"key": "portrait_9x16", "label": "Портрет 9:16", "enabled": true, "aspectRatio": "9:16", "outputFormat": "png", "resolutionPreset": "portrait_hd"}, {"key": "landscape_16x9", "label": "Горизонталь 16:9", "enabled": true, "aspectRatio": "16:9", "outputFormat": "png", "resolutionPreset": "landscape_hd"}, {"key": "avatar_1x1", "label": "Аватар 1:1", "enabled": true, "aspectRatio": "1:1", "outputFormat": "png", "resolutionPreset": "square_hd"}, {"key": "profile_4x5", "label": "Профиль 4:5", "enabled": true, "aspectRatio": "4:5", "outputFormat": "png", "resolutionPreset": "portrait_web"}]	[{"key": "professional", "label": "Профессионально", "enabled": true, "toneInstruction": "Look polished, trustworthy and composed."}, {"key": "friendly", "label": "Дружелюбно", "enabled": true, "toneInstruction": "Look warm, open and approachable."}, {"key": "confident", "label": "Уверенно", "enabled": true, "toneInstruction": "Look self-assured, focused and strong."}, {"key": "stylish", "label": "Стильно", "enabled": true, "toneInstruction": "Look modern, editorial and visually polished."}, {"key": "premium", "label": "Премиально", "enabled": true, "toneInstruction": "Look elevated, refined and premium."}, {"key": "natural", "label": "Естественно", "enabled": true, "toneInstruction": "Look authentic, relaxed and natural."}]	{"basePromptTemplate": "Keep the person face and identity exactly the same. Create a photorealistic premium portrait of this same person with natural skin texture, believable lighting, and elegant candid realism.", "editPromptTemplates": ["Keep the person face and identity exactly the same. Create a refined portrait variation with believable {{background}} environment, natural {{lighting}} light, {{expression}} expression, and a polished {{style}} look without changing identity.", "Keep the same person exactly. Transform this scene into a premium {{style}} portrait with a natural {{background}} setting, realistic {{lighting}} lighting, and a subtle {{expression}} emotional tone.", "Preserve identity perfectly. Generate a professional portrait variation with {{background}} atmosphere, {{lighting}} light quality, {{expression}} expression, and a polished but natural {{style}} aesthetic.", "Same face, same identity, same person. Create a candid premium portrait in a {{background}} environment with realistic {{lighting}} light, {{expression}} expression, and clean {{style}} styling."], "qualityPromptTemplate": "Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel."}	{"defaultAspectRatio": "9:16", "defaultOutputFormat": "png", "defaultResolutionPreset": "portrait_hd", "defaultGenerationsPerPhotoshoot": 5}	[{"id": "minimal-office", "title": "Светлый офис", "enabled": true, "subtitle": "Чистый деловой интерьер с мягким дневным светом", "rankingWeight": 100, "lightingFamily": "soft_daylight", "locationFamily": "office", "wardrobeFamily": "business", "compositionHint": "waist up portrait with clean negative space", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["resume", "website", "avatarka", "universal"], "scenePromptTemplate": "Transform the environment into a premium modern office with clean architecture, glass details, natural daylight, and a calm upscale business atmosphere.", "supportedImpressions": ["professional", "confident", "friendly"], "portraitPromptTemplate": "Keep the person exactly the same. Create a natural professional portrait with confident presence, elegant smart business styling, realistic skin texture, and believable candid body language."}, {"id": "studio-classic", "title": "Студийная классика", "enabled": true, "subtitle": "Нейтральная студия и мягкий портретный свет", "rankingWeight": 95, "lightingFamily": "portrait_softbox", "locationFamily": "studio", "wardrobeFamily": "smart_casual", "compositionHint": "tight portrait framing with refined headshot look", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["avatarka", "resume", "website", "universal"], "scenePromptTemplate": "Use a refined neutral studio environment with seamless backdrop, soft controlled light, minimal distractions, and premium portrait studio realism.", "supportedImpressions": ["professional", "premium", "natural"], "portraitPromptTemplate": "Keep the face exactly the same. Create a timeless premium headshot with natural expression, crisp realistic detail, soft flattering light, and clean professional styling without plastic retouching."}, {"id": "city-lifestyle", "title": "Городской lifestyle", "enabled": true, "subtitle": "Современный городской фон и живой профессиональный образ", "rankingWeight": 90, "lightingFamily": "natural_outdoor", "locationFamily": "city", "wardrobeFamily": "smart_casual", "compositionHint": "portrait with shallow depth and environmental context", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["instagram", "socials", "website", "universal"], "scenePromptTemplate": "Transform the scene into a candid luxury lifestyle moment in an upscale city environment with clean architecture, glass buildings, soft urban depth, and expensive but natural atmosphere.", "supportedImpressions": ["confident", "stylish", "friendly"], "portraitPromptTemplate": "Keep the person identity exactly the same. Create a candid confident lifestyle portrait with elegant smart casual styling, natural lighting, slightly imperfect framing, subtle influencer polish, and successful entrepreneur energy."}, {"id": "glass-boardroom", "title": "Премиальная переговорка", "enabled": true, "subtitle": "Стекло, архитектура и уверенный корпоративный вайб", "rankingWeight": 98, "lightingFamily": "window_contrast", "locationFamily": "office", "wardrobeFamily": "executive", "compositionHint": "mid shot portrait with architectural depth and confident stance", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["resume", "website", "avatarka", "universal"], "scenePromptTemplate": "Create an upscale executive boardroom setting with glass walls, premium materials, strong architectural lines, and a discreet high-status corporate atmosphere.", "supportedImpressions": ["professional", "confident", "premium"], "portraitPromptTemplate": "Keep the face identical. Create an executive portrait with calm authority, expensive but natural business styling, realistic skin detail, and confident post-call energy."}, {"id": "warm-editorial-studio", "title": "Тёплая editorial-студия", "enabled": true, "subtitle": "Мягкий тёплый свет и журнальная подача без перегруза", "rankingWeight": 92, "lightingFamily": "warm_editorial", "locationFamily": "studio", "wardrobeFamily": "elevated_casual", "compositionHint": "fashion-inspired portrait with clean composition and subtle attitude", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["instagram", "website", "socials", "universal"], "scenePromptTemplate": "Create a warm editorial studio setup with textured backdrop, soft amber highlights, depth, and premium fashion-photography atmosphere.", "supportedImpressions": ["stylish", "premium", "natural"], "portraitPromptTemplate": "Keep the same face and identity. Create a stylish editorial portrait with natural skin, refined expression, softly polished Instagram-ready finish, and modern premium energy without overprocessing."}, {"id": "dark-premium-studio", "title": "Тёмная premium-студия", "enabled": true, "subtitle": "Контрастный свет и дорогой, собранный образ", "rankingWeight": 94, "lightingFamily": "cinematic_contrast", "locationFamily": "studio", "wardrobeFamily": "premium_dark", "compositionHint": "tight portrait framing with sculpted light and premium mood", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["avatarka", "website", "socials", "universal"], "scenePromptTemplate": "Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff.", "supportedImpressions": ["premium", "confident", "stylish"], "portraitPromptTemplate": "Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence."}, {"id": "sunlit-cafe", "title": "Светлое кафе", "enabled": true, "subtitle": "Живой городской интерьер для тёплого личного бренда", "rankingWeight": 89, "lightingFamily": "sunlit_indoor", "locationFamily": "interior", "wardrobeFamily": "smart_casual", "compositionHint": "environmental portrait with lifestyle framing and gentle depth of field", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["instagram", "socials", "website", "universal"], "scenePromptTemplate": "Transform the setting into a bright upscale cafe with airy daylight, tasteful interior design, lifestyle energy, and soft premium city atmosphere.", "supportedImpressions": ["friendly", "natural", "stylish"], "portraitPromptTemplate": "Keep the same face. Create a relaxed but polished lifestyle portrait with approachable confidence, natural smile or soft expression, clean color, and believable candid realism."}, {"id": "founder-home-office", "title": "Домашний office founder", "enabled": true, "subtitle": "Спокойный интерьер с ощущением личного рабочего пространства", "rankingWeight": 88, "lightingFamily": "soft_window", "locationFamily": "interior", "wardrobeFamily": "founder_casual", "compositionHint": "half-body portrait with contextual workspace details", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["website", "socials", "instagram", "universal"], "scenePromptTemplate": "Create a refined founder home-office environment with tasteful workspace details, soft daylight, depth, and personal brand authenticity.", "supportedImpressions": ["friendly", "natural", "confident"], "portraitPromptTemplate": "Keep the same identity. Create a founder-style portrait with relaxed confidence, authentic posture, premium casual styling, and realistic personal-brand photography feel."}, {"id": "green-park-morning", "title": "Парк утром", "enabled": true, "subtitle": "Свежий естественный свет и спокойный outdoor-портрет", "rankingWeight": 84, "lightingFamily": "morning_daylight", "locationFamily": "outdoor", "wardrobeFamily": "casual_clean", "compositionHint": "portrait with soft bokeh and clean natural background separation", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["instagram", "socials", "universal"], "scenePromptTemplate": "Place the person in a fresh morning park setting with soft natural daylight, gentle greenery blur, and premium outdoor calm.", "supportedImpressions": ["natural", "friendly", "confident"], "portraitPromptTemplate": "Keep the person exactly the same. Create a natural outdoor portrait with realistic skin, relaxed confidence, believable daylight, and non-plastic premium realism."}, {"id": "urban-evening-editorial", "title": "Вечерний urban editorial", "enabled": true, "subtitle": "Городские огни, глубина и модный визуальный тон", "rankingWeight": 91, "lightingFamily": "evening_city", "locationFamily": "city", "wardrobeFamily": "editorial_city", "compositionHint": "vertical portrait with cinematic city depth and confident framing", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["instagram", "socials", "website", "universal"], "scenePromptTemplate": "Create an upscale evening city moment with premium architecture lights, cinematic depth, modern metropolitan energy, and editorial sophistication.", "supportedImpressions": ["stylish", "premium", "confident"], "portraitPromptTemplate": "Keep the face identical. Create a stylish evening editorial portrait with natural confidence, luxury lifestyle vibe, slightly candid framing, and polished but believable realism."}, {"id": "neutral-cream-backdrop", "title": "Кремовый backdrop", "enabled": true, "subtitle": "Спокойный нейтральный фон для универсального headshot", "rankingWeight": 87, "lightingFamily": "soft_even", "locationFamily": "studio", "wardrobeFamily": "universal_clean", "compositionHint": "clean close-up headshot with minimal distractions", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["avatarka", "resume", "website", "universal"], "scenePromptTemplate": "Use a clean cream backdrop with minimal setup, premium simplicity, soft tonal separation, and elegant studio restraint.", "supportedImpressions": ["professional", "natural", "friendly"], "portraitPromptTemplate": "Keep the same person exactly. Create a clean premium headshot with balanced expression, natural realism, subtle retouching, and crisp but human skin detail."}, {"id": "conference-speaker-lobby", "title": "Lobby спикера", "enabled": true, "subtitle": "Современное пространство конференции для экспертного образа", "rankingWeight": 93, "lightingFamily": "event_soft", "locationFamily": "office", "wardrobeFamily": "speaker_smart", "compositionHint": "portrait with open background and credible expert presence", "formatPresetKey": "portrait_9x16", "supportedUseCases": ["website", "resume", "socials", "universal"], "scenePromptTemplate": "Create a modern conference lobby environment with premium event design, glass and soft interior depth, and credible expert-speaker atmosphere.", "supportedImpressions": ["professional", "confident", "friendly"], "portraitPromptTemplate": "Keep the face unchanged. Create an expert speaker portrait with approachable authority, natural posture, clean professional styling, and realistic high-end event photography feel."}]	[{"key": "instagram", "hint": "Личный бренд и профиль", "label": "Instagram", "enabled": true}, {"key": "avatarka", "hint": "Аватар и мессенджеры", "label": "Аватарка", "enabled": true}, {"key": "resume", "hint": "CV и hh.ru", "label": "Резюме", "enabled": true}, {"key": "website", "hint": "Лендинг и about section", "label": "Сайт", "enabled": true}, {"key": "socials", "hint": "Контент для публикаций", "label": "Соцсети", "enabled": true}, {"key": "universal", "hint": "Многоцелевой набор", "label": "Универсально", "enabled": true}]	[{"key": "another_scene", "label": "Другая сцена", "enabled": true, "instruction": "Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup.", "displayOrder": 1, "compatibleUseCases": ["instagram", "avatarka", "resume", "website", "socials", "universal"], "compatibleSceneFamilies": ["office", "studio", "city", "interior", "outdoor"]}, {"key": "another_outfit", "label": "Другая одежда", "enabled": true, "instruction": "Keep the same person, same scene, same location, same background, same lighting, and same general composition. Change only the outfit and wardrobe styling to another believable option that fits the same shoot concept. Do not noticeably alter the environment or expression.", "displayOrder": 2, "compatibleUseCases": ["instagram", "avatarka", "resume", "website", "socials", "universal"], "compatibleSceneFamilies": ["office", "studio", "city", "interior", "outdoor"]}, {"key": "another_lighting", "label": "Другой свет", "enabled": true, "instruction": "Keep the same person, same outfit, same location, same background composition, and same overall shot. Change only the lighting style and light mood. Preserve the scene and wardrobe almost exactly, while giving the photo a different but realistic lighting setup.", "displayOrder": 3, "compatibleUseCases": ["instagram", "avatarka", "resume", "website", "socials", "universal"], "compatibleSceneFamilies": ["office", "studio", "city", "interior", "outdoor"]}, {"key": "another_expression", "label": "Другое выражение", "enabled": true, "instruction": "Keep the same person, same scene, same outfit, same background, and same lighting. Change only the facial expression and micro-emotion while preserving realism, identity, and the rest of the shot as consistently as possible.", "displayOrder": 4, "compatibleUseCases": ["instagram", "avatarka", "resume", "website", "socials", "universal"], "compatibleSceneFamilies": ["office", "studio", "city", "interior", "outdoor"]}]	{"tariffs": [{"key": "starter_20", "label": "Starter", "tokens": 20, "enabled": true, "offerId": "", "currency": "RUB", "priceLabel": "990 рублей", "description": "20 токенов", "displayOrder": 1}, {"key": "pro_60", "label": "Pro", "tokens": 60, "enabled": true, "offerId": "", "currency": "RUB", "priceLabel": "1890 рублей", "description": "60 токенов", "displayOrder": 2}, {"key": "max_150", "label": "Max", "tokens": 150, "enabled": true, "offerId": "", "currency": "RUB", "priceLabel": "2490 рублей", "description": "150 токенов", "displayOrder": 3}], "trialGenerations": 10, "tokenCostPerGeneration": 1}	52cjc3q4fiXZp256BSU9F0CFoRwFvAXaIVVyU2mGrKEoWYC5dgvBYIk9e7feiuyd	\N	lava	lava
\.


--
-- Data for Name: billing_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.billing_payments (id, user_id, lava_contract_id, tariff_key, tariff_label, offer_id, tokens, amount_minor, currency, status, raw_payload, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: generated_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.generated_images (id, photoshoot_id, url, cloud_storage_path, is_public, prompt, seed, created_at) FROM stdin;
37	20	https://v3b.fal.media/files/b/0a925348/XRv38L6I3vOTbSEOJ0YmS_jCsPIIaB.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Instagram. Desired impression: Стильно. Look modern, editorial and visually polished. Scene direction: Urban evening city scene, premium architecture lights, editorial mood, modern metropolitan atmosphere Portrait direction: Editorial evening portrait, stylish expression, strong identity fidelity, polished realism Location family: city. Lighting family: evening_city. Wardrobe direction: editorial_city. Composition: vertical portrait with cinematic city depth and confident framing. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 9:16, png.	\N	2026-03-15 23:29:47.093
38	20	https://v3b.fal.media/files/b/0a925348/xHfnfsH1zq5SjKC4gSTqN_qL9BPpXy.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Instagram. Desired impression: Стильно. Look modern, editorial and visually polished. Scene direction: Urban evening city scene, premium architecture lights, editorial mood, modern metropolitan atmosphere Portrait direction: Editorial evening portrait, stylish expression, strong identity fidelity, polished realism Location family: city. Lighting family: evening_city. Wardrobe direction: editorial_city. Composition: vertical portrait with cinematic city depth and confident framing. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 9:16, png.	\N	2026-03-15 23:29:47.133
39	20	https://v3b.fal.media/files/b/0a925349/648fepl52mMy7-hgq5W74_wlEEeKNM.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Instagram. Desired impression: Стильно. Look modern, editorial and visually polished. Scene direction: Urban evening city scene, premium architecture lights, editorial mood, modern metropolitan atmosphere Portrait direction: Editorial evening portrait, stylish expression, strong identity fidelity, polished realism Location family: city. Lighting family: evening_city. Wardrobe direction: editorial_city. Composition: vertical portrait with cinematic city depth and confident framing. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 9:16, png.	\N	2026-03-15 23:29:47.137
40	22	https://v3b.fal.media/files/b/0a925387/XW5_xEf1RXE2UV3TgOdlL_CzEcGcPO.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png.	\N	2026-03-15 23:40:21.34
41	22	https://v3b.fal.media/files/b/0a925387/M5k7_iH8gNmSWsPJwon2M_caJ2sKX3.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png.	\N	2026-03-15 23:40:21.375
42	22	https://v3b.fal.media/files/b/0a925389/ZKUwMx_VM2gtUQM8jMc5s_x4T9i5R6.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png.	\N	2026-03-15 23:40:21.382
43	22	https://v3b.fal.media/files/b/0a926504/l1ezOW9NPjRmXrd4T1PvI_KGhyM9vw.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:06:11.877
44	22	https://v3b.fal.media/files/b/0a92650c/q_FF9GTN8OQLBm-rnJ1rM_SEw5G6gX.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:07:30.275
45	22	https://v3b.fal.media/files/b/0a92651c/xSIYmSU_3SuKXo9EbJptq_prDPLsRk.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:10:09.4
46	22	https://v3b.fal.media/files/b/0a92652b/QLjfLtFrOb-3qFWc78Msw_FZYG2Wz1.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:12:46.408
47	22	https://v3b.fal.media/files/b/0a926578/h3RgsrS8NLMHssaY00tHG_6zTelSfb.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup. Strict guardrail: Only change the surrounding environment and background staging within the same location family. Keep wardrobe, styling, expression, identity, and overall shot character substantially the same. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:25:37.823
48	22	https://v3b.fal.media/files/b/0a926595/ZBhZLJij-ufsQJiahZKZ1_O180zfHg.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup. Strict guardrail: Only change the surrounding environment and background staging within the same location family. The background must be visibly different from the approved image. Keep wardrobe, styling, expression, identity, and overall shot character substantially the same. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup. Strict guardrail: Only change the surrounding environment and background staging within the same location family. Keep wardrobe, styling, expression, identity, and overall shot character substantially the same. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:30:19.459
49	22	https://v3b.fal.media/files/b/0a9265b3/T_m62MFQ0dtltnaLHg5DT_C7u3xoEo.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same scene, same location, same background, same lighting, and same general composition. Change only the outfit and wardrobe styling to another believable option that fits the same shoot concept. Do not noticeably alter the environment or expression. Strict guardrail: Only change wardrobe and clothing details. Keep the same location, background, scene composition, identity, and lighting as close as possible to the approved shot. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup. Strict guardrail: Only change the surrounding environment and background staging within the same location family. The background must be visibly different from the approved image. Keep wardrobe, styling, expression, identity, and overall shot character substantially the same. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same clothing, same styling direction, same framing feel, and same expression as much as possible. Change only the surrounding scene and background composition inside the same location family. Do not noticeably change outfit, pose, lighting setup, or identity. The result should feel like the same shoot in a different nearby setup. Strict guardrail: Only change the surrounding environment and background staging within the same location family. Keep wardrobe, styling, expression, identity, and overall shot character substantially the same. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:35:27.22
50	22	https://v3b.fal.media/files/b/0a9265dc/Lm_Krg_UqtvmacSjxHQOn_pGhjkhb4.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same outfit, same location, same background composition, and same overall shot. Change only the lighting style and light mood. Preserve the scene and wardrobe almost exactly, while giving the photo a different but realistic lighting setup. Strict guardrail: Only change the lighting mood and light setup. Keep the same person, same outfit, same scene, same location, and same background composition. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:42:13.548
51	22	https://v3b.fal.media/files/b/0a92662f/MIm1UylOPgepkrVl5M8Zm_x3Zjx3wd.png	\N	t	Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Preserve all non-requested elements from the approved image as closely as possible. Do not drift into a different concept, different person, different styling direction, or different scene family unless the chip explicitly asks for that exact dimension only. Variation instruction: Keep the same person, same scene, same location, same background, same lighting, and same general composition. Change only the outfit and wardrobe styling to another believable option that fits the same shoot concept. Do not noticeably alter the environment or expression. Strict guardrail: Only change wardrobe and clothing details. Keep the same location, background, scene composition, identity, and lighting as close as possible to the approved shot. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person and shoot concept, but generate a different scene variation inside the same location family. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. This is a shot-level variation of an already approved photoshoot result. Keep the same person, same core shoot direction, same realism level, and same premium natural photographic style. Do not turn this into a different concept or different location family unless explicitly implied by the same scene family. Variation instruction: Keep the same person, same scene and same framing, but generate a different wardrobe variation that fits the same shoot concept. Original approved prompt context: Keep the person face, identity, facial structure, age, skin tone, and overall likeness exactly the same as in the reference photos. Generate a highly photorealistic portrait of the same person from the reference photos. Do not change identity, do not beautify into a different person, and do not introduce artificial facial features. The result must feel naturally photographed, premium, believable, and human. Use case: Аватарка. Desired impression: Уверенно. Look self-assured, focused and strong. Scene direction: Use a dark premium studio with controlled contrast, sculpted cinematic light, subtle luxury mood, and elegant background falloff. Portrait direction: Keep identity perfectly consistent. Create a luxury portrait with confident expression, realistic detail, strong but natural retouching restraint, and premium magazine-level presence. Location family: studio. Lighting family: cinematic_contrast. Wardrobe direction: premium_dark. Composition: tight portrait framing with sculpted light and premium mood. Maximum identity preservation. Keep the same face, bone structure, eyes, nose, lips, skin tone, and overall likeness exactly consistent with the reference photos. Make the image look naturally photographed and highly professional, with realistic skin texture, subtle pores, natural hair, believable eyes, and true-to-life proportions. Avoid plastic skin, beauty filter look, CGI feel, over-smoothing, fake luxury aesthetics, or overprocessed retouching. Use natural-looking professional color grading, soft contrast, clean tones, subtle premium polish, and an authentic candid photography feel. Preserve realistic skin texture, natural pores, natural eyes, realistic teeth, realistic hairline, and true-to-life proportions. Avoid plastic skin, waxy retouching, over-smoothing, uncanny facial symmetry, over-stylization, CGI look, and fake luxury aesthetics. The image should feel like a premium candid photo made by a great photographer, not an overprocessed AI portrait. Subtle influencer-style finishing is allowed: clean color, soft contrast, light retouch, polished but still natural and professional. Format target: 16:9, png. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography. Change only the requested visual dimension while preserving identity, overall art direction, and believable photography.	\N	2026-03-16 12:56:01.643
\.


--
-- Data for Name: photoshoots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.photoshoots (id, user_id, title, status, quiz_answers, created_at, updated_at) FROM stdin;
20	3	Фотосессия 16.03.2026	completed	{"sceneId": "urban-evening-editorial", "useCaseKey": "instagram", "impressionKey": "stylish"}	2026-03-15 23:20:48.063	2026-03-15 23:29:47.138
22	3	Фотосессия 16.03.2026	completed	{"sceneId": "dark-premium-studio", "useCaseKey": "avatarka", "impressionKey": "confident", "formatPresetKey": "landscape_16x9"}	2026-03-15 23:37:14.602	2026-03-15 23:40:21.386
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, session_token, user_id, expires) FROM stdin;
\.


--
-- Data for Name: source_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.source_images (id, photoshoot_id, url, cloud_storage_path, is_public, file_order, created_at) FROM stdin;
18	20	/api/storage?path=public%2Fuploads%2F1773616848463-IMAGE_2026-03-16_00_20_43.jpg&public=1	public/uploads/1773616848463-IMAGE_2026-03-16_00_20_43.jpg	t	0	2026-03-15 23:20:48.791
20	22	/api/storage?path=public%2Fuploads%2F1773617835104-IMAGE_2026-03-16_00_37_10.jpg&public=1	public/uploads/1773617835104-IMAGE_2026-03-16_00_37_10.jpg	t	0	2026-03-15 23:37:15.443
\.


--
-- Data for Name: token_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.token_transactions (id, user_id, delta, reason, meta, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, password, created_at, token_balance) FROM stdin;
1	localdb@example.com	Local DB	$2a$12$UkHmyO1H.UNPecOzDnnUbO5nm1mnpZNvGAturz8sm.vB500zL3mOi	2026-03-14 15:40:38.831	10
2	localdb2@example.com	Local 2	$2a$12$EV0QU47pCPdDF4uVXDkepeZIF8iCoYIKol3QXVl8tEzWlEzzqMy0.	2026-03-14 15:43:16.301	10
3	a.bbnv@yandex.ru	Алексндр	$2a$12$ZO2EkFQGFApKyKuqjIXE1.QLlixzxdA2I5ILdUqq0ScwgLBq0YQke	2026-03-14 15:43:48.428	10
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accounts_id_seq', 1, false);


--
-- Name: admin_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_configs_id_seq', 377, true);


--
-- Name: billing_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.billing_payments_id_seq', 1, false);


--
-- Name: generated_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.generated_images_id_seq', 51, true);


--
-- Name: photoshoots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.photoshoots_id_seq', 22, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);


--
-- Name: source_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.source_images_id_seq', 20, true);


--
-- Name: token_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.token_transactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: admin_configs admin_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_configs
    ADD CONSTRAINT admin_configs_pkey PRIMARY KEY (id);


--
-- Name: billing_payments billing_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_payments
    ADD CONSTRAINT billing_payments_pkey PRIMARY KEY (id);


--
-- Name: generated_images generated_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_images
    ADD CONSTRAINT generated_images_pkey PRIMARY KEY (id);


--
-- Name: photoshoots photoshoots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photoshoots
    ADD CONSTRAINT photoshoots_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: source_images source_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_images
    ADD CONSTRAINT source_images_pkey PRIMARY KEY (id);


--
-- Name: token_transactions token_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transactions
    ADD CONSTRAINT token_transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);


--
-- Name: admin_configs_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_configs_key_key ON public.admin_configs USING btree (key);


--
-- Name: billing_payments_lava_contract_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX billing_payments_lava_contract_id_key ON public.billing_payments USING btree (lava_contract_id);


--
-- Name: billing_payments_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX billing_payments_user_id_created_at_idx ON public.billing_payments USING btree (user_id, created_at);


--
-- Name: generated_images_photoshoot_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generated_images_photoshoot_id_idx ON public.generated_images USING btree (photoshoot_id);


--
-- Name: photoshoots_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX photoshoots_status_idx ON public.photoshoots USING btree (status);


--
-- Name: photoshoots_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX photoshoots_user_id_idx ON public.photoshoots USING btree (user_id);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: source_images_photoshoot_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_images_photoshoot_id_idx ON public.source_images USING btree (photoshoot_id);


--
-- Name: token_transactions_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX token_transactions_user_id_created_at_idx ON public.token_transactions USING btree (user_id, created_at);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: billing_payments billing_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_payments
    ADD CONSTRAINT billing_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: generated_images generated_images_photoshoot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_images
    ADD CONSTRAINT generated_images_photoshoot_id_fkey FOREIGN KEY (photoshoot_id) REFERENCES public.photoshoots(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: photoshoots photoshoots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photoshoots
    ADD CONSTRAINT photoshoots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: source_images source_images_photoshoot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_images
    ADD CONSTRAINT source_images_photoshoot_id_fkey FOREIGN KEY (photoshoot_id) REFERENCES public.photoshoots(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: token_transactions token_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transactions
    ADD CONSTRAINT token_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TKfEYn6p5osAfpsvIbAdiTF15BOG25i8PzosZS1EdbaoO6aHbHW5OTnJhqrhUgr

