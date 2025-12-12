// content.js - 在网页上下文中执行的脚本

// 注入injected.js到页面
function injectScript() {
  
  // 先从storage获取设置，确保注入后能立即发送正确的mock状态
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['mockRules', 'settings', 'injectedCss', 'cssInjectionStatus', 'injectedJs', 'jsInjectionStatus', 'requestInterceptors', 'requestParamsInterceptor', 'requestParamsInterceptorStatus'], function(result) {
      const rules = result.mockRules || [];
      const settings = result.settings || {};
      const mockEnabled = settings.mockEnabled !== undefined ? settings.mockEnabled : true;
      const injectedCss = result.injectedCss || '';
      const cssInjectionStatus = result.cssInjectionStatus || false;
      const requestInterceptors = Array.isArray(result.requestInterceptors) ? result.requestInterceptors : [];
      const requestParamsInterceptor = result.requestParamsInterceptor || '';
      const requestParamsInterceptorStatus = result.requestParamsInterceptorStatus || false;
      
      // 获取URL限制设置
      const urlRestrictionEnabled = settings.urlRestrictionEnabled !== undefined ? settings.urlRestrictionEnabled : false;
      const allowedUrlsStr = settings.allowedUrls || '';
      const allowedUrls = allowedUrlsStr.split(',').map(url => url.trim()).filter(url => url !== '');
      
      try {
        // 创建script标签
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        script.onerror = function() {
        };
        
        // 注入到head
        (document.head || document.documentElement).appendChild(script);
        
        // 注入后移除script标签并发送Mock规则和状态
        script.onload = function() {
          script.remove();
          
          // 立即发送mock状态和规则
          window.postMessage({
            devHelper: true,
            action: 'toggleMock',
            enabled: mockEnabled
          }, '*');
          
          window.postMessage({
            devHelper: true,
            action: 'updateMockRules',
            rules: rules
          }, '*');
          
          // 发送请求前拦截器
          window.postMessage({
            devHelper: true,
            action: 'updateRequestInterceptors',
            interceptors: requestInterceptors
          }, '*');
          
          // 发送URL限制设置
          window.postMessage({
            devHelper: true,
            action: 'updateUrlRestriction',
            enabled: urlRestrictionEnabled,
            allowedUrls: allowedUrls
          }, '*');
          
          // 如果CSS注入功能是启用状态，自动注入CSS
          if (cssInjectionStatus && injectedCss) {
            window.postMessage({
              devHelper: true,
              action: 'injectCss',
              css: injectedCss
            }, '*');
          }
          
          // 如果JS注入功能是启用状态，自动注入JS
          const injectedJs = result.injectedJs || '';
          const jsInjectionStatus = result.jsInjectionStatus || false;
          if (jsInjectionStatus && injectedJs) {
            window.postMessage({
              devHelper: true,
              action: 'injectJs',
              js: injectedJs
            }, '*');
          }
          
          // 如果请求参数拦截器已启用，发送拦截器代码
          if (requestParamsInterceptorStatus && requestParamsInterceptor) {
            window.postMessage({
              devHelper: true,
              action: 'updateRequestParamsInterceptor',
              code: requestParamsInterceptor
            }, '*');
          }
        };
      } catch (error) {
        console.error('[DevHelper] 注入脚本失败:', error);
      }
    });
  } else {
    console.error('[DevHelper] chrome.storage不可用');
  }
}

