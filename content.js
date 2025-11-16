// content.js - 在网页上下文中执行的脚本

console.log('DevHelper 内容脚本已加载');

// 与popup和background通信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
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
      
    default:
      sendResponse({ success: false, error: '未知操作' });
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
});