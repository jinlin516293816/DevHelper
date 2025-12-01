// content.js - 在网页上下文中执行的脚本

console.log('DevHelper 内容脚本已加载');

// 注入injected.js到页面
function injectScript() {
  console.log('开始注入injected.js到页面');
  
  // 先从storage获取设置，确保注入后能立即发送正确的mock状态
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['mockRules', 'settings', 'injectedCss', 'cssInjectionStatus', 'requestInterceptors'], function(result) {
      const rules = result.mockRules || [];
      const settings = result.settings || {};
      const mockEnabled = settings.mockEnabled !== undefined ? settings.mockEnabled : true;
      const injectedCss = result.injectedCss || '';
      const cssInjectionStatus = result.cssInjectionStatus || false;
      const requestInterceptors = Array.isArray(result.requestInterceptors) ? result.requestInterceptors : [];
      
      try {
        // 创建script标签
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        script.onerror = function() {
          console.error('injected.js注入失败');
        };
        
        // 注入到head
        (document.head || document.documentElement).appendChild(script);
        
        // 注入后移除script标签并发送Mock规则和状态
        script.onload = function() {
          script.remove();
          console.log('injected.js已注入并移除script标签');
          
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
          
          // 如果CSS注入功能是启用状态，自动注入CSS
          if (cssInjectionStatus && injectedCss) {
            console.log('自动注入CSS，内容长度:', injectedCss.length);
            window.postMessage({
              devHelper: true,
              action: 'injectCss',
              css: injectedCss
            }, '*');
          }
        };
      } catch (error) {
        console.error('注入脚本出错:', error);
      }
    });
  }
}

// 从存储加载Mock规则和Mock开关状态并发送给injected.js
function loadAndSendMockRules() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['mockRules', 'settings', 'injectedCss', 'cssInjectionStatus', 'requestInterceptors'], function(result) {
      const rules = result.mockRules || [];
      const settings = result.settings || {};
      const mockEnabled = settings.mockEnabled !== undefined ? settings.mockEnabled : true;
      const injectedCss = result.injectedCss || '';
      const cssInjectionStatus = result.cssInjectionStatus || false;
      const requestInterceptors = Array.isArray(result.requestInterceptors) ? result.requestInterceptors : [];
      
      console.log('加载Mock规则，数量:', rules.length);
      console.log('加载Mock开关状态:', mockEnabled);
      console.log('加载CSS注入状态:', cssInjectionStatus);
      console.log('加载请求前拦截器，数量:', requestInterceptors.length);
      
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
      
      // 如果CSS注入功能是启用状态，自动注入CSS
      if (cssInjectionStatus && injectedCss) {
        console.log('自动注入CSS，内容长度:', injectedCss.length);
        window.postMessage({
          devHelper: true,
          action: 'injectCss',
          css: injectedCss
        }, '*');
      }
    });
  }
}

// 初始化时注入脚本
// 无论run_at设置为什么，都确保在DOM准备好后再注入，同时保证尽可能早地注入
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
  console.log('content.js收到消息:', message.action, '来自:', sender.tab ? sender.tab.url : 'background');
  
  // 确保消息有action属性
  if (!message.action) {
    console.error('content.js收到无action属性的消息:', message);
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
        console.error('执行脚本失败:', error);
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
        console.error('高亮元素失败:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'updateMockRules':
      // 处理Mock规则更新
      console.log('从background收到Mock规则更新，数量:', message.rules ? message.rules.length : 0);
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
      console.log('从background收到Mock开关状态:', message.enabled);
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
      console.log('从background收到请求前拦截器更新，数量:', message.interceptors ? message.interceptors.length : 0);
      // 将更新的拦截器发送给injected.js
      window.postMessage({
        devHelper: true,
        action: 'updateRequestInterceptors',
        interceptors: message.interceptors || []
      }, '*');
      sendResponse({ success: true });
      break;
      
    case 'tabUpdated':
      // 处理标签页更新事件
      console.log('收到标签页更新通知:', message.tabInfo);
      // 可以在这里执行页面更新后的操作
      sendResponse({ success: true, message: '已收到标签页更新通知' });
      break;
    
    default:
      console.error('content.js收到未知action:', message.action);
      sendResponse({ 
        success: false, 
        error: '未知操作',
        unknownAction: message.action,
        availableActions: ['getPageDetails', 'executeScript', 'highlightElement', 'updateMockRules', 'toggleMock', 'tabUpdated']
      });
  }
  
  return true; // 保持消息通道开放，以支持异步响应
});

// 监控DOM变化
const observer = new MutationObserver((mutations) => {
  // 可以在这里监控DOM变化并向background或popup报告
  // 但为了性能，我们仅在必要时触发
});

// 监听DOMContentLoaded事件
document.addEventListener('DOMContentLoaded', () => {
  // 页面加载完成后可以执行一些初始化操作
  chrome.runtime.sendMessage({ 
    action: 'pageLoaded',
    data: { 
      url: window.location.href,
      title: document.title
    } 
  });
  
  // 检查是否需要显示通知
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['settings'], function(result) {
      const settings = result.settings || {};
      // 默认显示通知
      const showNotification = settings.showNotification !== undefined ? settings.showNotification : true;
      
      if (showNotification) {
        // 显示DevHelper已启用的通知
        showDevHelperNotification();
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
  notification.textContent = '启用了DevHelper 拯救者';
  
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
      console.log('injected.js注入成功并已初始化');
      break;
      
    case 'requestIntercepted':
      console.log('请求被拦截:', data.data);
      // 将拦截信息发送给background
      chrome.runtime.sendMessage({
        action: 'requestIntercepted',
        data: data.data
      });
      break;
      
    case 'requestRecorded':
      // 接收请求记录并转发给background.js
      console.log('请求已记录:', data.data.url, data.data.method);
      chrome.runtime.sendMessage({
        action: 'requestRecorded',
        data: data.data
      });
      break;
      
    case 'responseRecorded':
      // 接收响应记录并转发给background.js
      console.log('响应已记录:', data.data.url, data.data.status);
      chrome.runtime.sendMessage({
        action: 'responseRecorded',
        data: data.data
      });
      break;
      
    default:
      console.log('收到injected.js消息:', data.action);
  }
});

// 已将Mock相关消息处理合并到主消息监听器中