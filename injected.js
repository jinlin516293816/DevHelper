// injected.js - 注入到页面上下文的脚本，用于拦截网络请求

console.log('DevHelper 注入脚本已加载');

// 保存原始方法的引用
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

// Mock规则存储
let mockRules = [];
// 请求前拦截器存储
let requestInterceptors = [];
// Mock开关状态，默认值为true，会被content script注入后立即更新
let isMockEnabled = true;

// CSS注入相关
let injectedStyle = null;
let injectedCssContent = '';

// 从content script接收消息
window.addEventListener('message', (event) => {
  // 确保消息来自我们的扩展
  if (event.source !== window || !event.data || !event.data.devHelper) {
    return;
  }
  
  const data = event.data;
  
  if (data.action === 'updateMockRules') {
    mockRules = data.rules || [];
    console.log('已更新Mock规则，当前规则数量:', mockRules.length);
  } else if (data.action === 'updateRequestInterceptors') {
    requestInterceptors = data.interceptors || [];
    console.log('已更新请求前拦截器，当前拦截器数量:', requestInterceptors.length);
  } else if (data.action === 'toggleMock') {
    isMockEnabled = data.enabled;
    console.log('Mock功能已' + (isMockEnabled ? '启用' : '禁用'));
  } else if (data.action === 'injectCss') {
    // 注入CSS
    injectCss(data.css);
  } else if (data.action === 'removeCss') {
    // 移除CSS
    removeCss();
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
  console.log('DevHelper: CSS已成功注入');
}

// 移除CSS
function removeCss() {
  if (injectedStyle) {
    injectedStyle.remove();
    injectedStyle = null;
    injectedCssContent = '';
    console.log('DevHelper: CSS已成功移除');
  }
}

// 查找匹配的Mock规则
function findMatchingRule(url, method) {
  // 如果Mock功能未启用，直接返回null
  if (!isMockEnabled || !url) return null;
  
  return mockRules.find(rule => {
    // 检查规则是否启用
    if (!rule.enabled) return false;
    
    // 检查HTTP方法
    if (rule.method && rule.method.toUpperCase() !== method.toUpperCase() && rule.method !== 'ALL') {
      return false;
    }
    
    // 检查URL匹配
    const urlPattern = rule.urlPattern || rule.url;
    if (!urlPattern) return false;
    
    // 根据匹配类型进行URL匹配
    const patternType = rule.urlPatternType || 'contains';
    
    switch (patternType) {
      case 'contains':
        return url.includes(urlPattern);
      case 'exact':
        return url === urlPattern;
      case 'startsWith':
        return url.startsWith(urlPattern);
      case 'endsWith':
        return url.endsWith(urlPattern);
      case 'regex':
        try {
          const regex = new RegExp(urlPattern);
          return regex.test(url);
        } catch (e) {
          console.error('正则表达式错误:', e);
          return false;
        }
      default:
        return url.includes(urlPattern);
    }
  });
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
      console.error('响应函数执行错误:', e);
      response = { error: '响应函数执行失败' };
    }
  }
  
  // 如果是字符串，尝试解析为JSON
  if (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch (e) {
      // 如果不是JSON，保持原样
    }
  }
  
  // 构建fetch响应
  const headers = new Headers(rule.headers || {
    'content-type': 'application/json'
  });
  
  return new Response(JSON.stringify(response), {
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
  
  // 遍历所有拦截器
  requestInterceptors.forEach(interceptor => {
    if (interceptor.enabled) {
      try {
        // 检查URL是否匹配拦截器的URL模式
        const regex = new RegExp(interceptor.urlPattern);
        if (regex.test(modifiedUrl)) {
          console.log('执行请求前拦截器:', interceptor.name, '针对URL:', modifiedUrl);
          
          // 创建请求上下文
          const request = {
            url: modifiedUrl,
            method: method,
            headers: modifiedOptions.headers || {},
            body: modifiedOptions.body
          };
          
          // 执行拦截器代码
          eval(interceptor.code);
          
          // 更新URL和选项
          modifiedUrl = request.url;
          modifiedOptions.headers = request.headers;
          modifiedOptions.body = request.body;
        }
      } catch (error) {
        console.error('请求前拦截器执行错误:', interceptor.name, error);
      }
    }
  });
  
  return { url: modifiedUrl, options: modifiedOptions };
}

// 重写fetch方法
window.fetch = function(url, options = {}) {
  // 确保url是字符串
  const originalUrl = typeof url === 'string' ? url : url.url;
  const method = (options.method || 'GET').toUpperCase();
  
  console.log('拦截fetch请求:', method, originalUrl);
  
  // 执行请求前拦截器
  const { url: modifiedUrl, options: modifiedOptions } = executeRequestInterceptors(originalUrl, method, options);
  
  // 查找匹配的规则
  const matchingRule = findMatchingRule(modifiedUrl, method);
  
  // 记录所有请求，根据是否匹配Mock规则标记
  const requestData = modifiedOptions.body || {};
  const isMocked = !!matchingRule;
  recordRequest(modifiedUrl, method, requestData, isMocked, matchingRule);
  
  if (matchingRule) {
    console.log('找到匹配的Mock规则:', matchingRule.name);
    
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
    
    // 返回Mock响应并记录
    return createMockResponse(matchingRule).then(response => {
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
        console.error('解析Mock响应内容失败:', err);
        return response;
      });
    });
  }
  
  // 无匹配规则，调用原始fetch并记录响应
  return originalFetch.call(this, modifiedUrl, modifiedOptions).then(response => {
    // 克隆响应以读取内容
    const clonedResponse = response.clone();
    
    // 尝试解析响应内容
    clonedResponse.text().then(responseText => {
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
    }).catch(err => {
      console.error('解析响应内容失败:', err);
    });
    
    return response;
  });
};