// 从存储加载Mock规则和Mock开关状态并发送给injected.js
function loadAndSendMockRules() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['mockRules', 'settings', 'injectedCss', 'cssInjectionStatus', 'injectedJs', 'jsInjectionStatus', 'requestInterceptors', 'requestParamsInterceptor', 'requestParamsInterceptorStatus'], function(result) {
      const rules = result.mockRules || [];
      const settings = result.settings || {};
      const mockEnabled = settings.mockEnabled !== undefined ? settings.mockEnabled : true;
      const injectedCss = result.injectedCss || '';
      const cssInjectionStatus = result.cssInjectionStatus || false;
      const requestInterceptors = Array.isArray(result.requestInterceptors) ? result.requestInterceptors : [];
      const requestParamsInterceptor = result.requestParamsInterceptor || '';
      const requestParamsInterceptorStatus = result.requestParamsInterceptorStatus || false;
      
      // 获取URL限制设置
      const urlRestrictionEnabled = settings.urlRestrictionEnabled !== undefined ? settings.urlRestrictionEnabled : false;
      const allowedUrlsStr = settings.allowedUrls || '';
      const allowedUrls = allowedUrlsStr.split(',').map(url => url.trim()).filter(url => url !== '');
      
      // 发送规则到injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateMockRules',
        rules: rules
      }, '*');
      
      // 发送开关状态到injected.js
      window.postMessage({
        devHelper: true,
        action: 'toggleMock',
        enabled: mockEnabled
      }, '*');
      
      // 发送请求前拦截器到injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateRequestInterceptors',
        interceptors: requestInterceptors
      }, '*');
      
      // 发送URL限制设置
      window.postMessage({
        devHelper: true,
        action: 'updateUrlRestriction',
        enabled: urlRestrictionEnabled,
        allowedUrls: allowedUrls
      }, '*');
      
      // 如果CSS注入功能是启用状态，自动注入CSS
      if (cssInjectionStatus && injectedCss) {
        window.postMessage({
          devHelper: true,
          action: 'injectCss',
          css: injectedCss
        }, '*');
      }
      
      // 如果JS注入功能是启用状态，自动注入JS
      const injectedJs = result.injectedJs || '';
      const jsInjectionStatus = result.jsInjectionStatus || false;
      if (jsInjectionStatus && injectedJs) {
        window.postMessage({
          devHelper: true,
          action: 'injectJs',
          js: injectedJs
        }, '*');
      }
      
      // 如果请求参数拦截器已启用，发送拦截器代码
      if (requestParamsInterceptorStatus && requestParamsInterceptor) {
        window.postMessage({
          devHelper: true,
          action: 'updateRequestParamsInterceptor',
          code: requestParamsInterceptor
        }, '*');
      }
    });
  }
}

