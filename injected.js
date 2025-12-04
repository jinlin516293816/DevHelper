// injected.js - 注入到页面上下文的脚本，用于拦截网络请求

// 保存原始方法的引用
window.__devHelperOriginalFetch = window.__devHelperOriginalFetch || window.fetch;
window.__devHelperOriginalXHROpen = window.__devHelperOriginalXHROpen || XMLHttpRequest.prototype.open;
window.__devHelperOriginalXHRSend = window.__devHelperOriginalXHRSend || XMLHttpRequest.prototype.send;

// Mock规则存储
let mockRules = [];
// 请求前拦截器存储
let requestInterceptors = [];
// 请求参数拦截器存储
let requestParamsInterceptor = {
  enabled: false,
  code: ''
};
// Mock开关状态，默认值为true，会被content script注入后立即更新
let isMockEnabled = true;

// 网址限制相关
let urlRestrictionEnabled = false;
let allowedUrls = [];

// CSS注入相关
let injectedStyle = null;
let injectedCssContent = '';

// JS注入相关
let injectedScript = null;
let injectedJsContent = '';

// 检查URL是否允许
function isUrlAllowed(url) {
  // 如果没有启用URL限制，则允许所有URL
  if (!urlRestrictionEnabled) {
    return true;
  }
  
  // 如果没有配置允许的URL，则允许所有URL
  if (!allowedUrls || allowedUrls.length === 0) {
    return true;
  }
  
  // 检查URL是否匹配任何允许的URL
  for (const allowedUrl of allowedUrls) {
    if (url.includes(allowedUrl.trim())) {
      return true;
    }
  }
  
  return false;
}

// 从content script接收消息
window.addEventListener('message', (event) => {
  // 确保消息来自我们的扩展
  if (event.source !== window || !event.data || !event.data.devHelper) {
    return;
  }
  
  const data = event.data;
  
  if (data.action === 'updateMockRules') {
    mockRules = data.rules || [];
  } else if (data.action === 'updateRequestInterceptors') {
    requestInterceptors = data.interceptors || [];
  } else if (data.action === 'updateRequestParamsInterceptor') {
    // 更新请求参数拦截器
    requestParamsInterceptor = {
      enabled: true,
      code: data.code || ''
    };
  } else if (data.action === 'disableRequestParamsInterceptor') {
    // 禁用请求参数拦截器
    requestParamsInterceptor = {
      enabled: false,
      code: ''
    };
  } else if (data.action === 'toggleMock') {
    isMockEnabled = data.enabled;
  } else if (data.action === 'updateUrlRestriction') {
    urlRestrictionEnabled = data.enabled;
    allowedUrls = data.allowedUrls || [];
  } else if (data.action === 'injectCss') {
    // 注入CSS
    injectCss(data.css);
  } else if (data.action === 'removeCss') {
    // 移除CSS
    removeCss();
  } else if (data.action === 'injectJs') {
    // 注入JS
    injectJs(data.js);
  } else if (data.action === 'removeJs') {
    // 移除JS
    removeJs();
  }
});

// 注入CSS
function injectCss(css) {
  if (!css) return;
  
  // 如果已有样式，先移除
  if (injectedStyle) {
    removeCss();
  }
  
  // 创建style标签
  injectedStyle = document.createElement('style');
  injectedStyle.type = 'text/css';
  injectedStyle.textContent = css;
  injectedStyle.id = 'devHelperInjectedCss';
  
  // 注入到head
  (document.head || document.documentElement).appendChild(injectedStyle);
  
  injectedCssContent = css;
}

// 移除CSS
function removeCss() {
  if (injectedStyle) {
    injectedStyle.remove();
    injectedStyle = null;
    injectedCssContent = '';
  }
}

// 注入JS
function injectJs(js) {
  if (!js) return;
  
  // 如果已有脚本，先移除
  if (injectedScript) {
    removeJs();
  }
  
  // 创建script标签
  injectedScript = document.createElement('script');
  injectedScript.type = 'text/javascript';
  injectedScript.textContent = js;
  injectedScript.id = 'devHelperInjectedJs';
  
  // 注入到head
  (document.head || document.documentElement).appendChild(injectedScript);
  
  injectedJsContent = js;
}

// 移除JS
function removeJs() {
  if (injectedScript) {
    injectedScript.remove();
    injectedScript = null;
    injectedJsContent = '';
  }
}

