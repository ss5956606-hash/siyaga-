/**
 * api.js - Multi-provider AI API integration for the Arabic text rephrasing tool
 * Supports: Gemini 2.0 Flash, Gemini 1.5 Flash, Cohere, OpenRouter
 */

var SiyagaAPI = (function () {
  'use strict';

  var PROVIDER_KEY = 'selected_provider';
  var API_KEYS = {
    gemini_2_flash: 'gemini_api_key',
    gemini_1_5_flash: 'gemini_api_key',
    cohere: 'cohere_api_key',
    openrouter: 'openrouter_api_key',
  };

  var PROVIDERS = {
    gemini_2_flash: {
      name: 'Gemini 2.0 Flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      keyUrl: 'https://aistudio.google.com/apikey',
      storageKey: 'gemini_api_key',
    },
    gemini_1_5_flash: {
      name: 'Gemini 1.5 Flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      keyUrl: 'https://aistudio.google.com/apikey',
      storageKey: 'gemini_api_key',
    },
    cohere: {
      name: 'Cohere',
      endpoint: 'https://api.cohere.com/v2/chat',
      keyUrl: 'https://dashboard.cohere.com/api-keys',
      storageKey: 'cohere_api_key',
    },
    openrouter: {
      name: 'OpenRouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      keyUrl: 'https://openrouter.ai/keys',
      storageKey: 'openrouter_api_key',
    },
  };

  var DEFAULT_PROVIDER = 'gemini_1_5_flash';

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
   * Get the currently selected provider ID
   * @returns {string} Provider ID
   */
  function getSelectedProvider() {
    try {
      return localStorage.getItem(PROVIDER_KEY) || DEFAULT_PROVIDER;
    } catch (e) {
      return DEFAULT_PROVIDER;
    }
  }

  /**
   * Set the selected provider
   * @param {string} providerId
   */
  function setSelectedProvider(providerId) {
    try {
      localStorage.setItem(PROVIDER_KEY, providerId);
      logger.info('Provider set to: ' + providerId);
    } catch (e) {
      logger.error('Failed to save provider selection', e);
    }
  }

  /**
   * Save API key for the current provider to localStorage
   * @param {string} key - The API key
   */
  function saveApiKey(key) {
    var providerId = getSelectedProvider();
    var storageKey = PROVIDERS[providerId].storageKey;
    try {
      localStorage.setItem(storageKey, key);
      logger.info('API key saved for provider: ' + providerId);
    } catch (e) {
      logger.error('Failed to save API key', e);
    }
  }

  /**
   * Retrieve API key for the current provider from localStorage
   * @returns {string|null} The stored API key or null
   */
  function getApiKey() {
    var providerId = getSelectedProvider();
    var storageKey = PROVIDERS[providerId].storageKey;
    try {
      return localStorage.getItem(storageKey);
    } catch (e) {
      logger.error('Failed to retrieve API key', e);
      return null;
    }
  }

  /**
   * Get API key for a specific provider
   * @param {string} providerId
   * @returns {string|null}
   */
  function getApiKeyForProvider(providerId) {
    var storageKey = PROVIDERS[providerId].storageKey;
    try {
      return localStorage.getItem(storageKey);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get provider configuration
   * @returns {object} The providers config object
   */
  function getProviders() {
    return PROVIDERS;
  }

  /**
   * Build request for Gemini providers
   */
  function buildGeminiRequest(provider, apiKey, text, systemPrompt) {
    return {
      url: provider.endpoint + '?key=' + apiKey,
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: text }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      },
      parseResponse: function (data) {
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
          return data.candidates[0].content.parts[0].text;
        }
        return null;
      },
    };
  }

  /**
   * Build request for Cohere provider
   */
  function buildCohereRequest(provider, apiKey, text, systemPrompt) {
    return {
      url: provider.endpoint,
      options: {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
        }),
      },
      parseResponse: function (data) {
        if (data.message && data.message.content && data.message.content.length > 0) {
          return data.message.content[0].text;
        }
        return null;
      },
    };
  }

  /**
   * Build request for OpenRouter provider
   */
  function buildOpenRouterRequest(provider, apiKey, text, systemPrompt) {
    return {
      url: provider.endpoint,
      options: {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
        }),
      },
      parseResponse: function (data) {
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        return null;
      },
    };
  }

  /**
   * Call the selected AI provider to rephrase text
   * @param {string} text - The text to rephrase
   * @param {string} systemPrompt - The system prompt with instructions
   * @returns {Promise<{success: boolean, text?: string, error?: string}>}
   */
  async function rephrase(text, systemPrompt) {
    var providerId = getSelectedProvider();
    var provider = PROVIDERS[providerId];
    var apiKey = getApiKey();

    if (!apiKey) {
      logger.warn('No API key found for provider: ' + providerId);
      return { success: false, error: 'لم يتم العثور على مفتاح API. يرجى ادخال المفتاح اولا.' };
    }

    if (!text || text.trim().length === 0) {
      logger.warn('Empty text provided');
      return { success: false, error: 'يرجى ادخال النص المراد اعادة صياغته.' };
    }

    logger.info('Starting rephrase request', { provider: providerId, textLength: text.length });

    var request;
    if (providerId === 'gemini_2_flash' || providerId === 'gemini_1_5_flash') {
      request = buildGeminiRequest(provider, apiKey, text, systemPrompt);
    } else if (providerId === 'cohere') {
      request = buildCohereRequest(provider, apiKey, text, systemPrompt);
    } else if (providerId === 'openrouter') {
      request = buildOpenRouterRequest(provider, apiKey, text, systemPrompt);
    } else {
      return { success: false, error: 'مزود غير معروف.' };
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 60000);

    try {
      request.options.signal = controller.signal;
      var response = await fetch(request.url, request.options);

      clearTimeout(timeoutId);

      if (!response.ok) {
        var errorData = await response.json().catch(function () {
          return {};
        });
        var errorMessage = (errorData.error && errorData.error.message) || errorData.message || 'خطأ في الاتصال بالخادم';
        logger.error('API request failed', { status: response.status, error: errorMessage });
        return { success: false, error: errorMessage };
      }

      var data = await response.json();
      var resultText = request.parseResponse(data);

      if (resultText) {
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
    getApiKeyForProvider: getApiKeyForProvider,
    getSelectedProvider: getSelectedProvider,
    setSelectedProvider: setSelectedProvider,
    getProviders: getProviders,
    rephrase: rephrase,
    logger: logger,
  };
})();