// 初始化时注入脚本
// 无论run_at设置什么，都确保在DOM准备好后再注入，同时保证尽可能早地注入
function initInject() {
  if (document.head || document.documentElement) {
    injectScript();
  } else {
    // 如果DOM还未准备好，使用MutationObserver等待
    const observer = new MutationObserver((mutations) => {
      if (document.head || document.documentElement) {
        observer.disconnect();
        injectScript();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }
}

// 立即执行初始化，确保尽早注入
initInject();

// 与popup和background通信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // 确保消息有action属性
  if (!message.action) {
    sendResponse({ 
      success: false, 
      error: '消息缺少action属性',
      receivedMessage: message 
    });
    return true;
  }
  
  switch (message.action) {
    case 'injectCss':
        // 向页面注入CSS
        window.postMessage({
          devHelper: true,
          action: 'injectCss',
          css: message.css
        }, '*');
        sendResponse({ success: true, message: 'CSS注入命令已发送' });
        break;
      case 'removeCss':
        // 从页面移除CSS
        window.postMessage({
          devHelper: true,
          action: 'removeCss'
        }, '*');
        sendResponse({ success: true, message: 'CSS移除命令已发送' });
        break;
      case 'injectJs':
        // 向页面注入JS
        window.postMessage({
          devHelper: true,
          action: 'injectJs',
          js: message.js
        }, '*');
        sendResponse({ success: true, message: 'JS注入命令已发送' });
        break;
      case 'removeJs':
        // 从页面移除JS
        window.postMessage({
          devHelper: true,
          action: 'removeJs'
        }, '*');
        sendResponse({ success: true, message: 'JS移除命令已发送' });
        break;
    case 'getPageDetails':
      // 获取页面详细信息
      const pageDetails = {
        title: document.title,
        url: window.location.href,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        domStats: {
          paragraphs: document.querySelectorAll('p').length,
          images: document.querySelectorAll('img').length,
          links: document.querySelectorAll('a').length,
          forms: document.querySelectorAll('form').length
        },
        performance: window.performance ? {
          navigationStart: window.performance.timing.navigationStart,
          domContentLoadedEventEnd: window.performance.timing.domContentLoadedEventEnd
        } : null
      };
      sendResponse({ success: true, data: pageDetails });
      break;
      
    case 'executeScript':
      // 执行自定义脚本
      try {
        const result = eval(message.script);
        sendResponse({ success: true, result });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'highlightElement':
      // 高亮指定元素
      try {
        const element = document.querySelector(message.selector);
        if (element) {
          // 保存原始样式
          const originalStyle = {
            outline: element.style.outline,
            backgroundColor: element.style.backgroundColor
          };
          
          // 添加高亮
          element.style.outline = '2px solid #ff4444';
          element.style.backgroundColor = 'rgba(255, 68, 68, 0.2)';
          
          // 滚动到元素
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // 3秒后恢复原始样式
          setTimeout(() => {
            element.style.outline = originalStyle.outline;
            element.style.backgroundColor = originalStyle.backgroundColor;
          }, 3000);
          
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: '元素未找到' });
        }
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'updateMockRules':
      // 处理Mock规则更新
      // 将更新的规则发送给injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateMockRules',
        rules: message.rules || []
      }, '*');
      sendResponse({ success: true });
      break;
      
    case 'toggleMock':
      // 处理Mock开关状态更新
      // 将开关状态发送给injected.js
      window.postMessage({
        devHelper: true,
        action: 'toggleMock',
        enabled: message.enabled
      }, '*');
      sendResponse({ success: true });
      break;
      
    case 'updateRequestInterceptors':
      // 处理请求前拦截器更新
      // 将更新的拦截器发送给injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateRequestInterceptors',
        interceptors: message.interceptors || []
      }, '*');
      sendResponse({ success: true });
      break;
      
      case 'updateRequestParamsInterceptor':
      // 处理请求参数拦截器更新
      // 将更新的拦截器发送给injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateRequestParamsInterceptor',
        code: message.code || ''
      }, '*');
      sendResponse({ success: true });
      break;
      
      case 'disableRequestParamsInterceptor':
      // 处理请求参数拦截器禁用
      // 将禁用命令发送给injected.js
      window.postMessage({
        devHelper: true,
        action: 'disableRequestParamsInterceptor'
      }, '*');
      sendResponse({ success: true });
      break;
      
    case 'tabUpdated':
      // 处理标签页更新事件
      // 可以在这里执行页面更新后的操作
      sendResponse({ success: true, message: '已收到标签页更新通知' });
      break;
    
    case 'logMessage':
      // 显示来自后台的日志消息
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ 
        success: false, 
        error: '未知操作',
        unknownAction: message.action,
        availableActions: ['getPageDetails', 'executeScript', 'highlightElement', 'updateMockRules', 'toggleMock', 'tabUpdated', 'logMessage']
      });
  }
  
  return true; // 保持消息通道开放，以支持异步响应
});

// 监控DOM变化
const observer = new MutationObserver((mutations) => {
  // 可以在这里监控DOM变化并向background或popup报告
  // 但为了性能，我们仅在必要时触发
});

// 检查URL是否在允许的列表中
function isUrlAllowed(url, settings) {
  // 如果未启用网址限制，则允许所有URL
  if (!settings.urlRestrictionEnabled) {
    return true;
  }
  
  // 如果允许的网址列表为空，则允许所有URL
  if (!settings.allowedUrls || settings.allowedUrls.trim() === '') {
    return true;
  }
  
  // 将允许的网址列表分割为数组
  const allowedUrlsArray = settings.allowedUrls.split(',').map(url => url.trim()).filter(url => url !== '');
  
  // 检查URL是否与任何允许的网址匹配（模糊匹配）
  for (const allowedUrl of allowedUrlsArray) {
    if (url.includes(allowedUrl)) {
      return true;
    }
  }
  
  return false;
}

