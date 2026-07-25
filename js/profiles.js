window.FLH_PROFILES = {
  saeed: {
    id:"saeed", name:"سعید", role:"پژوهشگر و متخصص HSE", ageBand:"adult", avatar:window.FLH_PROFILE_IMAGES?.saeed||"assets/profiles/saeed.webp", icon:"🧠",
    image:null,
    defaultLanguage:"en", levels:{en:"B1",de:"A0"}, dailyMinutes:45,
    goals:{
      en:["IELTS و اپلای دکتری","مکالمه حرفه‌ای","مقاله و ارائه پژوهش","HSE و معدن","زندگی و مهاجرت"],
      de:["شروع آلمانی عمومی","مهاجرت و زندگی روزمره","کار و HSE","معرفی پژوهش"]
    },
    tracks:["general","academic","ielts","research","hse","migration"],
    description:"مسیر بزرگسال پژوهش‌محور با تأکید بر چهار مهارت، IELTS، مقاله، مصاحبه دکتری و زبان تخصصی ایمنی."
  },
  arezoo: {
    id:"arezoo", name:"آرزو", role:"کارشناس کامپیوتر", ageBand:"adult", avatar:window.FLH_PROFILE_IMAGES?.arezoo||"assets/profiles/arezoo.webp", icon:"💻",
    defaultLanguage:"de", levels:{en:"A1",de:"A1"}, dailyMinutes:30,
    goals:{
      en:["زندگی روزمره","خرید و آشپزخانه","مدرسه و خانواده","کامپیوتر و محیط کار","مکالمه عمومی"],
      de:["زندگی در آلمان","خرید و آشپزخانه","مدرسه کودکان","کامپیوتر و اشتغال","آزمون A1 تا B2"]
    },
    tracks:["general","daily-life","shopping","kitchen","school-family","it-career","migration"],
    description:"مسیر کاملاً عملی برای زندگی، خرید، خانه، مدرسه، ارتباطات اداری و ورود تدریجی به بازار کار فناوری."
  },
  elena: {
    id:"elena", name:"النا", role:"دانش‌آموز ۱۱ ساله", ageBand:"school", age:11, avatar:window.FLH_PROFILE_IMAGES?.elena||"assets/profiles/elena.webp", icon:"📘",
    defaultLanguage:"en", levels:{en:"A0",de:"A0"}, dailyMinutes:22,
    goals:{
      en:["الفبا و فونیک","مدرسه و تکالیف","داستان و خواندن","علوم و ارائه","مکالمه با همسالان"],
      de:["الفبا و صداها","مدرسه در آلمان","داستان کودک و نوجوان","علوم ساده","مکالمه روزمره"]
    },
    tracks:["alphabet","phonics","school","stories","science","digital-safety","projects"],
    description:"مسیر سن‌محور با الفبا، فونیک، خواندن هدایت‌شده، بازی، پروژه کوتاه و ارزیابی بدون فشار."
  },
  aria: {
    id:"aria", name:"آریا", role:"کودک ۳ ساله", ageBand:"preschool", age:3, avatar:window.FLH_PROFILE_IMAGES?.aria||"assets/profiles/aria.webp", icon:"🧸",
    defaultLanguage:"en", levels:{en:"PRE",de:"PRE"}, dailyMinutes:7,
    goals:{
      en:["شنیدن و تقلید","رنگ و حیوان","خانواده و بدن","حرکت و بازی","آهنگ و داستان کوتاه"],
      de:["شنیدن و تقلید","رنگ و حیوان","خانواده و بدن","حرکت و بازی","آهنگ و داستان کوتاه"]
    },
    tracks:["parent-guided","sound-play","movement","picture-talk","songs","routines"],
    description:"نشست‌های ۵ تا ۸ دقیقه‌ای والد‌همراه؛ بدون آزمون رسمی و بدون اجبار به خواندن و نوشتن."
  }
};
window.FLH_LEVELS = {
  PRE:{id:"PRE",emoji:"🧸",label:"پیش‌زبانی",short:"بازی و شنیدن",order:-1},
  A0:{id:"A0",emoji:"🌱",label:"شروع از صفر",short:"الفبا و پایه",order:0},
  A1:{id:"A1",emoji:"🐣",label:"پایه",short:"عبارت‌های ساده",order:1},
  A2:{id:"A2",emoji:"🚲",label:"روزمره",short:"کارهای معمول",order:2},
  B1:{id:"B1",emoji:"🗣️",label:"مستقل",short:"گفت‌وگوی پیوسته",order:3},
  B2:{id:"B2",emoji:"🚀",label:"پیشرفته",short:"کار و تحصیل",order:4},
  C1:{id:"C1",emoji:"🎓",label:"دانشگاهی",short:"استدلال پیشرفته",order:5},
  C2:{id:"C2",emoji:"🏆",label:"تسلط",short:"دقت و ظرافت",order:6}
};
window.FLH_LANGUAGE_META = {
  en:{id:"en",name:"English",fa:"انگلیسی",flag:"🇬🇧",voice:"en-US"},
  de:{id:"de",name:"Deutsch",fa:"آلمانی",flag:"🇩🇪",voice:"de-DE"}
};
