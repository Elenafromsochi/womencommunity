import type { UserProfile, Mentor, Event, Group, ContentItem, Topic, Notification, ChatMessage, CommunityPost } from "./types";
import mentor1Img from "../assets/mentor-1.jpg";
import mentor2Img from "../assets/mentor-2.jpg";
import mentor3Img from "../assets/mentor-3.jpg";
import mentor4Img from "../assets/mentor-4.jpg";
import coverWellness from "../assets/cover-wellness.jpg";

export const mockUser: UserProfile = {
  id: "u1",
  name: "Елена",
  city: "Москва",
  age: 32,
  maritalStatus: "В браке",
  occupation: "Маркетолог",
  interests: ["отношения", "здоровье", "самореализация"],
  priorities: ["отношения", "здоровье", "самореализация"],
  avatar: mentor1Img,
  role: "member",
};

export const topics: Topic[] = [
  { id: "t1", name: "Отношения", emoji: "❤️", description: "Построение гармоничных отношений с партнёром, семьёй, собой", contentCount: 48 },
  { id: "t2", name: "Здоровье", emoji: "🌿", description: "Физическое и психическое здоровье, питание, движение", contentCount: 36 },
  { id: "t3", name: "Самореализация", emoji: "✨", description: "Карьера, бизнес, поиск призвания, достижение целей", contentCount: 52 },
  { id: "t4", name: "Финансы", emoji: "💰", description: "Управление деньгами, инвестиции, финансовая независимость", contentCount: 28 },
  { id: "t5", name: "Личностный рост", emoji: "🌸", description: "Самопознание, развитие осознанности, работа с убеждениями", contentCount: 64 },
  { id: "t6", name: "Материнство", emoji: "👩", description: "Воспитание, баланс семьи и работы, материнская поддержка", contentCount: 31 },
  { id: "t7", name: "Хобби", emoji: "🎨", description: "Творчество, ремёсла, искусство, кулинария, путешествия", contentCount: 42 },
  { id: "t8", name: "Развлечения", emoji: "🎉", description: "Отдых, праздники, мероприятия, культура и досуг", contentCount: 19 },
];

export const mentors: Mentor[] = [
  {
    id: "m1",
    name: "Мария Вебер",
    specialization: "Психология отношений",
    description: "15 лет практики в семейной терапии. Помогает женщинам строить глубокие и честные отношения.",
    topics: ["Отношения", "Личностный рост", "Материнство"],
    rating: 4.9,
    reviews: 127,
    materialsCount: 34,
    events: [
      { id: "e1", title: "Вечер открытых сердец", mentor: "Мария Вебер", date: "14 июня", time: "19:00", type: "offline", price: 0, cover: coverWellness },
      { id: "e2", title: "Практика внутренней опоры", mentor: "Мария Вебер", date: "21 июня", time: "18:00", type: "online", price: 1500, cover: undefined },
    ],
    groups: [
      { id: "g1", title: "Путь к себе", startDate: "1 июля" },
    ],
    experience: "15 лет практики в гештальт-терапии и семейной системной терапии. Автор курса «Отношения с собой».",
    avatar: mentor1Img,
  },
  {
    id: "m2",
    name: "Алена Смирнова",
    specialization: "Здоровье и тело",
    description: "Интегративный подход к женскому здоровью. Совмещает медицину, йогу и осознанность.",
    topics: ["Здоровье", "Личностный рост", "Хобби"],
    rating: 4.8,
    reviews: 94,
    materialsCount: 28,
    events: [
      { id: "e3", title: "Йога-ретрит в черте города", mentor: "Алена Смирнова", date: "16 июня", time: "09:30", type: "offline", price: 2500, cover: coverWellness },
    ],
    groups: [
      { id: "g2", title: "Баланс карьеры и жизни", startDate: "5 июля" },
    ],
    experience: "Врач-эндокринолог, сертифицированный йога-терапевт. 10 лет работы в женском здоровье.",
    avatar: mentor2Img,
  },
  {
    id: "m3",
    name: "София Белая",
    specialization: "Финансовая грамотность",
    description: "Помогает женщинам обрести финансовую уверенность и независимость через осознанное отношение к деньгам.",
    topics: ["Финансы", "Самореализация", "Личностный рост"],
    rating: 4.7,
    reviews: 83,
    materialsCount: 21,
    events: [
      { id: "e4", title: "Финансовое мышление: старт", mentor: "София Белая", date: "20 июня", time: "19:00", type: "online", price: 0, cover: undefined },
    ],
    groups: [
      { id: "g3", title: "Финансовое мышление", startDate: "15 июля" },
    ],
    experience: "Финансовый аналитик, коуч по деньгам. Автор методики «Деньги как отражение внутреннего мира».",
    avatar: mentor3Img,
  },
  {
    id: "m4",
    name: "Дарья Ланская",
    specialization: "Творческое развитие",
    description: "Художник, арт-терапевт. Помогает раскрыть творческий потенциал через практики рисования и керамики.",
    topics: ["Хобби", "Личностный рост", "Развлечения"],
    rating: 4.9,
    reviews: 56,
    materialsCount: 19,
    events: [
      { id: "e5", title: "Керамика и смыслы", mentor: "Дарья Ланская", date: "17 июня", time: "14:00", type: "offline", price: 3000, cover: coverWellness },
    ],
    groups: [],
    experience: "Образование в Берлинской академии искусств. 8 лет практики арт-терапии для женщин.",
    avatar: mentor4Img,
  },
];

