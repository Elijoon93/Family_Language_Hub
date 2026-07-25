(function(){
  'use strict';
  const BANK={
    en:{
      animals:[
        {id:'cat',emoji:'🐱',word:'cat',fa:'گربه',color:'#fee2e2'},
        {id:'dog',emoji:'🐶',word:'dog',fa:'سگ',color:'#fef3c7'},
        {id:'bird',emoji:'🐦',word:'bird',fa:'پرنده',color:'#dbeafe'},
        {id:'fish',emoji:'🐟',word:'fish',fa:'ماهی',color:'#cffafe'},
        {id:'rabbit',emoji:'🐰',word:'rabbit',fa:'خرگوش',color:'#ede9fe'},
        {id:'lion',emoji:'🦁',word:'lion',fa:'شیر',color:'#ffedd5'}
      ],
      colors:[
        {id:'red',emoji:'🔴',word:'red',fa:'قرمز',color:'#fee2e2'},
        {id:'blue',emoji:'🔵',word:'blue',fa:'آبی',color:'#dbeafe'},
        {id:'green',emoji:'🟢',word:'green',fa:'سبز',color:'#dcfce7'},
        {id:'yellow',emoji:'🟡',word:'yellow',fa:'زرد',color:'#fef9c3'},
        {id:'orange',emoji:'🟠',word:'orange',fa:'نارنجی',color:'#ffedd5'},
        {id:'purple',emoji:'🟣',word:'purple',fa:'بنفش',color:'#f3e8ff'}
      ],
      food:[
        {id:'apple',emoji:'🍎',word:'apple',fa:'سیب',color:'#fee2e2'},
        {id:'banana',emoji:'🍌',word:'banana',fa:'موز',color:'#fef9c3'},
        {id:'bread',emoji:'🍞',word:'bread',fa:'نان',color:'#fef3c7'},
        {id:'milk',emoji:'🥛',word:'milk',fa:'شیر',color:'#e0f2fe'},
        {id:'cheese',emoji:'🧀',word:'cheese',fa:'پنیر',color:'#fef3c7'},
        {id:'water',emoji:'💧',word:'water',fa:'آب',color:'#cffafe'}
      ],
      body:[
        {id:'eye',emoji:'👁️',word:'eye',fa:'چشم',color:'#ede9fe'},
        {id:'ear',emoji:'👂',word:'ear',fa:'گوش',color:'#ffedd5'},
        {id:'hand',emoji:'✋',word:'hand',fa:'دست',color:'#fef3c7'},
        {id:'foot',emoji:'🦶',word:'foot',fa:'پا',color:'#fee2e2'},
        {id:'nose',emoji:'👃',word:'nose',fa:'بینی',color:'#ffedd5'},
        {id:'mouth',emoji:'👄',word:'mouth',fa:'دهان',color:'#fce7f3'}
      ],
      family:[
        {id:'mother',emoji:'👩',word:'mother',fa:'مادر',color:'#fce7f3'},
        {id:'father',emoji:'👨',word:'father',fa:'پدر',color:'#dbeafe'},
        {id:'sister',emoji:'👧',word:'sister',fa:'خواهر',color:'#ede9fe'},
        {id:'brother',emoji:'👦',word:'brother',fa:'برادر',color:'#dcfce7'},
        {id:'family',emoji:'👨‍👩‍👧‍👦',word:'family',fa:'خانواده',color:'#fef3c7'}
      ],
      school:[
        {id:'book',emoji:'📘',word:'book',fa:'کتاب',color:'#dbeafe'},
        {id:'pen',emoji:'🖊️',word:'pen',fa:'خودکار',color:'#e0e7ff'},
        {id:'pencil',emoji:'✏️',word:'pencil',fa:'مداد',color:'#fef3c7'},
        {id:'bag',emoji:'🎒',word:'school bag',fa:'کیف مدرسه',color:'#fee2e2'},
        {id:'teacher',emoji:'👩‍🏫',word:'teacher',fa:'معلم',color:'#fce7f3'},
        {id:'class',emoji:'🏫',word:'school',fa:'مدرسه',color:'#dcfce7'}
      ],
      home:[
        {id:'door',emoji:'🚪',word:'door',fa:'در',color:'#fef3c7'},
        {id:'bed',emoji:'🛏️',word:'bed',fa:'تخت',color:'#dbeafe'},
        {id:'chair',emoji:'🪑',word:'chair',fa:'صندلی',color:'#ffedd5'},
        {id:'table',emoji:'🟫',word:'table',fa:'میز',color:'#fef3c7'},
        {id:'lamp',emoji:'💡',word:'lamp',fa:'چراغ',color:'#fef9c3'},
        {id:'home',emoji:'🏠',word:'home',fa:'خانه',color:'#dcfce7'}
      ],
      shopping:[
        {id:'basket',emoji:'🧺',word:'basket',fa:'سبد',color:'#fef3c7'},
        {id:'cart',emoji:'🛒',word:'shopping cart',fa:'چرخ خرید',color:'#dbeafe'},
        {id:'price',emoji:'🏷️',word:'price',fa:'قیمت',color:'#fee2e2'},
        {id:'cash',emoji:'💶',word:'cash',fa:'پول نقد',color:'#dcfce7'},
        {id:'receipt',emoji:'🧾',word:'receipt',fa:'رسید',color:'#e0e7ff'},
        {id:'shop',emoji:'🏪',word:'shop',fa:'فروشگاه',color:'#ffedd5'}
      ],
      kitchen:[
        {id:'spoon',emoji:'🥄',word:'spoon',fa:'قاشق',color:'#e0f2fe'},
        {id:'fork',emoji:'🍴',word:'fork',fa:'چنگال',color:'#f1f5f9'},
        {id:'knife',emoji:'🔪',word:'knife',fa:'چاقو',color:'#fee2e2'},
        {id:'pot',emoji:'🍲',word:'pot',fa:'قابلمه',color:'#ffedd5'},
        {id:'plate',emoji:'🍽️',word:'plate',fa:'بشقاب',color:'#f8fafc'},
        {id:'cup',emoji:'☕',word:'cup',fa:'فنجان',color:'#fef3c7'}
      ]
    },
    de:{}
  };
  BANK.de={
    animals:BANK.en.animals.map((x,i)=>({...x,word:['Katze','Hund','Vogel','Fisch','Kaninchen','Löwe'][i]})),
    colors:BANK.en.colors.map((x,i)=>({...x,word:['rot','blau','grün','gelb','orange','lila'][i]})),
    food:BANK.en.food.map((x,i)=>({...x,word:['Apfel','Banane','Brot','Milch','Käse','Wasser'][i]})),
    body:BANK.en.body.map((x,i)=>({...x,word:['Auge','Ohr','Hand','Fuß','Nase','Mund'][i]})),
    family:BANK.en.family.map((x,i)=>({...x,word:['Mutter','Vater','Schwester','Bruder','Familie'][i]})),
    school:BANK.en.school.map((x,i)=>({...x,word:['Buch','Stift','Bleistift','Schulranzen','Lehrerin','Schule'][i]})),
    home:BANK.en.home.map((x,i)=>({...x,word:['Tür','Bett','Stuhl','Tisch','Lampe','Zuhause'][i]})),
    shopping:BANK.en.shopping.map((x,i)=>({...x,word:['Korb','Einkaufswagen','Preis','Bargeld','Kassenbon','Geschäft'][i]})),
    kitchen:BANK.en.kitchen.map((x,i)=>({...x,word:['Löffel','Gabel','Messer','Topf','Teller','Tasse'][i]}))
  };

  const LETTERS={
    en:[
      ['A','apple','🍎','سیب'],['B','ball','⚽','توپ'],['C','cat','🐱','گربه'],['D','dog','🐶','سگ'],['E','egg','🥚','تخم‌مرغ'],['F','fish','🐟','ماهی'],
      ['G','grape','🍇','انگور'],['H','house','🏠','خانه'],['I','ice cream','🍦','بستنی'],['J','juice','🧃','آبمیوه'],['K','kite','🪁','بادبادک'],['L','lion','🦁','شیر'],
      ['M','moon','🌙','ماه'],['N','nose','👃','بینی'],['O','orange','🍊','پرتقال'],['P','pen','🖊️','خودکار'],['Q','queen','👑','ملکه'],['R','rabbit','🐰','خرگوش'],
      ['S','sun','☀️','خورشید'],['T','tree','🌳','درخت'],['U','umbrella','☂️','چتر'],['V','van','🚐','ون'],['W','water','💧','آب'],['X','xylophone','🎼','زیلوفون'],
      ['Y','yellow','🟡','زرد'],['Z','zebra','🦓','گورخر']
    ],
    de:[
      ['A','Apfel','🍎','سیب'],['B','Ball','⚽','توپ'],['C','Computer','💻','رایانه'],['D','Delfin','🐬','دلفین'],['E','Elefant','🐘','فیل'],['F','Fisch','🐟','ماهی'],
      ['G','Gabel','🍴','چنگال'],['H','Haus','🏠','خانه'],['I','Igel','🦔','جوجه‌تیغی'],['J','Jacke','🧥','ژاکت'],['K','Katze','🐱','گربه'],['L','Lampe','💡','چراغ'],
      ['M','Maus','🐭','موش'],['N','Nase','👃','بینی'],['O','Orange','🍊','پرتقال'],['P','Panda','🐼','پاندا'],['Q','Qualle','🪼','عروس دریایی'],['R','Regen','🌧️','باران'],
      ['S','Sonne','☀️','خورشید'],['T','Tisch','🟫','میز'],['U','Uhr','⌚','ساعت'],['V','Vogel','🐦','پرنده'],['W','Wasser','💧','آب'],['X','Xylophon','🎼','زیلوفون'],
      ['Y','Yoga','🧘','یوگا'],['Z','Zebra','🦓','گورخر'],['Ä','Äpfel','🍎','سیب‌ها'],['Ö','Öl','🫗','روغن'],['Ü','Übung','📝','تمرین'],['ß','Straße','🛣️','خیابان']
    ]
  };

  const STORIES={
    en:[
      [{emoji:'🌅',text:'Elena wakes up.'},{emoji:'🎒',text:'She packs her school bag.'},{emoji:'🏫',text:'She goes to school.'}],
      [{emoji:'🛒',text:'Arzoo takes a shopping cart.'},{emoji:'🍎',text:'She buys apples.'},{emoji:'🧾',text:'She checks the receipt.'}],
      [{emoji:'☁️',text:'The sky is cloudy.'},{emoji:'🌧️',text:'It starts to rain.'},{emoji:'☂️',text:'The child opens an umbrella.'}]
    ],
    de:[
      [{emoji:'🌅',text:'Elena steht auf.'},{emoji:'🎒',text:'Sie packt den Schulranzen.'},{emoji:'🏫',text:'Sie geht zur Schule.'}],
      [{emoji:'🛒',text:'Arzoo nimmt einen Einkaufswagen.'},{emoji:'🍎',text:'Sie kauft Äpfel.'},{emoji:'🧾',text:'Sie prüft den Kassenbon.'}],
      [{emoji:'☁️',text:'Der Himmel ist bewölkt.'},{emoji:'🌧️',text:'Es beginnt zu regnen.'},{emoji:'☂️',text:'Das Kind öffnet einen Regenschirm.'}]
    ]
  };

  const MOVEMENTS={
    en:[['jump','بپر','🤸'],['clap','دست بزن','👏'],['turn around','بچرخ','🌀'],['touch your nose','بینی‌ات را لمس کن','👃'],['sit down','بنشین','🪑'],['stand up','بلند شو','🧍']],
    de:[['spring','بپر','🤸'],['klatsch','دست بزن','👏'],['dreh dich','بچرخ','🌀'],['fass deine Nase an','بینی‌ات را لمس کن','👃'],['setz dich','بنشین','🪑'],['steh auf','بلند شو','🧍']]
  };

  function themeFromUnit(unit){
    const t=`${unit?.title||''} ${unit?.titleFa||''} ${unit?.vocabulary||''}`.toLowerCase();
    if(/animal|tier/.test(t))return'animals';
    if(/color|farbe/.test(t))return'colors';
    if(/food|drink|essen|trinken/.test(t))return'food';
    if(/body|feeling|körper|gesund/.test(t))return'body';
    if(/family|familie/.test(t))return'family';
    if(/school|schule|class/.test(t))return'school';
    if(/shop|price|einkauf|kauf/.test(t))return'shopping';
    if(/kitchen|cook|küche|koch/.test(t))return'kitchen';
    return'home';
  }
  function pick(unit,lang,count=4){
    const theme=themeFromUnit(unit);
    const items=[...(BANK[lang]?.[theme]||BANK[lang]?.home||[])];
    return{theme,items:items.sort(()=>Math.random()-.5).slice(0,count)};
  }
  function alphabet(lang){return LETTERS[lang]||LETTERS.en;}
  function letter(lang,index=0){const a=alphabet(lang);return a[index%a.length];}
  function story(lang,index=0){const a=STORIES[lang]||STORIES.en;return a[index%a.length].map((x,i)=>({...x,order:i+1}));}
  function movement(lang,index=0){const a=MOVEMENTS[lang]||MOVEMENTS.en;return a[index%a.length];}
  window.FLH_VISUALS={BANK,LETTERS,STORIES,MOVEMENTS,themeFromUnit,pick,alphabet,letter,story,movement};
})();