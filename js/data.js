/**
 * Tamenny Faculty Dean Portal - Mock Database & Observability Data
 * Represents realistic interns, training branches, prescriptions, and plans.
 */

const DeanData = {
  kpis: {
    totalInterns: 148,
    activeInPharmacies: 126,
    completedTraining: 18,
    atRiskFollowUp: 4,
    totalAuditedOperations: 4320,
    totalRxReviewed: 1840,
    totalPlansCreated: 620,
    totalOrdersAssisted: 1860,
    totalLoggedHours: 36420,
    requiredHoursPerStudent: 300,
    complianceRate: 97.4,
  },

  pharmacyChains: [
    { id: 'ch-elazaby', name: 'صيدليات العزبي', icon: 'bx-plus-medical', studentCount: 42, governorates: 'القاهرة، الجيزة', contact: 'د. هشام طلعت' },
    { id: 'ch-seif', name: 'صيدليات سيف', icon: 'bx-shield-plus', studentCount: 36, governorates: 'الجيزة، 6 أكتوبر', contact: 'د. أيمن سيف' },
    { id: 'ch-roshdy', name: 'صيدليات رشدي', icon: 'bx-capsule', studentCount: 28, governorates: 'القاهرة الجديدة، المعادي', contact: 'د. ياسر رضوان' },
    { id: 'ch-19011', name: 'صيدليات 19011', icon: 'bx-clinic', studentCount: 24, governorates: 'مدينة نصر، شبرا', contact: 'د. كمال سامي' },
    { id: 'ch-misr', name: 'صيدليات مصر', icon: 'bx-health', studentCount: 18, governorates: 'الزمالك، الدقي', contact: 'د. ممدوح فؤاد' },
  ],

  interns: [
    {
      id: 'int-101',
      name: 'أحمد مصطفى محمود',
      studentId: '20210142',
      avatarInitial: 'أم',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات العزبي',
      branchName: 'فرع المعادي (شارع النصر)',
      governorate: 'القاهرة',
      supervisorName: 'د. طارق نبيل (صيدلي أول)',
      startDate: '2026-01-10',
      loggedHours: 260,
      targetHours: 300,
      status: 'active', // active, completed, pending, risk
      rating: 4.9,
      operationsCount: 94,
      prescriptions: [
        {
          id: 'rx-501',
          code: 'RX-2026-8812',
          date: '2026-03-05',
          patientName: 'الحاج محمود عبد العزيز (62 سنة)',
          doctorName: 'د. محمد الجابري (استشاري باطنة وسكر)',
          diagnosis: 'داء السكري من النوع الثاني + ارتفاع ضغط الدم الشرياني',
          medications: ['Januvia 100mg (Sitagliptin)', 'Concor 5mg (Bisoprolol)', 'Glucophage 1000mg'],
          studentNote: 'تمت مراجعة الجرعات والتحقق من عدم وجود تداخلات دوائية بين Sitagliptin و Bisoprolol، وتم توجيه المريض بتناول Glucophage وسط الوجبة لمنع الاضطرابات الهضمية.',
          supervisorSign: 'معتمد وموقع بواسطة د. طارق نبيل'
        },
        {
          id: 'rx-502',
          code: 'RX-2026-8790',
          date: '2026-03-03',
          patientName: 'منى سعيد الألفي (34 سنة)',
          doctorName: 'د. هاني شاكر (أخصائي صدر وجهاز تنفسي)',
          diagnosis: 'التهاب شعبي حاد مع حساسية صدرية',
          medications: ['Augmentin 1g tab', 'Ventolin Evohaler', 'Singulair 10mg'],
          studentNote: 'تم التأكد من عدم وجود حساسية البنسلين لدى المريضة، وشرح الاستخدام الصحيح لبخاخ Ventolin مع المباعد (Spacer).',
          supervisorSign: 'معتمد بواسطة د. طارق نبيل'
        }
      ],
      medicationPlans: [
        {
          id: 'pl-201',
          title: 'جدول تنظيم جرعات السكر وضغط الدم لمريض مسن',
          startDate: '2026-02-15',
          duration: '90 يوماً',
          schedule: 'صباحاً: Concor 5mg على الريق | ظهراً: Januvia 100mg | مساءً: Glucophage 1000mg مع العشاء',
          instructions: 'متابعة قياس الضغط يومياً في الصباح قبل تناول الإفطار، والاتصال بالصيدلية في حال الشعور بدوار.',
          patientName: 'الحاج محمود عبد العزيز'
        }
      ],
      ordersFulfilled: [
        { id: 'ord-810', code: '#ORD-9120', date: '2026-03-06', itemsCount: 4, totalAmount: '485.00 ج.م', status: 'مكتمل ومسلم' },
        { id: 'ord-811', code: '#ORD-9082', date: '2026-03-04', itemsCount: 2, totalAmount: '160.00 ج.م', status: 'مكتمل ومسلم' }
      ],
      attendanceLogs: [
        { date: '2026-03-06', hours: 6, shift: 'صباحي (09:00 - 15:00)', verifiedBy: 'د. طارق نبيل' },
        { date: '2026-03-05', hours: 6, shift: 'صباحي (09:00 - 15:00)', verifiedBy: 'د. طارق نبيل' },
        { date: '2026-03-04', hours: 6, shift: 'صباحي (09:00 - 15:00)', verifiedBy: 'د. طارق نبيل' },
        { date: '2026-03-02', hours: 6, shift: 'مسائي (15:00 - 21:00)', verifiedBy: 'د. طارق نبيل' }
      ],
      chats: [
        {
          id: 'chat-101',
          patientName: 'الحاج محمود عبد العزيز',
          patientAge: '62 سنة',
          patientCondition: 'داء السكري + ضغط الدم',
          lastTime: 'اليوم، 11:30 ص',
          messages: [
            { sender: 'patient', name: 'الحاج محمود', text: 'السلام عليكم يا دكتور أحمد، أنا بدأت دواء Concor الصبح بس حاسس بهبوط خفيف، هل ده طبيعي؟', time: '11:15 ص' },
            { sender: 'intern', name: 'د. أحمد مصطفى (متدرب)', text: 'وعليكم السلام يا حاج محمود. ألف سلامة عليك. الهبوط الخفيف في أول يومين متوقع مع بدء ضبط ضغط الدم. قيس الضغط دلوقتي وابعتهولي هنا، واحرص تاخد حبة السكر بعد وجبة الإفطار مباشرة مش على الريق.', time: '11:20 ص' },
            { sender: 'patient', name: 'الحاج محمود', text: 'قسته دلوقتي وطلع 120/75 وسكر الدم 135 بعد الفطار بساعتين.', time: '11:25 ص' },
            { sender: 'intern', name: 'د. أحمد مصطفى (متدرب)', text: 'قراءات ممتازة ومثالية جداً يا فندم. استمر بنفس المواعيد المسجلة في جدول الدواء، وبلغني فوراً لو حسيت بأي دوخة مستمرة.', time: '11:30 ص' }
          ]
        },
        {
          id: 'chat-102',
          patientName: 'منى سعيد الألفي',
          patientAge: '34 سنة',
          patientCondition: 'حساسية صدرية وربو',
          lastTime: 'أمس، 06:45 م',
          messages: [
            { sender: 'patient', name: 'منى سعيد', text: 'دكتور، بخاخ الفنتولين يتاخد قبل الأكل ولا بعده؟ وهل بيعمل رعشة خفيفة في الإيد؟', time: '06:30 م' },
            { sender: 'intern', name: 'د. أحمد مصطفى (متدرب)', text: 'أهلاً بحضرتك يا أستاذة منى. الفنتولين بخاخ موسع للشعب ملوش علاقة بالأكل، بيتاخد عند اللزوم (بختين عند الإحساس بضيق التنفس). الرعشة البسيطة في اليدين أو زيادة ضربات القلب الخفيفة عرض جانبي شائع ومؤقت وبيختفي تماماً خلال ربع ساعة. المهم المضمضة بالماء بعد الاستخدام.', time: '06:40 م' },
            { sender: 'patient', name: 'منى سعيد', text: 'تمام وضحت الفكرة شكراً جزيلاً يا دكتور جزاك الله خيراً.', time: '06:45 م' }
          ]
        }
      ]
    },
    {
      id: 'int-102',
      name: 'مريم حسام الشريف',
      studentId: '20210219',
      avatarInitial: 'مح',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات سيف',
      branchName: 'فرع الدقي (شارع مصدق)',
      governorate: 'الجيزة',
      supervisorName: 'د. إيمان عبد الرازق',
      startDate: '2026-01-08',
      loggedHours: 295,
      targetHours: 300,
      status: 'active',
      rating: 5.0,
      operationsCount: 112,
      prescriptions: [
        {
          id: 'rx-503',
          code: 'RX-2026-9041',
          date: '2026-03-06',
          patientName: 'فريدة سمير (28 سنة - حامل بالشهر الرابع)',
          doctorName: 'د. نهى فوزي (نساء وتوليد)',
          diagnosis: 'أنيميا نقص الحديد أثناء الحمل',
          medications: ['Feroglobin caps', 'Fol-Plus 5mg', 'Caltrate 600mg + D'],
          studentNote: 'تنبيه المريضة بوجوب الفصل الزمني (ساعتين على الأقل) بين حبوب الحديد ومكملات الكالسيوم لتفادي تثبيط امتصاص الحديد.',
          supervisorSign: 'توصية ممتازة معتمدة بواسطة د. إيمان عبد الرازق'
        }
      ],
      medicationPlans: [
        {
          id: 'pl-202',
          title: 'برنامج مكملات الحمل والوقاية من الأنيميا',
          startDate: '2026-02-20',
          duration: '120 يوماً',
          schedule: 'الحديد مع وجبة الغداء مع عصير برتقال، الكالسيوم مساءً قبل النوم.',
          instructions: 'تجنب شرب الشاي أو القهوة عقب جرعة الحديد مباشرة.',
          patientName: 'فريدة سمير'
        }
      ],
      ordersFulfilled: [
        { id: 'ord-812', code: '#ORD-9155', date: '2026-03-06', itemsCount: 3, totalAmount: '320.00 ج.م', status: 'مكتمل ومسلم' }
      ],
      attendanceLogs: [
        { date: '2026-03-06', hours: 7, shift: 'صباحي', verifiedBy: 'د. إيمان عبد الرازق' }
      ],
      chats: [
        {
          id: 'chat-201',
          patientName: 'فريدة سمير (حامل)',
          patientAge: '28 سنة',
          patientCondition: 'أنيميا الحمل ومتابعة مكملات',
          lastTime: 'أمس، 02:15 م',
          messages: [
            { sender: 'patient', name: 'فريدة سمير', text: 'دكتورة مريم، حبات الكالسيوم بتعملي إمساك خفيف، أعمل إيه؟ وهل ينفع أوقفها يومين؟', time: '01:50 م' },
            { sender: 'intern', name: 'د. مريم حسام (متدربة)', text: 'أهلاً بحضرتك يا مدام فريدة. متوقفيش الكالسيوم لأنه مهم جداً لنمو عظام الجنين في الشهر الرابع. الحل إننا نزود شرب الماء لـ 2.5 لتر يومياً وتناول خضروات ورقية وفاكهة غنية بالألياف زي البرتقال والكيوي، وخدي الحبة مع كوباية مية كبيرة وسط العشاء.', time: '02:05 م' },
            { sender: 'patient', name: 'فريدة سمير', text: 'شكراً جداً لاهتمامك ونصيحتك يا دكتورة، هجرب ده النهاردة.', time: '02:15 م' }
          ]
        }
      ]
    },
    {
      id: 'int-103',
      name: 'عمر طارق عبد الله',
      studentId: '20210088',
      avatarInitial: 'عط',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات 19011',
      branchName: 'فرع مدينة نصر (عباس العقاد)',
      governorate: 'القاهرة',
      supervisorName: 'د. خالد منتصر',
      startDate: '2025-12-15',
      loggedHours: 300,
      targetHours: 300,
      status: 'completed',
      rating: 4.8,
      operationsCount: 130,
      prescriptions: [
        {
          id: 'rx-504',
          code: 'RX-2026-7840',
          date: '2026-02-28',
          patientName: 'سامي عبد الجواد (50 سنة)',
          doctorName: 'د. عادل توفيق (أمراض القلب والأوعية)',
          diagnosis: 'قصور بالشرايين التاجية وارتفاع الكولسترول',
          medications: ['Ator 40mg (Atorvastatin)', 'Plavix 75mg (Clopidogrel)', 'Nebilet 5mg'],
          studentNote: 'تمت مراجعة إنزيمات الكبد مع المريض والتأكيد على تناول الستاتين ليلاً قبل النوم.',
          supervisorSign: 'معتمد بواسطة د. خالد منتصر'
        }
      ],
      medicationPlans: [
        {
          id: 'pl-203',
          title: 'برنامج تنظيم علاجات القلب وتثبيط الكولسترول',
          startDate: '2026-01-10',
          duration: '180 يوماً',
          schedule: 'صباحاً: Nebilet 5mg بعد الإفطار | ظهراً: Plavix 75mg | ليلاً: Ator 40mg قبل النوم',
          instructions: 'عدم إيقاف بلافيكس دون مراجعة طبيب القلب، وتجنب عصير الجريب فروت.',
          patientName: 'سامي عبد الجواد'
        }
      ],
      ordersFulfilled: [
        { id: 'ord-820', code: '#ORD-9201', date: '2026-03-05', itemsCount: 3, totalAmount: '510.00 ج.م', status: 'مكتمل ومسلم' }
      ],
      attendanceLogs: [
        { date: '2026-03-05', hours: 6, shift: 'مسائي (15:00 - 21:00)', verifiedBy: 'د. خالد منتصر' },
        { date: '2026-03-03', hours: 6, shift: 'مسائي (15:00 - 21:00)', verifiedBy: 'د. خالد منتصر' }
      ],
      chats: [
        {
          id: 'chat-301',
          patientName: 'سامي عبد الجواد',
          patientAge: '50 سنة',
          patientCondition: 'شرايين تاجية وكولسترول',
          lastTime: 'اليوم، 09:40 ص',
          messages: [
            { sender: 'patient', name: 'سامي عبد الجواد', text: 'صباح الخير دكتور عمر، هل حبة الكولسترول آخدها بالليل قبل النوم ولا عادي الصبح؟', time: '09:25 ص' },
            { sender: 'intern', name: 'د. عمر طارق (متدرب)', text: 'أهلاً بحضرتك يا أستاذ سامي. حبوب الستاتين (أتورفاستاتين) يفضل أخذها ليلاً قبل النوم مباشرة، لأن إنزيم تصنيع الكولسترول في الكبد يكون في أعلى درجات نشاطه أثناء النوم.', time: '09:35 ص' },
            { sender: 'patient', name: 'سامي عبد الجواد', text: 'تمام وضحت جداً، ربنا يبارك فيك يا دكتور.', time: '09:40 ص' }
          ]
        }
      ]
    },
    {
      id: 'int-104',
      name: 'نورين خالد المنشاوي',
      studentId: '20210304',
      avatarInitial: 'نخ',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات رشدي',
      branchName: 'فرع التجمع الخامس (شارع التسعين)',
      governorate: 'القاهرة الجديدة',
      supervisorName: 'د. رانيا عادل',
      startDate: '2026-01-20',
      loggedHours: 180,
      targetHours: 300,
      status: 'active',
      rating: 4.7,
      operationsCount: 68,
      prescriptions: [
        {
          id: 'rx-505',
          code: 'RX-2026-7910',
          date: '2026-03-04',
          patientName: 'مروة عبد الرحمن (29 سنة)',
          doctorName: 'د. شريف حلمي (جلدية وتناسلية)',
          diagnosis: 'حب شباب ملتهب حاد (Acne Vulgaris)',
          medications: ['Curacne 20mg (Isotretinoin)', 'Bioderma Sebium Hydra', 'Lip balm SPF'],
          studentNote: 'التأكد من إجراء تحاليل وظائف الكبد والدهون الثلاثية، والتأكيد الصارم على منع الحمل.',
          supervisorSign: 'معتمد بواسطة د. رانيا عادل'
        }
      ],
      medicationPlans: [
        {
          id: 'pl-204',
          title: 'بروتوكول الآيزوتريتينوين وترطيب البشرة',
          startDate: '2026-02-01',
          duration: '120 يوماً',
          schedule: 'كبسولة 20mg وسط وجبة دسمة يومياً بعد الغداء',
          instructions: 'استخدام مرطب طبي ومرطب شفاه بانتظام والامتناع التام عن التبرع بالدم.',
          patientName: 'مروة عبد الرحمن'
        }
      ],
      ordersFulfilled: [
        { id: 'ord-825', code: '#ORD-9288', date: '2026-03-04', itemsCount: 4, totalAmount: '680.00 ج.م', status: 'مكتمل ومسلم' }
      ],
      attendanceLogs: [
        { date: '2026-03-04', hours: 6, shift: 'صباحي (09:00 - 15:00)', verifiedBy: 'د. رانيا عادل' }
      ],
      chats: [
        {
          id: 'chat-401',
          patientName: 'مروة عبد الرحمن',
          patientAge: '29 سنة',
          patientCondition: 'حب شباب وعلاج ريتينويد',
          lastTime: 'أمس، 05:20 م',
          messages: [
            { sender: 'patient', name: 'مروة عبد الرحمن', text: 'دكتورة نورين، شفايفي جافة جداً مع الكيوراكني، أستخدم إيه مرطب قوي؟', time: '05:00 م' },
            { sender: 'intern', name: 'د. نورين خالد (متدربة)', text: 'أهلاً مروة. جفاف الشفاه عرض حتمي ومؤشر لفعالية العلاج. استخدمي مرطب طبي شمعي خالي من العطور (زي بيبانثين الوردي أو يوسيرين) كل ساعتين، واشربي مياه كتير.', time: '05:15 م' },
            { sender: 'patient', name: 'مروة عبد الرحمن', text: 'تمام هجيبه حالاً، شكراً يا دكتورة.', time: '05:20 م' }
          ]
        }
      ]
    },
    {
      id: 'int-105',
      name: 'يوسف إبراهيم خليل',
      studentId: '20210115',
      avatarInitial: 'يإ',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات مصر',
      branchName: 'فرع الزمالك (شارع 26 يوليو)',
      governorate: 'القاهرة',
      supervisorName: 'د. تامر سليم',
      startDate: '2026-02-01',
      loggedHours: 85,
      targetHours: 300,
      status: 'risk', // يحتاج متابعة لتأخره في الساعات
      rating: 3.8,
      operationsCount: 22,
      prescriptions: [
        {
          id: 'rx-506',
          code: 'RX-2026-8012',
          date: '2026-03-02',
          patientName: 'نبيل شريف (67 سنة)',
          doctorName: 'د. حازم المنياوي (أنف وأذن وحنجرة)',
          diagnosis: 'التهاب حاد بالجيوب الأنفية مع صديد',
          medications: ['Klacid 500mg (Clarithromycin)', 'Otrivin Adult spray', 'Panadol Sinus'],
          studentNote: 'تنبيه المريض بعدم استخدام بخاخ أوترفين لأكثر من 5 أيام لتجنب احتقان الارتداد، والتأكد من عدم وجود اعتلال في وظائف الكلى.',
          supervisorSign: 'معتمد بواسطة د. تامر سليم'
        }
      ],
      medicationPlans: [
        {
          id: 'pl-205',
          title: 'جدول المضاد الحيوي وعلاج الجيوب الأنفية',
          startDate: '2026-03-02',
          duration: '10 أيام',
          schedule: 'قرص Klacid كل 12 ساعة بعد الأكل مع كوب ماء كبير',
          instructions: 'إكمال الكورس كاملاً حتى مع زوال الأعراض.',
          patientName: 'نبيل شريف'
        }
      ],
      ordersFulfilled: [
        { id: 'ord-830', code: '#ORD-9304', date: '2026-03-02', itemsCount: 2, totalAmount: '240.00 ج.م', status: 'مكتمل ومسلم' }
      ],
      attendanceLogs: [
        { date: '2026-03-02', hours: 5, shift: 'صباحي', verifiedBy: 'د. تامر سليم' }
      ],
      chats: [
        {
          id: 'chat-501',
          patientName: 'نبيل شريف',
          patientAge: '67 سنة',
          patientCondition: 'التهاب الجيوب الأنفية',
          lastTime: 'منذ 3 أيام',
          messages: [
            { sender: 'patient', name: 'نبيل شريف', text: 'دكتور يوسف، المضاد الحيوي بيتعب معدتي خفيف، هل أوقفه؟', time: '11:00 ص' },
            { sender: 'intern', name: 'د. يوسف إبراهيم (متدرب)', text: 'ألف سلامة يا فندم. ممنوع تماماً إيقاف المضاد قبل انتهاء المدة المقررة. خذ القرص وسط وجبة الغداء مباشرة واشرب كوب ماء كبير، ولو التعب استمر راسلني لتعديل التوقيت.', time: '11:15 ص' },
            { sender: 'patient', name: 'نبيل شريف', text: 'حاضر هلتزم بيه وسط الأكل.', time: '11:20 ص' }
          ]
        }
      ]
    },
    {
      id: 'int-106',
      name: 'سلمى وليد عثمان',
      studentId: '20210255',
      avatarInitial: 'سو',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات العزبي',
      branchName: 'فرع المهندسين (شارع جامعة الدول)',
      governorate: 'الجيزة',
      supervisorName: 'د. مروان رشاد',
      startDate: '2026-01-12',
      loggedHours: 240,
      targetHours: 300,
      status: 'active',
      rating: 4.9,
      operationsCount: 88,
      prescriptions: [
        {
          id: 'rx-507',
          code: 'RX-2026-8150',
          date: '2026-03-06',
          patientName: 'رانيا سمير (41 سنة)',
          doctorName: 'د. عصام النجار (صدر وحساسية)',
          diagnosis: 'حساسية صدرية مزمنة (Asthma)',
          medications: ['Seretide 250 Diskus', 'Ventolin inhaler', 'Zyrtec 10mg'],
          studentNote: 'تعليم المريضة الطريقة السليمة لشفط بودرة Diskus والمضمضة فوراً بعد الاستخدام لمنع بحة الصوت وفطريات الفم.',
          supervisorSign: 'معتمد بواسطة د. مروان رشاد'
        }
      ],
      medicationPlans: [
        {
          id: 'pl-206',
          title: 'خطة التحكم في أزمات الربو الموسمي',
          startDate: '2026-02-10',
          duration: '90 يوماً',
          schedule: 'بخة سيريتيد صباحاً ومساءً بانتظام، وفنتولين للطوارئ',
          instructions: 'المضمضة بالماء والبصق عقب بخاخ الكورتيزون.',
          patientName: 'رانيا سمير'
        }
      ],
      ordersFulfilled: [
        { id: 'ord-835', code: '#ORD-9350', date: '2026-03-06', itemsCount: 3, totalAmount: '490.00 ج.م', status: 'مكتمل ومسلم' }
      ],
      attendanceLogs: [
        { date: '2026-03-06', hours: 6, shift: 'مسائي', verifiedBy: 'د. مروان رشاد' }
      ],
      chats: [
        {
          id: 'chat-601',
          patientName: 'رانيا سمير',
          patientAge: '41 سنة',
          patientCondition: 'حساسية صدر وربو',
          lastTime: 'اليوم، 12:10 م',
          messages: [
            { sender: 'patient', name: 'رانيا سمير', text: 'دكتورة سلمى، بحس بمرارة في حلقي بعد بخاخ سيريتيد، هل ده عادي؟', time: '11:55 ص' },
            { sender: 'intern', name: 'د. سلمى وليد (متدربة)', text: 'أهلاً مدام رانيا. ده طبيعي بسبب بودرة الدواء. المهم جداً التمضمض بالماء الدافئ والبصق فوراً بعد البخة مباشرة عشان نمنع أي مرارة أو التهاب في الحلق.', time: '12:05 م' },
            { sender: 'patient', name: 'رانيا سمير', text: 'شكراً دكتورة سلمى، هعمل كده في جرعة المساء إن شاء الله.', time: '12:10 م' }
          ]
        }
      ]
    },
    {
      id: 'int-107',
      name: 'زياد عمرو البشري',
      studentId: '20210410',
      avatarInitial: 'زع',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات سيف',
      branchName: 'فرع الشيخ زايد (هايبر وان)',
      governorate: 'الجيزة',
      supervisorName: 'د. عاصم فكري',
      startDate: '2026-01-15',
      loggedHours: 210,
      targetHours: 300,
      status: 'active',
      rating: 4.6,
      operationsCount: 74,
      prescriptions: [],
      medicationPlans: [],
      ordersFulfilled: [],
      attendanceLogs: []
    },
    {
      id: 'int-108',
      name: 'فاطمة أحمد السعيد',
      studentId: '20210190',
      avatarInitial: 'فأ',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات رشدي',
      branchName: 'فرع مصر الجديدة (روكسي)',
      governorate: 'القاهرة',
      supervisorName: 'د. ماجد سامي',
      startDate: '2025-12-20',
      loggedHours: 300,
      targetHours: 300,
      status: 'completed',
      rating: 5.0,
      operationsCount: 142,
      prescriptions: [],
      medicationPlans: [],
      ordersFulfilled: [],
      attendanceLogs: []
    },
    {
      id: 'int-109',
      name: 'كريم شريف النجار',
      studentId: '20210065',
      avatarInitial: 'كش',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات 19011',
      branchName: 'فرع الهرم (شارع فيصل)',
      governorate: 'الجيزة',
      supervisorName: 'د. علاء عز الدين',
      startDate: '2026-02-18',
      loggedHours: 45,
      targetHours: 300,
      status: 'pending',
      rating: 4.5,
      operationsCount: 15,
      prescriptions: [],
      medicationPlans: [],
      ordersFulfilled: [],
      attendanceLogs: []
    },
    {
      id: 'int-110',
      name: 'هنا حسام الدين',
      studentId: '20210382',
      avatarInitial: 'هه',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات العزبي',
      branchName: 'فرع التجمع (الداون تاون)',
      governorate: 'القاهرة الجديدة',
      supervisorName: 'د. سارة خيري',
      startDate: '2026-01-10',
      loggedHours: 275,
      targetHours: 300,
      status: 'active',
      rating: 4.8,
      operationsCount: 92,
      prescriptions: [],
      medicationPlans: [],
      ordersFulfilled: [],
      attendanceLogs: []
    },
    {
      id: 'int-111',
      name: 'محمد سامح رضوان',
      studentId: '20210174',
      avatarInitial: 'مس',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات رشدي',
      branchName: 'فرع الدقي (ميدان المساحة)',
      governorate: 'الجيزة',
      supervisorName: 'د. هاني يوسف',
      startDate: '2026-01-18',
      loggedHours: 195,
      targetHours: 300,
      status: 'active',
      rating: 4.7,
      operationsCount: 65,
      prescriptions: [],
      medicationPlans: [],
      ordersFulfilled: [],
      attendanceLogs: []
    },
    {
      id: 'int-112',
      name: 'دينا عادل فهمي',
      studentId: '20210291',
      avatarInitial: 'دع',
      academicYear: 'امتياز (فارم دي)',
      pharmacyChain: 'صيدليات مصر',
      branchName: 'فرع شبرا (شارع خلوصي)',
      governorate: 'القاهرة',
      supervisorName: 'د. سمير غانم',
      startDate: '2025-12-10',
      loggedHours: 300,
      targetHours: 300,
      status: 'completed',
      rating: 4.9,
      operationsCount: 125,
      prescriptions: [],
      medicationPlans: [],
      ordersFulfilled: [],
      attendanceLogs: []
    }
  ],

  liveFeed: [
    {
      id: 'lf-1',
      studentName: 'أحمد مصطفى محمود',
      pharmacy: 'العزبي - المعادي',
      action: 'فحص وتدقيق روشتة علاجية جديدة',
      detail: 'مراجعة جرعة Concor و Januvia وتدوين توصية طبية',
      time: 'منذ دقيقتين',
      type: 'rx'
    },
    {
      id: 'lf-2',
      studentName: 'مريم حسام الشريف',
      pharmacy: 'سيف - الدقي',
      action: 'صياغة خطة أدوية لمريضة حامل',
      detail: 'تنظيم مواعيد الكالسيوم والحديد وفصل الجرعات',
      time: 'منذ 8 دقائق',
      type: 'plan'
    },
    {
      id: 'lf-3',
      studentName: 'سلمى وليد عثمان',
      pharmacy: 'العزبي - المهندسين',
      action: 'صرف وتجهيز طلبية أدوية',
      detail: 'صرف 4 أصناف دوائية مع التأكد من تاريخ الصلاحية',
      time: 'منذ 14 دقيقة',
      type: 'order'
    },
    {
      id: 'lf-4',
      studentName: 'هنا حسام الدين',
      pharmacy: 'العزبي - التجمع',
      action: 'تسجيل مناوبة تدريبية (6 ساعات)',
      detail: 'تم توثيق المناوبة واعتمادها بواسطة د. سارة خيري',
      time: 'منذ 25 دقيقة',
      type: 'rx'
    },
    {
      id: 'lf-5',
      studentName: 'زياد عمرو البشري',
      pharmacy: 'سيف - الشيخ زايد',
      action: 'فحص روشتة مضاد حيوي للأطفال',
      detail: 'حساب جرعة Amoxicillin بدقة طبقاً لوزن الطفل (14 كجم)',
      time: 'منذ 40 دقيقة',
      type: 'rx'
    }
  ]
};