export const events: Event[] = [
  {
    id: "e1",
    title: "Вечер открытых сердец",
    mentor: "Мария Вебер",
    date: "14 июня 2026",
    time: "19:00",
    description: "Открытая встреча для новых участниц. Знакомство с методами гештальт-терапии, практики в парах, чай и тёплые разговоры.",
    spots: 8,
    spotsTotal: 20,
    type: "offline",
    price: 0,
    cover: coverWellness,
    location: "Москва, ул. Петровка, 15",
  },
  {
    id: "e2",
    title: "Практика внутренней опоры",
    mentor: "Мария Вебер",
    date: "21 июня 2026",
    time: "18:00",
    description: "Онлайн-медитация на тему «Опора в себе». Подходит для начинающих. Продолжительность 60 минут.",
    spots: 45,
    spotsTotal: 100,
    type: "online",
    price: 1500,
    cover: undefined,
    location: "Zoom",
  },
  {
    id: "e3",
    title: "Йога-ретрит в черте города",
    mentor: "Алена Смирнова",
    date: "16 июня 2026",
    time: "09:30",
    description: "Полдня в студии у озера. Йога, пранаяма, обед из локальных продуктов, свободное время для себя.",
    spots: 4,
    spotsTotal: 12,
    type: "offline",
    price: 2500,
    cover: coverWellness,
    location: "Парк-отель «Озерный», 25 км от МКАД",
  },
  {
    id: "e4",
    title: "Финансовое мышление: старт",
    mentor: "София Белая",
    date: "20 июня 2026",
    time: "19:00",
    description: "Бесплатный вебинар о том, как начать управлять деньгами осознанно. Разбор кейсов участниц.",
    spots: 80,
    spotsTotal: 200,
    type: "online",
    price: 0,
    cover: undefined,
    location: "YouTube Live",
  },
  {
    id: "e5",
    title: "Керамика и смыслы",
    mentor: "Дарья Ланская",
    date: "17 июня 2026",
    time: "14:00",
    description: "Мастер-класс по керамике. Создадим свою чашку, обсудим тему «форма следует за функцией души».",
    spots: 2,
    spotsTotal: 10,
    type: "offline",
    price: 3000,
    cover: coverWellness,
    location: "Мастерская «Глина», м. Третьяковская",
  },
  {
    id: "e6",
    title: "Завтрак сообщества в саду",
    mentor: "Команда Женского общества",
    date: "18 июня 2026",
    time: "10:00",
    description: "Неформальная встреча участниц. Обмен опытом, новые знакомства, домашний пирог.",
    spots: 5,
    spotsTotal: 15,
    type: "offline",
    price: 0,
    cover: coverWellness,
    location: "Сад «Цветник», м. Фрунзенская",
  },
];

export const groups: Group[] = [
  {
    id: "g1",
    title: "Путь к себе",
    description: "Камерная группа до 6 человек. 3 месяца глубокой работы над внутренними опорами, самоценностью и принятием.",
    curator: "Мария Вебер",
    spots: 2,
    spotsTotal: 6,
    startDate: "1 июля 2026",
    duration: "3 месяца",
    cover: coverWellness,
    avatar: mentor1Img,
  },
  {
    id: "g2",
    title: "Баланс карьеры и жизни",
    description: "Для женщин, которые хотят достичь гармонии между работой и личной жизнью. 8 недель практических заданий.",
    curator: "Алена Смирнова",
    spots: 3,
    spotsTotal: 6,
    startDate: "5 июля 2026",
    duration: "2 месяца",
    cover: coverWellness,
    avatar: mentor2Img,
  },
  {
    id: "g3",
    title: "Финансовое мышление",
    description: "Изучаем личные финансы через призму психологии. Бюджеты, сбережения, инвестиции — просто и по-женски.",
    curator: "София Белая",
    spots: 1,
    spotsTotal: 6,
    startDate: "15 июля 2026",
    duration: "2 месяца",
    cover: coverWellness,
    avatar: mentor3Img,
  },
];

