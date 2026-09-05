--
-- PostgreSQL database dump
--

\restrict mKe7sovyGYH8hZJZvh4d4IfT6GRTCQv6PhMklJbLqbgjdzVPeLuJnhmn7JS3YsN

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.readings DROP CONSTRAINT IF EXISTS readings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.positions DROP CONSTRAINT IF EXISTS positions_user_id_fkey;
DROP INDEX IF EXISTS public.readings_user_station_ts_idx;
DROP INDEX IF EXISTS public.positions_user_device_ts;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_ingest_key_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.readings DROP CONSTRAINT IF EXISTS readings_pkey;
ALTER TABLE IF EXISTS ONLY public.positions DROP CONSTRAINT IF EXISTS positions_pkey;
ALTER TABLE IF EXISTS ONLY public.login_throttle DROP CONSTRAINT IF EXISTS login_throttle_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.readings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.positions ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.readings_id_seq;
DROP TABLE IF EXISTS public.readings;
DROP SEQUENCE IF EXISTS public.positions_id_seq;
DROP TABLE IF EXISTS public.positions;
DROP TABLE IF EXISTS public.login_throttle;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: login_throttle; Type: TABLE; Schema: public; Owner: wb
--

CREATE TABLE public.login_throttle (
    identifier text NOT NULL,
    fail_count integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone
);


ALTER TABLE public.login_throttle OWNER TO wb;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: wb
--

CREATE TABLE public.positions (
    id bigint NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL,
    device text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    speed_kmh double precision,
    accuracy_m double precision
);


ALTER TABLE public.positions OWNER TO wb;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: wb
--

CREATE SEQUENCE public.positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO wb;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wb
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: readings; Type: TABLE; Schema: public; Owner: wb
--

CREATE TABLE public.readings (
    id bigint NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL,
    station text NOT NULL,
    temp_c real NOT NULL,
    humidity real NOT NULL
);


ALTER TABLE public.readings OWNER TO wb;

--
-- Name: readings_id_seq; Type: SEQUENCE; Schema: public; Owner: wb
--

CREATE SEQUENCE public.readings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.readings_id_seq OWNER TO wb;

--
-- Name: readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wb
--