// 监听DOMContentLoaded事件
document.addEventListener('DOMContentLoaded', () => {
  // 获取设置并检查URL是否允许
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['settings'], function(result) {
      const settings = result.settings || {};
      
      // 检查URL是否允许
      if (isUrlAllowed(window.location.href, settings)) {
        // 页面加载完成后可以执行一些初始化操作
        chrome.runtime.sendMessage({ 
          action: 'pageLoaded',
          data: { 
            url: window.location.href,
            title: document.title
          } 
        });
        
        // 检查是否需要显示通知
        // 默认显示通知
        const showNotification = settings.showNotification !== undefined ? settings.showNotification : true;
        
        if (showNotification) {
          // 显示DevHelper已启用的通知
          showDevHelperNotification();
        }
      }
    });
  }
});

// 显示DevHelper已启用的通知
function showDevHelperNotification() {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #409EFF, #67C23A);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = 'DevHelper 已开启';
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 5秒后自动移除
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 5000);
}

// 监听chrome.storage的变化
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // 处理settings变化
    if (changes.settings) {
      const newSettings = changes.settings.newValue || {};
      
      // 检查是否是URL限制设置变化
      if (changes.settings.oldValue) {
        const oldSettings = changes.settings.oldValue;
        const urlRestrictionChanged = 
          oldSettings.urlRestrictionEnabled !== newSettings.urlRestrictionEnabled ||
          oldSettings.allowedUrls !== newSettings.allowedUrls;
        
        if (urlRestrictionChanged) {
          // 发送URL限制设置更新给injected.js
          const urlRestrictionEnabled = newSettings.urlRestrictionEnabled !== undefined ? newSettings.urlRestrictionEnabled : false;
          const allowedUrlsStr = newSettings.allowedUrls || '';
          const allowedUrls = allowedUrlsStr.split(',').map(url => url.trim()).filter(url => url !== '');
          
          window.postMessage({
            devHelper: true,
            action: 'updateUrlRestriction',
            enabled: urlRestrictionEnabled,
            allowedUrls: allowedUrls
          }, '*');
        }
      }
      
      // 检查是否是mockEnabled设置变化
      if (changes.settings.oldValue && changes.settings.oldValue.mockEnabled !== newSettings.mockEnabled) {
        // 发送mockEnabled状态更新给injected.js
        window.postMessage({
          devHelper: true,
          action: 'toggleMock',
          enabled: newSettings.mockEnabled
        }, '*');
      }
    }
    
    // 处理mockRules变化
    if (changes.mockRules) {
      const newRules = changes.mockRules.newValue || [];
      // 发送更新后的Mock规则给injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateMockRules',
        rules: newRules
      }, '*');
    }
  });
}

// 监听injected.js的消息
window.addEventListener('message', (event) => {
  // 确保消息来自页面上下文且是我们的扩展发送的
  if (event.source !== window || !event.data || !event.data.devHelper) {
    return;
  }
  
  const data = event.data;
  
  // 处理不同类型的消息
  switch (data.action) {
    case 'injectedSuccessfully':
      break;
      
    case 'requestIntercepted':
      // 将拦截信息发送给background
      chrome.runtime.sendMessage({
        action: 'requestIntercepted',
        data: data.data
      });
      break;
      
    case 'requestRecorded':
      // 接收请求记录并转发给background.js
      chrome.runtime.sendMessage({
        action: 'requestRecorded',
        data: data.data
      });
      break;
      
    case 'responseRecorded':
      // 接收响应记录并转发给background.js
      chrome.runtime.sendMessage({
        action: 'responseRecorded',
        data: data.data
      });
      break;
      
    default:
      break;
  }
});

// 已将Mock相关消息处理合并到主消息监听器中