// 查找匹配的Mock规则
function findMatchingRule(url, method) {
  // 如果Mock功能未启用，直接返回null
  if (!isMockEnabled || !url) {
    return null;
  }
  
  // 只拦截后端请求，排除部分常见的前端资源请求（保留CSS和JS以便支持拦截）
  const frontEndExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.eot'];
  const urlLower = url.toLowerCase();
  
  // 检查是否为前端资源请求
  for (const ext of frontEndExtensions) {
    if (urlLower.endsWith(ext)) {
      return null; // 跳过前端资源请求
    }
  }
  
  let matchedRule = null;
  
  // 确保mockRules是数组
  const rulesList = Array.isArray(mockRules) ? mockRules : [];
  
  // 遍历所有规则，记录匹配结果
  for (let i = 0; i < rulesList.length; i++) {
    const rule = rulesList[i];
    
    // 检查规则是否存在且启用
    if (!rule || !rule.enabled) {
      continue;
    }
    
    // 检查HTTP方法
    if (rule.method && rule.method.toUpperCase() !== method.toUpperCase() && rule.method !== 'ALL') {
      continue;
    }
    
    // 检查URL匹配
    const urlPattern = rule.urlPattern || rule.url;
    if (!urlPattern) {
      continue;
    }
    
    // 根据匹配类型进行URL匹配
    const patternType = rule.urlPatternType || 'contains';
    let isMatch = false;
    
    try {
      switch (patternType) {
        case 'contains':
          isMatch = url.includes(urlPattern);
          break;
        case 'exact':
          isMatch = url === urlPattern;
          break;
        case 'startsWith':
          isMatch = url.startsWith(urlPattern);
          break;
        case 'endsWith':
          isMatch = url.endsWith(urlPattern);
          break;
        case 'regex':
          try {
            const regex = new RegExp(urlPattern);
            isMatch = regex.test(url);
          } catch (e) {
            console.error('[DevHelper] 正则表达式错误:', rule.urlPattern, e);
            isMatch = false;
          }
          break;
        default:
          isMatch = url.includes(urlPattern);
      }
      
      if (isMatch) {
        matchedRule = rule;
        break;
      }
    } catch (e) {
      console.error('[DevHelper] 规则匹配错误:', rule.name || rule.id, e);
    }
  }
  
  // 如果找到了匹配的规则，记录日志
  if (matchedRule) {
    console.log(`[DevHelper] 匹配到拦截规则: ${matchedRule.name} (${matchedRule.id}) - ${method} ${url}`);
  }
  
  return matchedRule;
}

// 创建Mock响应
function createMockResponse(rule) {
  // 处理响应延迟
  if (rule.responseTime && rule.responseTime > 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(createResponse(rule));
      }, rule.responseTime);
    });
  }
  
  return Promise.resolve(createResponse(rule));
}

// 创建具体响应
function createResponse(rule) {
  // 处理响应内容
  let response = rule.response;
  
  // 如果是函数，调用它获取响应
  if (typeof response === 'function') {
    try {
      response = response();
    } catch (e) {
      response = { error: '响应函数执行失败' };
    }
  }
  
  // 构建fetch响应，处理默认响应头
  const headers = new Headers(rule.headers || {});
  
  // 检查是否需要使用默认响应头
  const shouldUseDefaultHeaders = rule.useDefaultHeaders || Object.keys(rule.headers || {}).length === 0;
  
  // 添加默认响应头
  if (shouldUseDefaultHeaders) {
    if (!headers.has('Content-Type') && !headers.has('content-type')) {
      // Content-Type将在后续自动检测并设置
    }
    if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    if (!headers.has('Pragma')) {
      headers.set('Pragma', 'no-cache');
    }
    if (!headers.has('Expires')) {
      headers.set('Expires', '0');
    }
  }
  
  // 确定内容类型
  let contentType = headers.get('content-type');
  let responseText = response;
  
  // 如果是对象，默认使用JSON格式
  if (typeof response === 'object') {
    responseText = JSON.stringify(response);
    if (!contentType) {
      contentType = 'application/json';
    }
  } 
  // 如果是字符串，根据内容或URL自动检测类型
  else if (typeof response === 'string') {
    // 如果没有指定Content-Type，根据内容自动检测
    if (!contentType) {
      // 检测CSS
      if (response.trim().startsWith('/*') || response.trim().startsWith('body') || 
          response.trim().startsWith('.') || response.trim().startsWith('#')) {
        contentType = 'text/css';
      }
      // 检测JavaScript
      else if (response.trim().startsWith('//') || response.trim().startsWith('/*') ||
               response.trim().startsWith('function') || response.trim().startsWith('const') ||
               response.trim().startsWith('let') || response.trim().startsWith('var') ||
               response.trim().startsWith('if') || response.trim().startsWith('for') ||
               response.trim().startsWith('while') || response.trim().startsWith('return')) {
        contentType = 'application/javascript';
      }
      // 检测HTML
      else if (response.trim().startsWith('<')) {
        contentType = 'text/html';
      }
      // 检测JSON字符串
      else {
        try {
          JSON.parse(response);
          contentType = 'application/json';
        } catch (e) {
          // 默认文本类型
          contentType = 'text/plain';
        }
      }
    }
  }
  
  // 设置Content-Type头
  headers.set('content-type', contentType);
  
  return new Response(responseText, {
    status: rule.statusCode || 200,
    statusText: rule.statusText || 'OK',
    headers: headers
  });
}