export const contentItems: ContentItem[] = [
  { id: "c1", title: "Искусство малых ритуалов", type: "article", topic: "Личностный рост", description: "Как ежедневные маленькие практики меняют качество жизни", author: "Мария Вебер", duration: "8 мин", cover: coverWellness, date: "5 июня" },
  { id: "c2", title: "Медитация утренней опоры", type: "audio", topic: "Здоровье", description: "15-минутная практика для начала дня с ресурса", author: "Алена Смирнова", duration: "15 мин", cover: undefined, date: "3 июня" },
  { id: "c3", title: "Деньги и чувства: вебинар", type: "video", topic: "Финансы", description: "Запись вебинара о психологии денежных отношений", author: "София Белая", duration: "45 мин", cover: undefined, date: "1 июня" },
  { id: "c4", title: "Практика принятия тела", type: "practice", topic: "Здоровье", description: "Пошаговое руководство по телесной терапии", author: "Алена Смирнова", duration: "20 мин", cover: undefined, date: "28 мая" },
  { id: "c5", title: "Подборка: отношения с собой", type: "collection", topic: "Отношения", description: "5 лучших материалов по теме самопринятия", author: "Команда ЖО", duration: undefined, cover: coverWellness, date: "25 мая" },
  { id: "c6", title: "Творческий блок: что делать?", type: "article", topic: "Самореализация", description: "Понимание причин творческого кризиса и способы выхода", author: "Дарья Ланская", duration: "12 мин", cover: undefined, date: "20 мая" },
  { id: "c7", title: "Вечерняя практика тишины", type: "audio", topic: "Личностный рост", description: "Звуковая медитация для сна и восстановления", author: "Мария Вебер", duration: "25 мин", cover: undefined, date: "18 мая" },
  { id: "c8", title: "Материнство и карьера", type: "video", topic: "Материнство", description: "Интервью с тремя женщинами, нашедшими баланс", author: "Команда ЖО", duration: "30 мин", cover: undefined, date: "15 мая" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "material", title: "Новый материал", body: "Мария Вебер опубликовала «Искусство малых ритуалов»", date: "Сегодня, 10:30", read: false },
  { id: "n2", type: "event", title: "Напоминание", body: "Вечер открытых сердец завтра в 19:00", date: "Сегодня, 09:00", read: false },
  { id: "n3", type: "group", title: "Набор в группу", body: "Открыт набор в «Путь к себе» — 2 места осталось", date: "Вчера", read: true },
  { id: "n4", type: "message", title: "Новое сообщение", body: "Алена Смирнова ответила на ваш вопрос", date: "Вчера", read: true },
  { id: "n5", type: "reply", title: "Ответ наставника", body: "Мария Вебер прокомментировала вашу запись", date: "2 дня назад", read: true },
];

export const chatMessages: ChatMessage[] = [
  { id: "ch1", author: "Ольга", text: "Привет всем! Недавно присоединилась к сообществу, рада знакомству 💫", timestamp: "10:15", isMe: false, avatar: mentor3Img },
  { id: "ch2", author: "Виктория", text: "Добро пожаловать, Ольга! Какие темы тебе ближе всего?", timestamp: "10:18", isMe: false, avatar: mentor2Img },
  { id: "ch3", author: "Вы", text: "Привет! Мне интересны отношения и самореализация. Ищу наставника ☺️", timestamp: "10:22", isMe: true, avatar: undefined },
  { id: "ch4", author: "Анна", text: "О, я хожу к Марии Вебер — очень рекомендую, если про отношения", timestamp: "10:25", isMe: false, avatar: mentor1Img },
  { id: "ch5", author: "Ольга", text: "Спасибо за рекомендации! Пойду смотреть её материалы", timestamp: "10:30", isMe: false, avatar: mentor3Img },
];

export const communityPosts: CommunityPost[] = [
  { id: "p1", author: "Команда ЖО", title: "Добро пожаловать в сообщество!", content: "Мы рады, что вы здесь. Начните с заполнения анкеты и знакомства с наставниками.", type: "news", date: "5 июня", likes: 124, comments: 8, avatar: undefined },
  { id: "p2", author: "Екатерина М.", title: "Привет от новой участницы", content: "Живу в Петербурге, работаю дизайнером. Интересуюсь личностным ростом и творчеством. Буду рада знакомству!", type: "introduction", date: "4 июня", likes: 45, comments: 12, avatar: mentor4Img },
  { id: "p3", author: "Мария Вебер", title: "Новая статья: «Искусство малых ритуалов»", content: "Поделилась своими мыслями о том, как маленькие ежедневные практики меняют качество жизни. Читайте в разделе Темы → Личностный рост.", type: "news", date: "3 июня", likes: 89, comments: 15, avatar: mentor1Img },
  { id: "p4", author: "Наталья С.", title: "Кто пойдёт на керамику в субботу?", content: "Ещё 2 места свободно! Будет очень уютно, обещаю 🍵", type: "discussion", date: "2 июня", likes: 32, comments: 6, avatar: mentor2Img },
];

export const interestOptions = [
  "отношения",
  "здоровье",
  "самореализация",
  "финансы",
  "эмоциональное состояние",
  "материнство",
  "личностный рост",
  "хобби",
  "окружение",
];