// 重写XMLHttpRequest的open方法
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._devHelperMethod = method;
  this._devHelperUrl = url;
  
  return originalXHROpen.call(this, method, url, ...args);
};

// 重写XMLHttpRequest的send方法
XMLHttpRequest.prototype.send = function(...args) {
  let url = this._devHelperUrl;
  const method = (this._devHelperMethod || 'GET').toUpperCase();
  let requestData = args[0] || {};
  
  console.log('拦截XHR请求:', method, url);
  
  // 执行请求前拦截器
  const headers = {};
  // 提取XHR请求头
  if (this.getAllResponseHeaders) {
    try {
      const headerLines = this.getAllResponseHeaders().split('\r\n');
      headerLines.forEach(line => {
        if (line) {
          const [name, value] = line.split(': ');
          headers[name] = value;
        }
      });
    } catch (e) {
      console.error('获取XHR请求头失败:', e);
    }
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
  
  // 更新XHR的URL
  this._devHelperUrl = url;
  
  // 查找匹配的规则
  const matchingRule = findMatchingRule(url, method);
  
  // 记录请求，根据是否匹配Mock规则标记
  const isMocked = !!matchingRule;
  recordRequest(url, method, requestData, isMocked, matchingRule);
  
  if (matchingRule) {
    console.log('找到匹配的Mock规则:', matchingRule.name);
    
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
        
        // 设置响应属性
        Object.defineProperties(this, {
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
          response: {
            value: responseText,
            writable: false
          }
        });
        
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
      } catch (error) {
        console.error('模拟XHR响应失败:', error);
      }
    }, matchingRule.responseTime || 0);
    
    return;
  }
  
  // 更新XHR的请求头
  if (modifiedOptions.headers) {
    // 清除现有请求头
    try {
      // 遍历现有请求头并移除
      const headerLines = this.getAllResponseHeaders().split('\r\n');
      headerLines.forEach(line => {
        if (line) {
          const [name] = line.split(': ');
          this.removeRequestHeader(name);
        }
      });
      
      // 添加修改后的请求头
      Object.keys(modifiedOptions.headers).forEach(name => {
        this.setRequestHeader(name, modifiedOptions.headers[name]);
      });
    } catch (e) {
      console.error('更新XHR请求头失败:', e);
    }
  }
  
  // 为原始XHR请求添加响应记录
  const originalOnreadystatechange = this.onreadystatechange;
  this.onreadystatechange = function() {
    // 当请求完成时
    if (this.readyState === 4) {
      // 发送响应记录到content script
      window.postMessage({
        devHelper: true,
        action: 'responseRecorded',
        data: {
          url: url,
          method: method,
          status: this.status,
          statusText: this.statusText,
          responseText: this.responseText,
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
    // 发送响应记录到content script
    window.postMessage({
      devHelper: true,
      action: 'responseRecorded',
      data: {
        url: url,
        method: method,
        status: this.status,
        statusText: this.statusText,
        responseText: this.responseText,
        timestamp: Date.now()
      }
    }, '*');
    
    // 调用原始的回调
    if (originalOnload) {
      originalOnload.apply(this, arguments);
    }
  };
  
  // 无匹配规则，调用原始send
  return originalXHRSend.call(this, requestData);
};

// 通知content script注入成功
window.postMessage({
  devHelper: true,
  action: 'injectedSuccessfully'
}, '*');