// 记录所有请求的函数
function recordRequest(url, method, requestData, isMocked = false, mockRule = null) {
  // 发送请求记录事件到content script
  window.postMessage({
    devHelper: true,
    action: 'requestRecorded',
    data: {
      url: url,
      method: method,
      requestData: requestData,
      isMocked: isMocked,
      mockRuleId: mockRule ? mockRule.id : null,
      mockRuleName: mockRule ? mockRule.name : null,
      timestamp: Date.now()
    }
  }, '*');
}

// 执行匹配的请求前拦截器
function executeRequestInterceptors(requestUrl, method, options) {
  let modifiedUrl = requestUrl;
  let modifiedOptions = { ...options };
  
  // 确保requestInterceptors是数组
  const interceptorsList = Array.isArray(requestInterceptors) ? requestInterceptors : [];
  
  // 遍历所有拦截器
  interceptorsList.forEach(interceptor => {
    // 确保拦截器对象存在且启用
    if (interceptor && interceptor.enabled) {
      try {
        // 检查URL是否匹配拦截器的URL模式
        const regex = new RegExp(interceptor.urlPattern);
        if (regex.test(modifiedUrl)) {
    
          
          // 创建请求上下文
          const request = {
            url: modifiedUrl,
            method: method,
            headers: modifiedOptions.headers || {},
            body: modifiedOptions.body
          };
          
          // 执行拦截器代码，传入request对象作为参数
          // 使用Function构造函数代替eval以提高安全性
          const interceptorFunc = new Function('request', interceptor.code);
          interceptorFunc(request);
          
          // 更新URL和选项
          modifiedUrl = request.url;
          modifiedOptions.headers = request.headers;
          modifiedOptions.body = request.body;
        }
      } catch (error) {
        // 输出错误到控制台，方便调试
        console.error('[DevHelper] 请求前拦截器执行出错:', error);
      }
    }
  });
  
  return { url: modifiedUrl, options: modifiedOptions };
}

// 执行全局请求参数拦截器
function executeRequestParamsInterceptor(requestUrl, method, options) {
  let modifiedUrl = requestUrl;
  let modifiedOptions = { ...options };
  
  // 确保requestParamsInterceptor是对象
  const paramsInterceptor = typeof requestParamsInterceptor === 'object' && requestParamsInterceptor !== null ? requestParamsInterceptor : { enabled: false, code: '' };
  
  // 检查请求参数拦截器是否启用
  if (paramsInterceptor.enabled && paramsInterceptor.code) {
    try {
      // 创建请求上下文
      const request = {
        url: modifiedUrl,
        method: method,
        headers: modifiedOptions.headers || {},
        body: modifiedOptions.body
      };
      
      // 使用Function构造函数代替eval以提高安全性
      // 创建一个包装函数，将request作为参数传递
      const fullCode = `
        ${paramsInterceptor.code}
        // 如果定义了interceptParams函数，则调用它
        if (typeof interceptParams === 'function') {
          return interceptParams(request);
        }
        return request;
      `;
      
      // 创建拦截器函数并执行
      const interceptorFunc = new Function('request', fullCode);
      const result = interceptorFunc(request);
      
      // 更新URL和选项
      modifiedUrl = result.url;
      modifiedOptions.headers = result.headers;
      modifiedOptions.body = result.body;
      
    } catch (error) {
      // 输出错误到控制台，方便调试
      console.error('[DevHelper] 请求参数拦截器执行出错:', error);
    }
  }
  
  return { url: modifiedUrl, options: modifiedOptions };
}

