// background.js - 浏览器插件的后台服务脚本

console.log('DevHelper 后台服务已启动');

// 创建右键菜单
function createContextMenus() {
  // 创建主菜单
  chrome.contextMenus.create({
    id: 'devHelperMain',
    title: 'DevHelper',
    contexts: ['page', 'selection', 'link']
  });
  
  // 创建JSON格式化工具菜单项
  chrome.contextMenus.create({
    id: 'openJsonFormatter',
    parentId: 'devHelperMain',
    title: '打开JSON格式化工具',
    contexts: ['page', 'selection', 'link']
  });
  
  // 创建文件对比工具菜单项
  chrome.contextMenus.create({
    id: 'openFileCompare',
    parentId: 'devHelperMain',
    title: '打开文件对比工具',
    contexts: ['page', 'selection', 'link']
  });
}

// 网络请求监控
let networkCaptureActive = false;
let capturedRequests = [];

// 存储用户偏好设置
const defaultSettings = {
  enableAutoCapture: false,
  highlightTimeout: 3000,
  logLevel: 'info'
};

// 初始化设置
chrome.runtime.onInstalled.addListener((details) => {
  console.log('DevHelper 插件已安装/更新:', details.reason);
  
  // 初始化存储设置
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({ settings: defaultSettings });
    }
  });
  
  // 注册网络请求监听器
  setupNetworkListeners();
  
  // 创建右键菜单
  createContextMenus();
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'openJsonFormatter':
      // 在新标签页中打开JSON格式化工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('json-format/index.html'),
        active: true
      });
      break;
    case 'openFileCompare':
      // 在新标签页中打开文件对比工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('file-compare/index.html'),
        active: true
      });
      break;
  }
});

// 监听键盘快捷键命令
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'open_json_formatter':
      // 在新标签页中打开JSON格式化工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('json-format/index.html'),
        active: true
      });
      break;
    case 'open_file_compare':
      // 在新标签页中打开文件对比工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('file-compare/index.html'),
        active: true
      });
      break;
    case 'open_color_tools':
      // 在新标签页中打开颜色工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('colors/index.html'),
        active: true
      });
      break;
  }
});

// 设置网络请求监听器
function setupNetworkListeners() {
  // 监听网络请求
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (networkCaptureActive) {
        capturedRequests.push({
          url: details.url,
          method: details.method,
          type: details.type,
          timestamp: Date.now()
        });
        
        // 限制捕获的请求数量，避免内存溢出
        if (capturedRequests.length > 1000) {
          capturedRequests.shift();
        }
      }
    },
    { urls: ['<all_urls>'] },
    []
  );
  
  // 监听响应
  chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (networkCaptureActive) {
        // 查找对应的请求并更新响应信息
        const requestIndex = capturedRequests.findIndex(
          req => req.url === details.url && req.timestamp === details.timeStamp
        );
        
        if (requestIndex !== -1) {
          capturedRequests[requestIndex].statusCode = details.statusCode;
          capturedRequests[requestIndex].responseHeaders = details.responseHeaders;
        }
      }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders']
  );
}

// 处理来自popup和content脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startNetworkCapture':
      networkCaptureActive = true;
      capturedRequests = [];
      sendResponse({ success: true, message: '网络捕获已启动' });
      break;
      
    case 'stopNetworkCapture':
      networkCaptureActive = false;
      sendResponse({ 
        success: true, 
        message: '网络捕获已停止',
        capturedRequests: capturedRequests
      });
      break;
      
    case 'getCapturedRequests':
      sendResponse({
        success: true,
        requests: capturedRequests,
        isActive: networkCaptureActive
      });
      break;
      
    case 'pageLoaded':
      // 记录页面加载事件
      console.log('页面已加载:', message.data);
      sendResponse({ success: true });
      break;
      
    case 'getSettings':
      // 获取用户设置
      chrome.storage.sync.get(['settings'], (result) => {
        sendResponse({ 
          success: true, 
          settings: result.settings || defaultSettings 
        });
      });
      return true; // 保持消息通道开放以支持异步响应
      
    case 'updateSettings':
      // 更新用户设置
      chrome.storage.sync.set({ settings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: '未知操作' });
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // 页面加载完成后，尝试向内容脚本发送消息
    chrome.tabs.sendMessage(tabId, { 
      action: 'tabUpdated',
      tabInfo: { 
        url: tab.url,
        title: tab.title
      } 
    }).catch(error => {
      // 忽略内容脚本未加载的错误
      console.log('内容脚本可能未加载:', error.message);
    });
  }
});

// 监听扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  // 这里可以添加点击图标时的自定义行为
  console.log('插件图标被点击');
});

// 提供API供popup和content使用
globalThis.devHelper = {
  // 清除所有捕获的数据
  clearData: function() {
    capturedRequests = [];
    return { success: true, message: '数据已清除' };
  },
  
  // 获取插件版本
  getVersion: function() {
    return chrome.runtime.getManifest().version;
  }
};