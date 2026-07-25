(function(){
'use strict';
window.FLH_CONTENT_PACKS=window.FLH_CONTENT_PACKS||[];
const adult={passScore:75,criteria:[{id:'meaning',weight:35,fa:'انتقال درست معنا'},{id:'accuracy',weight:25,fa:'دقت واژگان و ساختار'},{id:'fluency',weight:20,fa:'پیوستگی و روانی'},{id:'independence',weight:20,fa:'انجام مستقل'}]};
const school={passScore:70,criteria:[{id:'understanding',weight:35,fa:'فهم پیام'},{id:'response',weight:30,fa:'پاسخ مناسب'},{id:'sound',weight:20,fa:'خواندن یا تلفظ'},{id:'effort',weight:15,fa:'تلاش و تکمیل'}]};
const pre={passScore:0,participationOnly:true,criteria:[{id:'attention',weight:40,fa:'توجه و نگاه'},{id:'response',weight:35,fa:'اشاره، حرکت یا تقلید داوطلبانه'},{id:'enjoyment',weight:25,fa:'تعامل مثبت'}]};
const V=(target,fa,pos='phrase',image)=>({target,fa,pos,...(image?{image}:{})});
const T=(id,type,skill,promptFa,more={})=>({id,type,skill,promptFa,...more});
const lessons=[
{
 id:'saeed-en-b1-research-identity',profile:'saeed',language:'en',level:'B1',minutes:28,
 titleFa:'معرفی حرفه‌ای و پژوهشی',titleTarget:'Professional and research identity',
 objectiveFa:'سعید بتواند در ۶۰ تا ۹۰ ثانیه سابقه HSE، معدن و زمینه پژوهشی خود را روشن معرفی کند.',
 canDo:'I can introduce my professional background, research focus and doctoral goal in a structured way.',
 vocabulary:[V('industrial safety engineering','مهندسی ایمنی صنعتی'),V('occupational health and safety','ایمنی و بهداشت شغلی'),V('open-pit mining','معدن روباز'),V('risk assessment','ارزیابی ریسک'),V('field experience','تجربه میدانی'),V('doctoral research','پژوهش دکتری')],
 phrases:['I hold an M.Sc. in Industrial Safety Engineering.','My professional background is in HSE and open-pit mining.','My research focuses on uncertainty-aware risk prioritisation.','I want to extend this work into a transferable doctoral framework.'],
 grammar:['present simple for professional facts','present perfect for accumulated experience'],pronunciation:['research /rɪˈsɜːtʃ/','occupational /ˌɒkjəˈpeɪʃənəl/'],
 tasks:[
  T('s1-listen','listen-mcq','listening','معرفی صوتی را گوش بده و حوزه اصلی پژوهش را انتخاب کن.',{script:'I work in industrial safety and open-pit mining. My research focuses on probabilistic risk prioritisation under uncertainty.',choices:['occupational psychology','probabilistic risk prioritisation','chemical synthesis'],answer:'probabilistic risk prioritisation'}),
  T('s1-order','story-sequence','reading','چهار بخش معرفی را به ترتیب منطقی بچین.',{items:['degree','field experience','research focus','doctoral goal'],answer:'degree,field experience,research focus,doctoral goal'}),
  T('s1-speak','record-speech','speaking','معرفی ۶۰ تا ۹۰ ثانیه‌ای خودت را ضبط کن.',{minSeconds:60,maxSeconds:90,scaffold:['degree','experience','research','goal']}),
  T('s1-write','guided-writing','writing','یک معرفی ۱۲۰ تا ۱۵۰ کلمه‌ای برای پروفایل اپلای بنویس.',{minWords:120,maxWords:150,checklist:['degree','experience','methods','doctoral direction']})
 ],
 mission:{type:'real-life',fa:'معرفی را برای فردی خارج از HSE اجرا کن و بررسی کن آیا موضوع را فهمیده است.',evidence:'reflection-note'},rubric:adult,tags:['research','phd','identity','hse'],safeguarding:{}
},
{
 id:'saeed-de-a0-vorstellung',profile:'saeed',language:'de',level:'A0',minutes:22,
 titleFa:'معرفی اولیه به آلمانی',titleTarget:'Sich vorstellen',
 objectiveFa:'نام، ملیت ایرانی، رشته و شغل خود را با جمله‌های کوتاه بگوید.',
 canDo:'Ich kann mich mit Namen, Herkunft, Beruf und Lernziel kurz vorstellen.',
 vocabulary:[V('Ich heiße ...','نام من ... است'),V('Ich komme aus dem Iran.','من از ایران می‌آیم.'),V('Ich bin Sicherheitsingenieur.','من مهندس ایمنی هستم.'),V('Ich arbeite im HSE-Bereich.','در حوزه HSE کار می‌کنم.'),V('Ich lerne Deutsch.','آلمانی یاد می‌گیرم.'),V('mein Ziel','هدف من')],
 phrases:['Guten Tag. Ich heiße Saeed.','Ich komme aus dem Iran.','Ich bin Sicherheitsingenieur und arbeite im Bergbau.','Mein Ziel ist Deutsch für Arbeit und Alltag.'],
 grammar:['Ich bin / Ich habe / Ich arbeite','word order in simple statements'],pronunciation:['ich /ɪç/','Deutsch /dɔʏtʃ/'],
 tasks:[
  T('sd1-listen','listen-mcq','listening','گوش بده و شغل را انتخاب کن.',{script:'Ich bin Sicherheitsingenieur und arbeite im Bergbau.',choices:['Arzt','Sicherheitsingenieur','Lehrer'],answer:'Sicherheitsingenieur'}),
  T('sd1-order','story-sequence','reading','معرفی را مرتب کن.',{items:['Name','Herkunft','Beruf','Ziel'],answer:'Name,Herkunft,Beruf,Ziel'}),
  T('sd1-speak','record-speech','speaking','معرفی ۳۰ تا ۴۵ ثانیه‌ای ضبط کن.',{minSeconds:30,maxSeconds:45}),
  T('sd1-write','guided-writing','writing','چهار جمله معرفی بنویس.',{minWords:20,maxWords:45,requiredTerms:['heiße','Iran','Sicherheitsingenieur','Deutsch']})
 ],
 mission:{type:'real-life',fa:'معرفی را بدون نگاه‌کردن به متن برای آرزو اجرا کن.',evidence:'partner-check'},rubric:adult,tags:['german','a0','identity','work'],safeguarding:{}
},
{
 id:'arezoo-en-a1-shopping-list',profile:'arezoo',language:'en',level:'A1',minutes:25,
 titleFa:'فهرست خرید کاربردی',titleTarget:'A practical shopping list',
 objectiveFa:'مواد ضروری خانه را دسته‌بندی و فهرست خرید کوتاه تهیه کند.',
 canDo:'I can name common groceries and make a simple shopping list.',
 vocabulary:[V('bread','نان','noun','bread'),V('milk','شیر','noun','milk'),V('rice','برنج','noun','rice'),V('eggs','تخم‌مرغ','noun','eggs'),V('vegetables','سبزیجات','noun','vegetables'),V('detergent','شوینده','noun','detergent'),V('toilet paper','دستمال توالت','noun','paper')],
 phrases:['We need a loaf of bread.','Please add milk and eggs to the list.','Do we have enough rice?','We also need detergent.'],
 grammar:['countable and uncountable nouns','some / a / an'],pronunciation:['vegetables /ˈvedʒtəblz/','detergent /dɪˈtɜːdʒənt/'],
 tasks:[
  T('aen2-picture','visual-choice','vocabulary','تصویر detergent را انتخاب کن.',{choices:[{id:'milk',image:'milk'},{id:'detergent',image:'detergent'},{id:'rice',image:'rice'}],answer:'detergent'}),
  T('aen2-sort','category-sort','reading','اقلام را در Food و Household مرتب کن.',{categories:{Food:['bread','milk','rice','eggs','vegetables'],Household:['detergent','toilet paper']}}),
  T('aen2-speak','record-speech','speaking','فهرست خرید امروز را با شش قلم بخوان.',{minSeconds:25,maxSeconds:50}),
  T('aen2-write','list-builder','writing','یک فهرست خرید با مقدار ساده بساز.',{minItems:6,fields:['item','quantity']})
 ],
 mission:{type:'shopping',fa:'پیش از خرید واقعی، شش قلم را در برنامه بنویس و هنگام خرید نام انگلیسی آن‌ها را مرور کن.',evidence:'checked-list'},rubric:adult,tags:['arezoo','shopping','groceries','home'],safeguarding:{}
},
{
 id:'arezoo-de-a1-einkaufsliste',profile:'arezoo',language:'de',level:'A1',minutes:26,
 titleFa:'فهرست خرید آلمانی',titleTarget:'Die Einkaufsliste',
 objectiveFa:'مواد غذایی و ضروریات خانه را به آلمانی نام ببرد و فهرست بنویسد.',
 canDo:'Ich kann Lebensmittel und Haushaltsartikel nennen und eine Einkaufsliste schreiben.',
 vocabulary:[V('das Brot','نان','noun','bread'),V('die Milch','شیر','noun','milk'),V('der Reis','برنج','noun','rice'),V('die Eier','تخم‌مرغ','noun','eggs'),V('das Gemüse','سبزیجات','noun','vegetables'),V('das Waschmittel','شوینده','noun','detergent'),V('das Toilettenpapier','دستمال توالت','noun','paper')],
 phrases:['Wir brauchen Brot und Milch.','Bitte schreib Eier auf die Liste.','Haben wir genug Reis?','Wir brauchen auch Waschmittel.'],
 grammar:['Wir brauchen...','plural nouns and articles'],pronunciation:['Milch /mɪlç/','Gemüse /ɡəˈmyːzə/'],
 tasks:[
  T('ade2-picture','visual-choice','vocabulary','تصویر Waschmittel را انتخاب کن.',{choices:[{id:'milk',image:'milk'},{id:'detergent',image:'detergent'},{id:'bread',image:'bread'}],answer:'detergent'}),
  T('ade2-sort','category-sort','reading','Lebensmittel و Haushalt را جدا کن.',{categories:{Lebensmittel:['Brot','Milch','Reis','Eier','Gemüse'],Haushalt:['Waschmittel','Toilettenpapier']}}),
  T('ade2-speak','record-speech','speaking','هفت قلم فهرست خرید را بخوان.',{minSeconds:25,maxSeconds:50}),
  T('ade2-write','list-builder','writing','یک Einkaufsliste با حداقل شش قلم بساز.',{minItems:6,fields:['Artikel','Menge']})
 ],
 mission:{type:'shopping',fa:'در خرید بعدی، نام آلمانی چهار قلم را مرور کن.',evidence:'checked-list'},rubric:adult,tags:['arezoo','german','shopping','home'],safeguarding:{}
},
{
 id:'elena-en-a0-alphabet',profile:'elena',language:'en',level:'A0',minutes:20,
 titleFa:'الفبای انگلیسی و نام حروف',titleTarget:'English alphabet and letter names',
 objectiveFa:'النا حروف بزرگ و کوچک را تشخیص دهد، نام ببرد و گروه‌بندی کند.',
 canDo:'I can recognise, name and match uppercase and lowercase English letters.',
 vocabulary:[V('A a','اِی','letter','letter-a'),V('B b','بی','letter','letter-b'),V('C c','سی','letter','letter-c'),V('D d','دی','letter','letter-d'),V('E e','ای','letter','letter-e'),V('F f','اِف','letter','letter-f')],
 phrases:['A is for apple.','B is for book.','C is for cat.','My name starts with E.'],grammar:[],pronunciation:['letter names A–F'],
 tasks:[
  T('een1-drag','drag-match','reading','حروف بزرگ و کوچک را روی هم بکش.',{pairs:[['A','a'],['B','b'],['C','c'],['D','d'],['E','e'],['F','f']]}),
  T('een1-sound','sound-picture','listening','صدای نام حرف را گوش بده و کارت درست را بزن.',{rounds:[{audio:'letter-a',answer:'A'},{audio:'letter-e',answer:'E'}]}),
  T('een1-trace','letter-trace','writing','حروف A تا F را با انگشت یا ماوس ردگیری کن.',{letters:['A','a','B','b','C','c','D','d','E','e','F','f']}),
  T('een1-speak','record-speech','speaking','حروف A تا F و مثال هرکدام را بگو.',{minSeconds:25,maxSeconds:50})
 ],
 mission:{type:'project',fa:'شش وسیله یا تصویر پیدا کن که با A تا F شروع شوند و یک پوستر خصوصی بساز.',evidence:'picture-board'},rubric:school,tags:['elena','alphabet','visual','interactive'],safeguarding:{noPublicUpload:true,parentReview:true}
},
{
 id:'elena-de-a0-alphabet',profile:'elena',language:'de',level:'A0',minutes:21,
 titleFa:'الفبای آلمانی و حروف ویژه',titleTarget:'Deutsches Alphabet: Ä, Ö, Ü, ß',
 objectiveFa:'حروف آلمانی و چهار نویسه ویژه را تشخیص و در واژه‌های تصویری پیدا کند.',
 canDo:'Ich kann deutsche Buchstaben sowie Ä, Ö, Ü und ß erkennen.',
 vocabulary:[V('A a','آ'),V('Ä ä','اِ با اوملات'),V('Ö ö','او با اوملات'),V('Ü ü','او/یو با اوملات'),V('ß','اِستسِت'),V('B b','بِ')],
 phrases:['A wie Apfel.','B wie Buch.','Ö wie Öl.','Ü wie Tür.','ß steht in Straße.'],grammar:[],pronunciation:['Ä /ɛː/','Ö /øː/','Ü /yː/','ß /ɛsˈt͡sɛt/'],
 tasks:[
  T('ede1-match','drag-match','reading','حروف بزرگ و کوچک را وصل کن.',{pairs:[['A','a'],['Ä','ä'],['Ö','ö'],['Ü','ü'],['B','b']]}),
  T('ede1-hear','sound-picture','listening','حرف شنیده‌شده را انتخاب کن.',{rounds:[{audio:'Ä',choices:['A','Ä','Ö'],answer:'Ä'},{audio:'Ü',choices:['U','Ü','Ö'],answer:'Ü'}]}),
  T('ede1-trace','letter-trace','writing','Ä ä Ö ö Ü ü ß را ردگیری کن.',{letters:['Ä','ä','Ö','ö','Ü','ü','ß']}),
  T('ede1-speak','record-speech','speaking','حروف ویژه و مثال آن‌ها را بگو.',{minSeconds:25,maxSeconds:50})
 ],
 mission:{type:'project',fa:'یک پوستر خصوصی برای Ä–Ö–Ü–ß با چهار تصویر بساز.',evidence:'picture-board'},rubric:school,tags:['elena','german','alphabet','umlaut'],safeguarding:{noPublicUpload:true,parentReview:true}
},
{
 id:'aria-en-pre-colours',profile:'aria',language:'en',level:'PRE',minutes:7,
 titleFa:'رنگ‌ها با اشیای واقعی',titleTarget:'Colours around us',
 objectiveFa:'آریا به red، blue و yellow با اشاره یا برداشتن شیء واکنش نشان دهد.',
 canDo:'Parent observation: Arya attends to or selects a named colour among two choices.',
 vocabulary:[V('red','قرمز','colour','red'),V('blue','آبی','colour','blue'),V('yellow','زرد','colour','yellow'),V('ball','توپ','noun','ball')],
 phrases:['Red ball.','Blue cup.','Show me yellow.','Well done!'],grammar:[],pronunciation:[],
 tasks:[
  T('ar-en2-show','visual-choice','listening','دو شیء واقعی بگذار و بگو Show me red.',{gentle:true,choices:['red','blue'],answer:'red'}),
  T('ar-en2-find','object-hunt','vocabulary','با والد یک شیء آبی در اتاق پیدا کن.',{gentle:true,target:'blue'}),
  T('ar-en2-roll','movement-game','movement','توپ رنگی را قل بدهید و نام رنگ را فقط والد بگوید.',{gentle:true,durationSeconds:60}),
  T('ar-en2-sort','colour-sort','vocabulary','سه قطعه رنگی را در ظرف‌های همرنگ بگذارید.',{gentle:true,colours:['red','blue','yellow']})
 ],
 mission:{type:'parent-guided',fa:'در لباس یا اسباب‌بازی، یک رنگ را بدون پرسش امتحانی نام ببرید.',evidence:'parent-observation'},rubric:pre,tags:['aria','preschool','colours','objects'],safeguarding:{parentRequired:true,noFormalAssessment:true,noRecordingRequired:true}
},
{
 id:'aria-de-pre-farben',profile:'aria',language:'de',level:'PRE',minutes:7,
 titleFa:'رنگ‌ها به آلمانی',titleTarget:'Farben entdecken',
 objectiveFa:'آریا به rot، blau و gelb با شیء واقعی واکنش نشان دهد.',
 canDo:'Elternbeobachtung: Arya achtet auf eine genannte Farbe oder wählt sie aus zwei Möglichkeiten.',
 vocabulary:[V('rot','قرمز','colour','red'),V('blau','آبی','colour','blue'),V('gelb','زرد','colour','yellow'),V('der Ball','توپ','noun','ball')],
 phrases:['Roter Ball.','Blaue Tasse.','Zeig mir Gelb.','Super!'],grammar:[],pronunciation:[],
 tasks:[
  T('ar-de2-show','visual-choice','listening','دو شیء بگذار و بگو Zeig mir Rot.',{gentle:true,choices:['red','blue'],answer:'red'}),
  T('ar-de2-find','object-hunt','vocabulary','با والد یک شیء blau پیدا کن.',{gentle:true,target:'blue'}),
  T('ar-de2-roll','movement-game','movement','توپ را قل بدهید و والد رنگ را بگوید.',{gentle:true,durationSeconds:60}),
  T('ar-de2-sort','colour-sort','vocabulary','سه قطعه را بر اساس رنگ مرتب کنید.',{gentle:true,colours:['rot','blau','gelb']})
 ],
 mission:{type:'parent-guided',fa:'در لباس یا اسباب‌بازی فقط یک رنگ آلمانی را نام ببرید.',evidence:'parent-observation'},rubric:pre,tags:['aria','preschool','german','colours'],safeguarding:{parentRequired:true,noFormalAssessment:true,noRecordingRequired:true}
}
];
window.FLH_CONTENT_PACKS.push({packId:'foundation-tranche-1',version:'6.2.0-alpha1',status:'reviewed-alpha',lessons});
})();