// 重写fetch方法
Object.defineProperty(window, 'fetch', {
  configurable: true,
  writable: true,
  value: function(url, options = {}) {
    // 确保url是字符串
    const originalUrl = typeof url === 'string' ? url : (url instanceof Request ? url.url : String(url));
    const method = (options.method || (url instanceof Request ? url.method : 'GET')).toUpperCase();
    
    // 检查并修复Mixed Content问题
    let fixedUrl = originalUrl;
    if (window.location.protocol === 'https:' && originalUrl.startsWith('http://')) {
      console.warn('[DevHelper] 检测到Mixed Content请求，尝试升级到HTTPS:', originalUrl);
      fixedUrl = originalUrl.replace('http://', 'https://');
    }
    
    // 检查URL是否允许（无论Mock是否启用，都需要检查URL限制）
    const urlAllowed = isUrlAllowed(fixedUrl);
    
    // 如果Mock功能未启用，但URL允许，仍然执行参数拦截器
    if (!isMockEnabled) {
      // 执行请求前拦截器和参数拦截器
      let modifiedUrl = fixedUrl;
      let modifiedOptions = options;
      
      // 只有当URL允许时才执行拦截器
      if (urlAllowed) {
        const interceptResult = executeRequestInterceptors(modifiedUrl, method, modifiedOptions);
        modifiedUrl = interceptResult.url;
        modifiedOptions = interceptResult.options;
        
        const paramsResult = executeRequestParamsInterceptor(modifiedUrl, method, modifiedOptions);
        modifiedUrl = paramsResult.url;
        modifiedOptions = paramsResult.options;
      }
      
      // 如果URL被修复或修改，使用新的URL和选项
      if (modifiedUrl !== originalUrl) {
        if (url instanceof Request) {
          // 创建一个新的Request对象，保持所有属性
          const newRequest = new Request(modifiedUrl, {
            method: url.method,
            headers: url.headers,
            body: modifiedOptions.body,
            mode: url.mode,
            credentials: url.credentials,
            cache: url.cache,
            redirect: url.redirect,
            referrer: url.referrer,
            referrerPolicy: url.referrerPolicy,
            integrity: url.integrity,
            keepalive: url.keepalive
          });
          return window.__devHelperOriginalFetch.call(this, newRequest);
        } else {
          return window.__devHelperOriginalFetch.call(this, modifiedUrl, modifiedOptions);
        }
      }
      // 如果url是Request对象，不需要传递options参数
      return window.__devHelperOriginalFetch.call(this, url, url instanceof Request ? undefined : options);
    }
    
    // 如果URL不允许，直接调用原始fetch，不做任何拦截
    if (!urlAllowed) {
      // 如果URL被修复，使用修复后的URL
      if (fixedUrl !== originalUrl) {
        if (url instanceof Request) {
          // 创建一个新的Request对象，保持所有属性
          const newRequest = new Request(fixedUrl, {
            method: url.method,
            headers: url.headers,
            body: url.body,
            mode: url.mode,
            credentials: url.credentials,
            cache: url.cache,
            redirect: url.redirect,
            referrer: url.referrer,
            referrerPolicy: url.referrerPolicy,
            integrity: url.integrity,
            keepalive: url.keepalive
          });
          return window.__devHelperOriginalFetch.call(this, newRequest);
        } else {
          return window.__devHelperOriginalFetch.call(this, fixedUrl, options);
        }
      }
      // 如果url是Request对象，不需要传递options参数
      return window.__devHelperOriginalFetch.call(this, url, url instanceof Request ? undefined : options);
    }
    
    // 执行请求前拦截器
    let { url: modifiedUrl, options: modifiedOptions } = executeRequestInterceptors(fixedUrl, method, options);
    
    // 执行请求参数拦截器
    const paramsIntercepted = executeRequestParamsInterceptor(modifiedUrl, method, modifiedOptions);
    modifiedUrl = paramsIntercepted.url;
    modifiedOptions = paramsIntercepted.options;
    
    // 查找匹配的规则
    const matchingRule = findMatchingRule(modifiedUrl, method);
    
    // 记录所有请求，根据是否匹配Mock规则标记
    const requestData = modifiedOptions.body || {};
    const isMocked = !!matchingRule;
    recordRequest(modifiedUrl, method, requestData, isMocked, matchingRule);
    
    if (matchingRule) {
      // 发送拦截事件到content script
      window.postMessage({
        devHelper: true,
        action: 'requestIntercepted',
        data: {
          url: modifiedUrl,
          method: method,
          ruleId: matchingRule.id,
          ruleName: matchingRule.name
        }
      }, '*');
      
      // 创建Mock响应并记录
      try {
        const mockResponsePromise = createMockResponse(matchingRule);
        
        return mockResponsePromise.then(response => {
          // 克隆响应以读取内容
          const clonedResponse = response.clone();
          
          // 尝试解析响应内容
          return clonedResponse.text().then(responseText => {
            // 发送响应记录到content script
            window.postMessage({
              devHelper: true,
              action: 'responseRecorded',
              data: {
                url: modifiedUrl,
                method: method,
                status: response.status,
                statusText: response.statusText,
                responseText: responseText,
                timestamp: Date.now()
              }
            }, '*');
            
            return response;
          }).catch(err => {
            // 静默失败，不干扰用户
            console.error('[DevHelper] 解析Mock响应内容时出错:', err);
            return response;
          });
        });
      } catch (err) {
        console.error('[DevHelper] Mock响应处理发生异常:', err);
        // 如果发生异常，回退到原始请求
        // 如果URL被修复，使用修复后的URL
        if (fixedUrl !== originalUrl) {
          if (url instanceof Request) {
            // 创建一个新的Request对象，保持所有属性
            const newRequest = new Request(fixedUrl, {
              method: url.method,
              headers: url.headers,
              body: url.body,
              mode: url.mode,
              credentials: url.credentials,
              cache: url.cache,
              redirect: url.redirect,
              referrer: url.referrer,
              referrerPolicy: url.referrerPolicy,
              integrity: url.integrity,
              keepalive: url.keepalive
            });
            return window.__devHelperOriginalFetch.call(this, newRequest);
          } else {
            return window.__devHelperOriginalFetch.call(this, fixedUrl, options);
          }
        }
        // 如果url是Request对象，不需要传递options参数
        return window.__devHelperOriginalFetch.call(this, url, url instanceof Request ? undefined : options);
      }
    }
    
    // 无匹配规则，调用原始fetch并记录响应
    let fetchUrl, finalUrlForLogging;
    
    // 准备fetch的URL和选项
    if (fixedUrl !== originalUrl) {
      finalUrlForLogging = fixedUrl;
      if (modifiedUrl instanceof Request) {
        // 创建一个新的Request对象，保持所有属性
        fetchUrl = new Request(fixedUrl, {
          method: modifiedUrl.method,
          headers: modifiedUrl.headers,
          body: modifiedUrl.body,
          mode: modifiedUrl.mode,
          credentials: modifiedUrl.credentials,
          cache: modifiedUrl.cache,
          redirect: modifiedUrl.redirect,
          referrer: modifiedUrl.referrer,
          referrerPolicy: modifiedUrl.referrerPolicy,
          integrity: modifiedUrl.integrity,
          keepalive: modifiedUrl.keepalive
        });
      } else {
        fetchUrl = fixedUrl;
      }
    } else {
      finalUrlForLogging = modifiedUrl instanceof Request ? modifiedUrl.url : modifiedUrl;
      fetchUrl = modifiedUrl;
    }
    
    // 调用原始fetch
    // 如果fetchUrl是Request对象，不需要传递options参数
    return window.__devHelperOriginalFetch.call(this, fetchUrl, fetchUrl instanceof Request ? undefined : modifiedOptions)
      .then(response => {
        // 克隆响应以读取内容
        const clonedResponse = response.clone();
        
        // 尝试解析响应内容
        clonedResponse.text().then(responseText => {
          // 发送响应记录到content script
          window.postMessage({
            devHelper: true,
            action: 'responseRecorded',
            data: {
              url: finalUrlForLogging,
              method: method,
              status: response.status,
              statusText: response.statusText,
              responseText: responseText,
              timestamp: Date.now()
            }
          }, '*');
        }).catch(err => {
          // 静默失败，不干扰用户
        });
        
        return response;
      })
      .catch(err => {
        // 处理网络错误
        console.error('[DevHelper] 网络请求失败:', err);
        
        // 记录错误响应
        window.postMessage({
          devHelper: true,
          action: 'responseRecorded',
          data: {
            url: finalUrlForLogging,
            method: method,
            status: 0,
            statusText: err.message || 'Network Error',
            responseText: `[Network Error: ${err.message}]`,
            timestamp: Date.now()
          }
        }, '*');
        
        // 重新抛出错误，让页面自己处理
        throw err;
      });
  }
});

