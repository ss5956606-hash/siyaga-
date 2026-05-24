/**
 * prompts.js - System prompts for the Arabic text rephrasing tool
 * Defines prompts for 3 styles and 3 levels of rephrasing
 */

var SiyagaPrompts = (function () {
  'use strict';

  // Style-specific system prompts
  var styles = {
    academic: {
      id: 'academic',
      label: 'اكاديمي',
      prompt:
        'انت متخصص في اعادة صياغة النصوص بأسلوب اكاديمي علمي رصين. ' +
        'استخدم مصطلحات علمية دقيقة وتراكيب لغوية رسمية. ' +
        'حافظ على الموضوعية والدقة في التعبير. ' +
        'تجنب العبارات العامية والتكرار غير الضروري.',
    },
    journalistic: {
      id: 'journalistic',
      label: 'صحفي',
      prompt:
        'انت متخصص في اعادة صياغة النصوص بأسلوب صحفي مهني. ' +
        'استخدم لغة واضحة ومباشرة تجذب القارئ. ' +
        'اعتمد على الجمل القصيرة والفقرات المتماسكة. ' +
        'قدم المعلومات بترتيب منطقي يبدأ بالأهم.',
    },
    conversational: {
      id: 'conversational',
      label: 'محادثة',
      prompt:
        'انت متخصص في اعادة صياغة النصوص بأسلوب حواري سلس وطبيعي. ' +
        'استخدم لغة بسيطة وقريبة من القارئ. ' +
        'اجعل النص يبدو كأنه حديث ودي ومفهوم. ' +
        'تجنب التعقيد والمصطلحات الصعبة مع الحفاظ على المعنى.',
    },
  };

  // Level-specific modifiers
  var levels = {
    light: {
      id: 'light',
      label: 'خفيف',
      modifier:
        'اعد صياغة النص بشكل خفيف مع الحفاظ على البنية الاصلية قدر الامكان. ' +
        'غير بعض الكلمات والتعبيرات فقط مع ابقاء الهيكل العام كما هو.',
    },
    medium: {
      id: 'medium',
      label: 'متوسط',
      modifier:
        'اعد صياغة النص بشكل متوسط. ' +
        'غير التراكيب اللغوية وبعض ترتيب الافكار مع الحفاظ على المعنى الاصلي. ' +
        'اعد بناء الجمل بطريقة مختلفة.',
    },
    deep: {
      id: 'deep',
      label: 'عميق',
      modifier:
        'اعد صياغة النص بشكل عميق وشامل. ' +
        'اعد بناء النص بالكامل مع الحفاظ على الافكار الرئيسية. ' +
        'غير الهيكل والتراكيب والمفردات بشكل جذري.',
    },
  };

  // Numbering modifier
  var numberingModifier =
    'رقم الفقرات في النص الناتج بشكل تسلسلي (1، 2، 3...) في بداية كل فقرة.';

  // Sources modifier
  var sourcesModifier =
    'في نهاية النص، اقترح 3 الى 5 مراجع او مصادر علمية ذات صلة بموضوع النص. ' +
    'اكتب المصادر بتنسيق واضح مع ذكر اسم المؤلف وعنوان العمل وسنة النشر ان امكن.';

  /**
   * Build a complete system prompt based on selected options
   * @param {string} style - Style key: academic, journalistic, conversational
   * @param {string} level - Level key: light, medium, deep
   * @param {boolean} withNumbering - Whether to add paragraph numbering
   * @param {boolean} withSources - Whether to suggest references
   * @returns {string} The complete system prompt
   */
  function buildPrompt(style, level, withNumbering, withSources) {
    var parts = [];

    // Add base style prompt
    if (styles[style]) {
      parts.push(styles[style].prompt);
    }

    // Add level modifier
    if (levels[level]) {
      parts.push(levels[level].modifier);
    }

    // Add numbering modifier if enabled
    if (withNumbering) {
      parts.push(numberingModifier);
    }

    // Add sources modifier if enabled
    if (withSources) {
      parts.push(sourcesModifier);
    }

    // General instruction
    parts.push('اعد صياغة النص التالي بناء على التعليمات اعلاه. قدم النص المعاد صياغته فقط بدون اي مقدمات او تعليقات اضافية.');

    return parts.join('\n\n');
  }

  return {
    styles: styles,
    levels: levels,
    numberingModifier: numberingModifier,
    sourcesModifier: sourcesModifier,
    buildPrompt: buildPrompt,
  };
})();
