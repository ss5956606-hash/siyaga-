/**
 * app.js - Main application logic for the Arabic text rephrasing tool
 */

(function () {
  'use strict';

  // DOM element references
  var elements = {};

  /**
   * Initialize DOM references
   */
  function initElements() {
    elements.apiKeyInput = document.getElementById('api-key-input');
    elements.apiKeySaveBtn = document.getElementById('api-key-save-btn');
    elements.apiKeyToggleBtn = document.getElementById('api-key-toggle-btn');
    elements.apiKeyStatus = document.getElementById('api-key-status');

    elements.inputText = document.getElementById('input-text');
    elements.wordCount = document.getElementById('word-count');

    elements.styleSelect = document.getElementById('style-select');
    elements.levelSelect = document.getElementById('level-select');
    elements.numberingToggle = document.getElementById('numbering-toggle');
    elements.sourcesToggle = document.getElementById('sources-toggle');

    elements.rephraseBtn = document.getElementById('rephrase-btn');
    elements.rephraseBtnText = document.getElementById('rephrase-btn-text');
    elements.rephraseBtnSpinner = document.getElementById('rephrase-btn-spinner');

    elements.resultsSection = document.getElementById('results-section');
    elements.resultText = document.getElementById('result-text');
    elements.changePercentage = document.getElementById('change-percentage');
    elements.sourcesSection = document.getElementById('sources-section');
    elements.copyBtn = document.getElementById('copy-btn');
    elements.errorMessage = document.getElementById('error-message');
  }

  /**
   * Update word count display
   */
  function updateWordCount() {
    var text = elements.inputText.value.trim();
    var count = text.length === 0 ? 0 : text.split(/\s+/).length;
    elements.wordCount.textContent = count + ' كلمة';
  }

  /**
   * Load saved API key on page load
   */
  function loadApiKey() {
    var savedKey = SiyagaAPI.getApiKey();
    if (savedKey) {
      elements.apiKeyInput.value = savedKey;
      elements.apiKeyStatus.textContent = 'تم حفظ المفتاح';
      elements.apiKeyStatus.classList.remove('hidden');
    }
  }

  /**
   * Save API key to localStorage
   */
  function handleSaveApiKey() {
    var key = elements.apiKeyInput.value.trim();
    if (key) {
      SiyagaAPI.saveApiKey(key);
      elements.apiKeyStatus.textContent = 'تم حفظ المفتاح بنجاح';
      elements.apiKeyStatus.classList.remove('hidden');
      elements.apiKeyStatus.classList.add('text-green-500');
      elements.apiKeyStatus.classList.remove('text-red-500');
    } else {
      elements.apiKeyStatus.textContent = 'يرجى ادخال مفتاح صالح';
      elements.apiKeyStatus.classList.remove('hidden');
      elements.apiKeyStatus.classList.add('text-red-500');
      elements.apiKeyStatus.classList.remove('text-green-500');
    }
  }

  /**
   * Toggle API key visibility
   */
  function handleToggleApiKey() {
    var input = elements.apiKeyInput;
    if (input.type === 'password') {
      input.type = 'text';
      elements.apiKeyToggleBtn.textContent = 'اخفاء';
    } else {
      input.type = 'password';
      elements.apiKeyToggleBtn.textContent = 'اظهار';
    }
  }

  /**
   * Set loading state on rephrase button
   * @param {boolean} loading
   */
  function setLoading(loading) {
    if (loading) {
      elements.rephraseBtn.disabled = true;
      elements.rephraseBtnText.classList.add('hidden');
      elements.rephraseBtnSpinner.classList.remove('hidden');
    } else {
      elements.rephraseBtn.disabled = false;
      elements.rephraseBtnText.classList.remove('hidden');
      elements.rephraseBtnSpinner.classList.add('hidden');
    }
  }

  /**
   * Calculate change percentage between original and rephrased text
   * Uses a simple word-level diff approximation
   * @param {string} original
   * @param {string} rephrased
   * @returns {number} Percentage of change (0-100)
   */
  function calculateChangePercentage(original, rephrased) {
    var originalWords = original.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
    var rephrasedWords = rephrased.trim().split(/\s+/).filter(function (w) { return w.length > 0; });

    if (originalWords.length === 0) return 100;

    var originalSet = {};
    originalWords.forEach(function (word) {
      originalSet[word] = (originalSet[word] || 0) + 1;
    });

    var matchCount = 0;
    rephrasedWords.forEach(function (word) {
      if (originalSet[word] && originalSet[word] > 0) {
        matchCount++;
        originalSet[word]--;
      }
    });

    var maxLen = Math.max(originalWords.length, rephrasedWords.length);
    var changeRatio = 1 - (matchCount / maxLen);
    return Math.round(changeRatio * 100);
  }

  /**
   * Show error message
   * @param {string} message
   */
  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');
  }

  /**
   * Hide error message
   */
  function hideError() {
    elements.errorMessage.classList.add('hidden');
  }

  /**
   * Display rephrase results
   * @param {string} originalText
   * @param {string} rephrasedText
   * @param {boolean} showSources
   */
  function displayResults(originalText, rephrasedText, showSources) {
    elements.resultText.textContent = rephrasedText;

    var percentage = calculateChangePercentage(originalText, rephrasedText);
    elements.changePercentage.textContent = percentage + '% تغيير';

    // Show or hide sources section based on toggle
    if (showSources) {
      elements.sourcesSection.classList.remove('hidden');
    } else {
      elements.sourcesSection.classList.add('hidden');
    }

    elements.resultsSection.classList.remove('hidden');
    elements.resultsSection.classList.add('animate-slide-up');
  }

  /**
   * Handle rephrase button click
   */
  async function handleRephrase() {
    hideError();

    var text = elements.inputText.value.trim();
    if (!text) {
      showError('يرجى ادخال النص المراد اعادة صياغته.');
      return;
    }

    var style = elements.styleSelect.value;
    var level = elements.levelSelect.value;
    var withNumbering = elements.numberingToggle.checked;
    var withSources = elements.sourcesToggle.checked;

    var systemPrompt = SiyagaPrompts.buildPrompt(style, level, withNumbering, withSources);

    setLoading(true);
    elements.resultsSection.classList.add('hidden');

    var result = await SiyagaAPI.rephrase(text, systemPrompt);

    setLoading(false);

    if (result.success) {
      displayResults(text, result.text, withSources);
    } else {
      showError(result.error);
    }
  }

  /**
   * Handle copy button click
   */
  function handleCopy() {
    var text = elements.resultText.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(function () {
      var originalText = elements.copyBtn.textContent;
      elements.copyBtn.textContent = 'تم النسخ!';
      setTimeout(function () {
        elements.copyBtn.textContent = originalText;
      }, 2000);
    }).catch(function () {
      // Fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      var originalText = elements.copyBtn.textContent;
      elements.copyBtn.textContent = 'تم النسخ!';
      setTimeout(function () {
        elements.copyBtn.textContent = originalText;
      }, 2000);
    });
  }

  /**
   * Attach all event listeners
   */
  function attachEventListeners() {
    elements.inputText.addEventListener('input', updateWordCount);
    elements.apiKeySaveBtn.addEventListener('click', handleSaveApiKey);
    elements.apiKeyToggleBtn.addEventListener('click', handleToggleApiKey);
    elements.rephraseBtn.addEventListener('click', handleRephrase);
    elements.copyBtn.addEventListener('click', handleCopy);
  }

  /**
   * Initialize the application
   */
  function init() {
    initElements();
    loadApiKey();
    updateWordCount();
    attachEventListeners();
  }

  // Run on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();