// 重写XMLHttpRequest的open方法
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  // 检查并修复Mixed Content问题
  let fixedUrl = url;
  if (window.location.protocol === 'https:' && url.startsWith('http://')) {
    console.warn('[DevHelper] 检测到Mixed Content请求，尝试升级到HTTPS:', url);
    fixedUrl = url.replace('http://', 'https://');
  }
  
  this._devHelperMethod = method;
  this._devHelperUrl = fixedUrl;
  
  return window.__devHelperOriginalXHROpen.call(this, method, fixedUrl, ...args);
};

// 重写XMLHttpRequest的send方法
XMLHttpRequest.prototype.send = function(...args) {
  let url = this._devHelperUrl;
  const method = (this._devHelperMethod || 'GET').toUpperCase();
  let requestData = args[0] || {};
  
  // 检查URL是否允许
  const urlAllowed = isUrlAllowed(url);
  
  // 如果URL不允许，直接调用原始send，不做任何拦截
  if (!urlAllowed) {
    return window.__devHelperOriginalXHRSend.call(this, ...args);
  }
  
  // 执行请求前拦截器
  const headers = {};
  // 提取XHR请求头 (注意：getAllRequestHeaders 不是标准方法)
  // 我们需要通过其他方式跟踪请求头
  if (this._devHelperRequestHeaders) {
    Object.assign(headers, this._devHelperRequestHeaders);
  }
  
  // 为XHR创建options对象
  const options = {
    headers: headers,
    body: requestData
  };
  
  // 执行拦截器
  const { url: modifiedUrl, options: modifiedOptions } = executeRequestInterceptors(url, method, options);
  url = modifiedUrl;
  requestData = modifiedOptions.body;
  
  // 执行请求参数拦截器
  const paramsIntercepted = executeRequestParamsInterceptor(url, method, modifiedOptions);
  url = paramsIntercepted.url;
  requestData = paramsIntercepted.options.body;
  
  // 更新XHR的URL
  this._devHelperUrl = url;
  
  // 查找匹配的规则
  const matchingRule = findMatchingRule(url, method);
  
  if (matchingRule) {
    // 记录请求，根据是否匹配Mock规则标记
    const isMocked = !!matchingRule;
    recordRequest(url, method, requestData, isMocked, matchingRule);
    
    // 发送拦截事件到content script
    window.postMessage({
      devHelper: true,
      action: 'requestIntercepted',
      data: {
        url: url,
        method: method,
        ruleId: matchingRule.id,
        ruleName: matchingRule.name
      }
    }, '*');
    
    // 模拟异步响应
    setTimeout(() => {
      try {
        // 准备响应数据
        const response = matchingRule.response;
        const responseText = typeof response === 'string' ? response : JSON.stringify(response);
        
        // 处理响应头
        const responseHeaders = new Headers(matchingRule.headers || {});
        
        // 检查是否需要使用默认响应头
        const shouldUseDefaultHeaders = matchingRule.useDefaultHeaders || Object.keys(matchingRule.headers || {}).length === 0;
        
        // 添加默认响应头
        if (shouldUseDefaultHeaders) {
          if (!responseHeaders.has('Cache-Control')) {
            responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
          if (!responseHeaders.has('Pragma')) {
            responseHeaders.set('Pragma', 'no-cache');
          }
          if (!responseHeaders.has('Expires')) {
            responseHeaders.set('Expires', '0');
          }
        }
        
        // 确保设置了Content-Type
        if (!responseHeaders.has('Content-Type') && !responseHeaders.has('content-type')) {
          // 根据响应内容确定Content-Type
          let contentType = 'application/json';
          if (typeof matchingRule.response === 'string') {
            if (matchingRule.response.trim().startsWith('/*') || matchingRule.response.trim().startsWith('body') || 
                matchingRule.response.trim().startsWith('.') || matchingRule.response.trim().startsWith('#')) {
              contentType = 'text/css';
            } else if (matchingRule.response.trim().startsWith('//') || matchingRule.response.trim().startsWith('/*') ||
                     matchingRule.response.trim().startsWith('function') || matchingRule.response.trim().startsWith('const') ||
                     matchingRule.response.trim().startsWith('let') || matchingRule.response.trim().startsWith('var') ||
                     matchingRule.response.trim().startsWith('if') || matchingRule.response.trim().startsWith('for') ||
                     matchingRule.response.trim().startsWith('while') || matchingRule.response.trim().startsWith('return')) {
              contentType = 'application/javascript';
            } else if (matchingRule.response.trim().startsWith('<')) {
              contentType = 'text/html';
            } else {
              try {
                JSON.parse(matchingRule.response);
                contentType = 'application/json';
              } catch (e) {
                contentType = 'text/plain';
              }
            }
          }
          responseHeaders.set('Content-Type', contentType);
        }
        
        // 设置响应属性
        const properties = {
          readyState: {
            value: 4,
            writable: false
          },
          status: {
            value: matchingRule.statusCode || 200,
            writable: false
          },
          statusText: {
            value: matchingRule.statusText || 'OK',
            writable: false
          },
          responseText: {
            value: responseText,
            writable: false
          },
          // 实现getResponseHeader方法
          getResponseHeader: {
            value: function(headerName) {
              return responseHeaders.get(headerName.toLowerCase());
            },
            writable: false
          },
          // 实现getAllResponseHeaders方法
          getAllResponseHeaders: {
            value: function() {
              let headersString = '';
              responseHeaders.forEach((value, name) => {
                headersString += `${name}: ${value}\r\n`;
              });
              return headersString;
            },
            writable: false
          }
        };
        
        // 根据responseType设置response属性
        const responseType = this.responseType || '';
        if (responseType === 'json') {
          try {
            properties.response = {
              value: typeof matchingRule.response === 'string' ? JSON.parse(matchingRule.response) : matchingRule.response,
              writable: false
            };
          } catch (e) {
            properties.response = {
              value: matchingRule.response,
              writable: false
            };
          }
        } else if (responseType === 'arraybuffer') {
          // 将responseText转换为ArrayBuffer
          const encoder = new TextEncoder();
          properties.response = {
            value: encoder.encode(responseText),
            writable: false
          };
        } else if (responseType === 'blob') {
          // 创建Blob对象
          properties.response = {
            value: new Blob([responseText], { type: 'application/json' }),
            writable: false
          };
        } else if (responseType === 'document') {
          // 尝试解析为XML文档
          try {
            const parser = new DOMParser();
            properties.response = {
              value: parser.parseFromString(responseText, 'text/xml'),
              writable: false
            };
          } catch (e) {
            properties.response = {
              value: null,
              writable: false
            };
          }
        } else {
          // 默认情况下，response与responseText相同
          properties.response = {
            value: responseText,
            writable: false
          };
        }
        
        // 设置responseURL属性
        properties.responseURL = {
          value: url,
          writable: false
        };
        
        // 设置所有响应属性
        Object.defineProperties(this, properties);
        
        // 发送响应记录到content script
        window.postMessage({
          devHelper: true,
          action: 'responseRecorded',
          data: {
            url: url,
            method: method,
            status: matchingRule.statusCode || 200,
            statusText: matchingRule.statusText || 'OK',
            responseText: responseText,
            timestamp: Date.now()
          }
        }, '*');
        
        // 触发onreadystatechange事件
        if (this.onreadystatechange) {
          this.onreadystatechange();
        }
        
        // 触发onload事件
        if (this.onload) {
          this.onload();
        }
        
        // 触发load事件
        if (this.addEventListener) {
          const loadEvent = new Event('load');
          this.dispatchEvent(loadEvent);
        }
        
        // 触发onloadend事件
        if (this.onloadend) {
          this.onloadend();
        }
        
        // 触发loadend事件（通过addEventListener注册的）
        if (this.addEventListener) {
          const loadendEvent = new Event('loadend');
          this.dispatchEvent(loadendEvent);
        }
        
        // 触发onprogress事件
        if (this.onprogress) {
          this.onprogress({ loaded: 100, total: 100 });
        }
        
        // 触发progress事件（通过addEventListener注册的）
        if (this.addEventListener) {
          const progressEvent = new ProgressEvent('progress', { loaded: 100, total: 100 });
          this.dispatchEvent(progressEvent);
        }
      } catch (error) {
        // 静默失败，不干扰用户
      }
    }, matchingRule.responseTime || 0);
    
    return;
  }
  
  // 更新XHR的请求头
  // 注意：removeRequestHeader 不是标准方法，我们无法直接移除请求头
  if (modifiedOptions.headers) {
    try {
      // 只能添加或覆盖请求头
      Object.keys(modifiedOptions.headers).forEach(name => {
        this.setRequestHeader(name, modifiedOptions.headers[name]);
      });
    } catch (e) {
      // 静默失败，不干扰用户
    }
  }
  
  // 为原始XHR请求添加响应记录
  const originalOnreadystatechange = this.onreadystatechange;
  this.onreadystatechange = function() {
    // 当请求完成时
    if (this.readyState === 4) {
      // 根据responseType获取响应内容
      let responseContent = '';
      try {
        switch (this.responseType) {
          case 'json':
            responseContent = JSON.stringify(this.response);
            break;
          case 'arraybuffer':
            // 简单记录类型，不转换内容
            responseContent = '[ArrayBuffer]';
            break;
          case 'blob':
            // 简单记录类型，不转换内容
            responseContent = '[Blob]';
            break;
          default:
            // 默认为text或空字符串，直接使用responseText
            responseContent = this.responseText;
        }
      } catch (e) {
        // 如果获取响应内容失败，记录错误信息
        responseContent = '[Error getting response content: ' + e.message + ']';
      }
      
      // 发送响应记录到content script
      window.postMessage({
        devHelper: true,
        action: 'responseRecorded',
        data: {
          url: url,
          method: method,
          status: this.status,
          statusText: this.statusText,
          responseText: responseContent,
          timestamp: Date.now()
        }
      }, '*');
    }
    
    // 调用原始的回调
    if (originalOnreadystatechange) {
      originalOnreadystatechange.apply(this, arguments);
    }
  };
  
  // 也监听load事件，确保捕获所有完成情况
  const originalOnload = this.onload;
  this.onload = function() {
    // 根据responseType获取响应内容
    let responseContent = '';
    try {
      switch (this.responseType) {
        case 'json':
          responseContent = JSON.stringify(this.response);
          break;
        case 'arraybuffer':
          // 简单记录类型，不转换内容
          responseContent = '[ArrayBuffer]';
          break;
        case 'blob':
          // 简单记录类型，不转换内容
          responseContent = '[Blob]';
          break;
        default:
          // 默认为text或空字符串，直接使用responseText
          responseContent = this.responseText;
      }
    } catch (e) {
      // 如果获取响应内容失败，记录错误信息
      responseContent = '[Error getting response content: ' + e.message + ']';
    }
    
    // 发送响应记录到content script
    window.postMessage({
      devHelper: true,
      action: 'responseRecorded',
      data: {
        url: url,
        method: method,
        status: this.status,
        statusText: this.statusText,
        responseText: responseContent,
        timestamp: Date.now()
      }
    }, '*');
    
    // 调用原始的回调
    if (originalOnload) {
      originalOnload.apply(this, arguments);
    }
  };
  
  // 监听error事件，捕获网络错误
  const originalOnerror = this.onerror;
  this.onerror = function() {
    console.error('[DevHelper] XHR网络请求失败:', url);
    
    // 发送错误响应记录到content script
    window.postMessage({
      devHelper: true,
      action: 'responseRecorded',
      data: {
        url: url,
        method: method,
        status: 0,
        statusText: 'Network Error',
        responseText: '[Network Error]',
        timestamp: Date.now()
      }
    }, '*');
    
    // 调用原始的回调
    if (originalOnerror) {
      originalOnerror.apply(this, arguments);
    }
  };
  
  // 无匹配规则，调用原始send
  return window.__devHelperOriginalXHRSend.call(this, requestData);
};

// 通知content script注入成功
window.postMessage({
  devHelper: true,
  action: 'injectedSuccessfully'
}, '*');