ALTER SEQUENCE public.readings_id_seq OWNED BY public.readings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: wb
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    ingest_key text,
    verify_code_hash text,
    verify_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO wb;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: wb
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO wb;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wb
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: readings id; Type: DEFAULT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.readings ALTER COLUMN id SET DEFAULT nextval('public.readings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: login_throttle; Type: TABLE DATA; Schema: public; Owner: wb
--

COPY public.login_throttle (identifier, fail_count, locked_until) FROM stdin;
signup:80.219.25.54	1	\N
signup:212.243.62.240	1	\N
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: wb
--

COPY public.positions (id, ts, user_id, device, lat, lng, speed_kmh, accuracy_m) FROM stdin;
1	2026-08-25 20:35:43.34706+00	1	bike-1	47.3769	8.5417	0	\N
2	2026-08-25 20:35:43.788805+00	1	bike-1	47.3781	8.5398	14	\N
3	2026-08-25 20:35:44.285184+00	1	bike-1	47.3795	8.5372	21	\N
4	2026-08-25 20:35:44.689908+00	1	bike-1	47.3812	8.534	19	\N
5	2026-08-25 20:35:45.193233+00	1	bike-1	47.3828	8.5305	23	\N
6	2026-08-25 20:35:45.625929+00	1	bike-1	47.3839	8.5271	8	\N
\.


--
-- Data for Name: readings; Type: TABLE DATA; Schema: public; Owner: wb
--

COPY public.readings (id, ts, user_id, station, temp_c, humidity) FROM stdin;
1	2026-08-24 23:50:09.784679+00	1	rooftop-1	21.4	58
2	2026-08-24 23:50:38.457214+00	1	rooftop-2	21.4	60
3	2026-08-24 23:51:08.729412+00	1	rooftop-2	21.4	60
4	2026-08-24 23:51:13.198313+00	1	rooftop-2	21.4	45
5	2026-08-24 23:51:17.980008+00	1	rooftop-2	21.4	70
6	2026-08-29 18:11:32.837561+00	1	rooftop-1	26.84	51.45
7	2026-08-29 18:12:32.839818+00	1	rooftop-1	26.7	51.56
8	2026-08-29 18:13:32.985663+00	1	rooftop-1	26.64	51.77
9	2026-08-29 18:14:32.822199+00	1	rooftop-1	26.55	51.91
10	2026-08-29 18:15:32.805612+00	1	rooftop-1	26.48	51.91
11	2026-08-29 18:16:32.787936+00	1	rooftop-1	26.45	51.93
12	2026-08-29 18:17:32.935669+00	1	rooftop-1	26.44	52
13	2026-08-29 18:18:32.785699+00	1	rooftop-1	26.44	51.88
14	2026-08-29 18:19:32.800549+00	1	rooftop-1	26.39	51.97
15	2026-08-29 18:20:32.843417+00	1	rooftop-1	26.39	52.05
16	2026-08-29 18:21:32.819828+00	1	rooftop-1	26.37	51.83
17	2026-08-29 18:22:32.895319+00	1	rooftop-1	26.4	51.81
18	2026-08-29 18:23:32.792305+00	1	rooftop-1	26.4	51.89
19	2026-08-29 18:24:32.865229+00	1	rooftop-1	26.41	51.78
20	2026-08-29 18:25:32.800242+00	1	rooftop-1	26.4	51.54
21	2026-08-29 18:26:32.858219+00	1	rooftop-1	26.43	51.87
22	2026-08-29 18:27:32.80748+00	1	rooftop-1	26.45	51.64
23	2026-08-29 18:28:32.904036+00	1	rooftop-1	26.43	52.01
24	2026-08-29 18:29:32.868677+00	1	rooftop-1	26.45	52.02
25	2026-08-29 18:30:32.797859+00	1	rooftop-1	26.46	51.76
26	2026-08-29 18:31:32.932288+00	1	rooftop-1	26.46	51.68
27	2026-08-29 18:32:32.839985+00	1	rooftop-1	26.46	51.82
28	2026-08-29 18:33:33.04953+00	1	rooftop-1	26.48	51.92
29	2026-08-29 18:34:32.819803+00	1	rooftop-1	26.47	51.68
30	2026-08-29 18:35:32.832855+00	1	rooftop-1	26.5	51.82
31	2026-08-29 18:36:32.85294+00	1	rooftop-1	26.48	51.8
32	2026-08-29 18:37:32.851745+00	1	rooftop-1	26.51	51.64
33	2026-08-29 18:38:32.832402+00	1	rooftop-1	26.5	51.86
34	2026-08-29 18:39:32.867313+00	1	rooftop-1	29.96	66.94
35	2026-08-29 18:40:32.872803+00	1	rooftop-1	28.8	51.62
36	2026-08-29 18:41:32.879744+00	1	rooftop-1	28.34	49.98
37	2026-08-29 18:42:32.874081+00	1	rooftop-1	28.25	49.63
38	2026-08-29 18:43:32.797225+00	1	rooftop-1	28.1	48.4
39	2026-08-29 18:44:32.957442+00	1	rooftop-1	28.07	48.07
40	2026-08-29 18:45:32.933404+00	1	rooftop-1	28.13	48.92
41	2026-08-29 18:46:32.844956+00	1	rooftop-1	28.13	48.75
42	2026-08-29 18:47:32.854287+00	1	rooftop-1	28.19	48.09
43	2026-08-29 18:48:32.861397+00	1	rooftop-1	28.05	48.43
44	2026-08-29 18:49:32.859941+00	1	rooftop-1	28.16	48.14
45	2026-08-29 18:50:32.841146+00	1	rooftop-1	28.12	48.23
46	2026-08-29 18:51:32.920091+00	1	rooftop-1	28.13	48.22
47	2026-08-29 18:52:32.825389+00	1	rooftop-1	28.21	48.47
48	2026-08-29 18:53:32.896148+00	1	rooftop-1	28.16	48
49	2026-08-29 18:54:32.857377+00	1	rooftop-1	28.24	48.17
50	2026-08-29 18:55:32.835117+00	1	rooftop-1	28.32	48.74
51	2026-08-29 18:56:32.816132+00	1	rooftop-1	28.31	47.93
52	2026-08-29 18:57:32.833467+00	1	rooftop-1	28.24	48.56
53	2026-08-29 18:58:32.870346+00	1	rooftop-1	28.12	47.74
54	2026-08-29 18:59:32.823492+00	1	rooftop-1	28.07	47.99
55	2026-08-29 19:00:32.937509+00	1	rooftop-1	28.07	47.87
56	2026-08-29 19:01:32.832769+00	1	rooftop-1	28.03	48.07
57	2026-08-29 19:02:32.845097+00	1	rooftop-1	28.17	48
58	2026-08-29 19:03:32.837054+00	1	rooftop-1	28.15	47.85
59	2026-08-29 19:04:32.872183+00	1	rooftop-1	28.2	48.01
60	2026-08-29 19:05:32.881556+00	1	rooftop-1	28.28	48.63
61	2026-08-29 19:06:32.832748+00	1	rooftop-1	28.26	48
62	2026-08-29 19:07:32.883767+00	1	rooftop-1	28.31	48.83
63	2026-08-29 19:08:32.829055+00	1	rooftop-1	28.39	47.93
64	2026-08-29 19:09:32.83866+00	1	rooftop-1	28.39	47.96
65	2026-08-29 19:10:32.8267+00	1	rooftop-1	28.49	50.17
66	2026-08-29 19:11:32.865735+00	1	rooftop-1	28.43	47.91
67	2026-08-29 22:04:02.383242+00	1	rooftop-1	25.25	64.01
68	2026-08-29 22:05:02.355428+00	1	rooftop-1	25.29	56.62
69	2026-08-29 22:06:02.331449+00	1	rooftop-1	25.38	55.09
70	2026-08-29 22:07:02.334465+00	1	rooftop-1	25.57	54.88
71	2026-08-29 22:08:02.344946+00	1	rooftop-1	25.73	53.37
72	2026-08-29 22:09:02.337468+00	1	rooftop-1	25.87	53.16
73	2026-08-29 22:10:02.408102+00	1	rooftop-1	25.96	53.23
74	2026-08-29 22:11:02.338009+00	1	rooftop-1	26.11	52.65
75	2026-08-29 22:12:02.35744+00	1	rooftop-1	26.24	52.34
76	2026-08-29 22:13:02.333559+00	1	rooftop-1	26.25	52.17
77	2026-08-29 22:14:02.341398+00	1	rooftop-1	26.49	52.22
78	2026-08-29 22:15:02.3765+00	1	rooftop-1	26.57	52.66
79	2026-08-29 22:16:02.353451+00	1	rooftop-1	26.68	51.67
80	2026-08-29 22:17:02.361174+00	1	rooftop-1	26.77	51.42
81	2026-08-29 22:18:02.337143+00	1	rooftop-1	26.93	51.43
82	2026-08-29 22:19:02.423881+00	1	rooftop-1	27.05	51.19
83	2026-08-29 22:20:02.352927+00	1	rooftop-1	27.14	50.79
84	2026-08-29 22:21:02.374125+00	1	rooftop-1	27.21	50.98
85	2026-08-29 22:22:02.340448+00	1	rooftop-1	27.29	50.47
86	2026-08-29 22:23:02.394697+00	1	rooftop-1	27.22	50.42
87	2026-08-29 22:24:02.354077+00	1	rooftop-1	27.36	50.38
88	2026-08-29 22:25:02.385343+00	1	rooftop-1	27.4	50.1
89	2026-08-29 22:26:02.394797+00	1	rooftop-1	27.37	50.19
90	2026-08-29 22:27:02.375817+00	1	rooftop-1	27.35	50.07
91	2026-08-29 22:28:02.365314+00	1	rooftop-1	27.35	50.05
92	2026-08-29 22:29:02.354446+00	1	rooftop-1	27.37	50.11
93	2026-08-29 22:30:02.421199+00	1	rooftop-1	27.41	50.12
94	2026-08-29 22:31:02.360523+00	1	rooftop-1	27.43	50.01
95	2026-08-29 22:32:02.374963+00	1	rooftop-1	27.41	49.96
96	2026-08-29 22:33:02.377919+00	1	rooftop-1	27.46	49.93
97	2026-08-29 22:34:02.359824+00	1	rooftop-1	27.56	49.87
98	2026-08-29 22:35:02.416713+00	1	rooftop-1	27.56	49.9
99	2026-08-29 22:36:02.371367+00	1	rooftop-1	27.54	49.88
100	2026-08-29 22:37:02.354489+00	1	rooftop-1	27.56	49.83
101	2026-08-29 22:38:02.381966+00	1	rooftop-1	27.6	50.59
102	2026-08-29 22:39:02.364267+00	1	rooftop-1	27.62	49.94
103	2026-08-29 22:40:02.358875+00	1	rooftop-1	27.64	49.91
104	2026-08-29 22:41:02.381508+00	1	rooftop-1	27.66	49.84
105	2026-08-29 22:42:02.370793+00	1	rooftop-1	27.67	49.88
106	2026-08-29 22:43:02.386032+00	1	rooftop-1	27.74	49.71
107	2026-08-29 22:44:02.432819+00	1	rooftop-1	27.79	49.73
108	2026-08-29 22:45:02.363602+00	1	rooftop-1	27.83	49.64
109	2026-08-29 22:46:02.395122+00	1	rooftop-1	27.85	49.59
110	2026-08-29 22:47:02.365464+00	1	rooftop-1	27.83	49.65
111	2026-08-29 22:48:02.409141+00	1	rooftop-1	27.82	49.66
112	2026-08-29 22:49:02.364086+00	1	rooftop-1	27.89	49.96
113	2026-08-29 22:50:02.37021+00	1	rooftop-1	27.85	49.65
114	2026-08-29 22:51:02.390338+00	1	rooftop-1	27.88	49.31
115	2026-08-29 22:52:02.370543+00	1	rooftop-1	28.05	49.54
116	2026-08-29 22:53:02.453893+00	1	rooftop-1	28.07	49.37
117	2026-08-29 22:54:02.358182+00	1	rooftop-1	27.97	49.49
118	2026-08-29 22:55:02.406706+00	1	rooftop-1	27.96	49.71
119	2026-08-29 22:56:02.373059+00	1	rooftop-1	27.79	49.56
120	2026-08-29 22:57:02.359294+00	1	rooftop-1	27.73	49.61
121	2026-08-29 22:58:02.375179+00	1	rooftop-1	27.72	49.71
122	2026-08-29 22:59:02.356672+00	1	rooftop-1	27.6	49.77
123	2026-08-29 23:00:02.411527+00	1	rooftop-1	27.64	50.14
124	2026-08-29 23:01:02.390573+00	1	rooftop-1	27.86	49.88
125	2026-08-29 23:02:02.385118+00	1	rooftop-1	27.73	49.73
126	2026-08-29 23:03:02.391428+00	1	rooftop-1	27.74	49.84
127	2026-08-29 23:04:02.366394+00	1	rooftop-1	27.72	49.68
128	2026-08-29 23:05:02.368554+00	1	rooftop-1	27.68	49.76
129	2026-08-29 23:06:02.403402+00	1	rooftop-1	27.71	49.79
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: wb
--

COPY public.users (id, email, name, password_hash, verified, ingest_key, verify_code_hash, verify_expires_at, created_at) FROM stdin;
1	flavio.segundo@yahoo.es	Flavio Segundo	$2a$10$irXFIXHnEpt1PGT4PWjG5eixDq/oonjPBxk7Dkj4XjaTzb9ZHRIce	t	a197ad15b3cdeb0dd471db9211595014d6c509af3acdca8f41249d018b25e5e0	\N	\N	2026-08-24 23:24:53.138154+00
2	mo.schenker99@gmail.com	MightyMau	$2a$10$Uo4ir7cj7DLsTRPdSeL6zeIZuaERzjwL4xTtxNM9CUZIXGx2WnI/i	t	ed3c1954ae11c43605a7a478f105c04322d665e829536ef2a3015096b18fe379	\N	\N	2026-08-25 15:59:36.235723+00
\.


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wb
--

SELECT pg_catalog.setval('public.positions_id_seq', 6, true);


--
-- Name: readings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wb
--

SELECT pg_catalog.setval('public.readings_id_seq', 129, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wb
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: login_throttle login_throttle_pkey; Type: CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.login_throttle
    ADD CONSTRAINT login_throttle_pkey PRIMARY KEY (identifier);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: readings readings_pkey; Type: CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_ingest_key_key; Type: CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_ingest_key_key UNIQUE (ingest_key);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: positions_user_device_ts; Type: INDEX; Schema: public; Owner: wb
--

CREATE INDEX positions_user_device_ts ON public.positions USING btree (user_id, device, ts DESC);


--
-- Name: readings_user_station_ts_idx; Type: INDEX; Schema: public; Owner: wb
--

CREATE INDEX readings_user_station_ts_idx ON public.readings USING btree (user_id, station, ts DESC);


--
-- Name: positions positions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: readings readings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wb
--

ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict mKe7sovyGYH8hZJZvh4d4IfT6GRTCQv6PhMklJbLqbgjdzVPeLuJnhmn7JS3YsN

