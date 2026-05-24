/**
 * api.js - OpenAI API integration for the Arabic text rephrasing tool
 */

var SiyagaAPI = (function () {
  'use strict';

  var STORAGE_KEY = 'openai_api_key';
  var API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  var MODEL = 'gpt-4o-mini';

  // Non-blocking logger
  var logger = {
    info: function (msg, meta) {
      queueMicrotask(function () {
        console.log('[INFO] ' + msg, meta || '');
      });
    },
    warn: function (msg, meta) {
      queueMicrotask(function () {
        console.warn('[WARN] ' + msg, meta || '');
      });
    },
    error: function (msg, meta) {
      queueMicrotask(function () {
        console.error('[ERROR] ' + msg, meta || '');
      });
    },
  };

  /**
   * Save API key to localStorage
   * @param {string} key - The OpenAI API key
   */
  function saveApiKey(key) {
    try {
      localStorage.setItem(STORAGE_KEY, key);
      logger.info('API key saved successfully');
    } catch (e) {
      logger.error('Failed to save API key', e);
    }
  }

  /**
   * Retrieve API key from localStorage
   * @returns {string|null} The stored API key or null
   */
  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      logger.error('Failed to retrieve API key', e);
      return null;
    }
  }

  /**
   * Call OpenAI Chat Completions API to rephrase text
   * @param {string} text - The text to rephrase
   * @param {string} systemPrompt - The system prompt with instructions
   * @returns {Promise<{success: boolean, text?: string, error?: string}>}
   */
  async function rephrase(text, systemPrompt) {
    var apiKey = getApiKey();

    if (!apiKey) {
      logger.warn('No API key found');
      return { success: false, error: 'لم يتم العثور على مفتاح API. يرجى ادخال المفتاح اولا.' };
    }

    if (!text || text.trim().length === 0) {
      logger.warn('Empty text provided');
      return { success: false, error: 'يرجى ادخال النص المراد اعادة صياغته.' };
    }

    logger.info('Starting rephrase request', { textLength: text.length });

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 60000);

    try {
      var response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        var errorData = await response.json().catch(function () {
          return {};
        });
        var errorMessage = (errorData.error && errorData.error.message) || 'خطأ في الاتصال بالخادم';
        logger.error('API request failed', { status: response.status, error: errorMessage });
        return { success: false, error: errorMessage };
      }

      var data = await response.json();

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        var resultText = data.choices[0].message.content;
        logger.info('Rephrase completed successfully', { resultLength: resultText.length });
        return { success: true, text: resultText };
      }

      logger.error('Unexpected API response format', data);
      return { success: false, error: 'تنسيق استجابة غير متوقع من الخادم.' };
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        logger.error('Request timed out after 60 seconds');
        return { success: false, error: 'انتهت مهلة الطلب. يرجى المحاولة مرة اخرى او تقليل حجم النص.' };
      }
      logger.error('Network error during rephrase', e);
      return { success: false, error: 'خطأ في الشبكة. يرجى التحقق من اتصال الانترنت.' };
    }
  }

  return {
    saveApiKey: saveApiKey,
    getApiKey: getApiKey,
    rephrase: rephrase,
    logger: logger,
  };
})();
