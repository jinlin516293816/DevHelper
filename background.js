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
  
  // 创建Mock工具菜单项
  chrome.contextMenus.create({
    id: 'openMockTool',
    parentId: 'devHelperMain',
    title: '打开Mock工具',
    contexts: ['page', 'selection', 'link']
  });
}

// 网络请求监控
let networkCaptureActive = false;
let capturedRequests = [];

// 请求日志存储 - 保存所有页面请求
let requestLogs = [];
const MAX_REQUEST_LOGS = 5000; // 限制日志数量，避免内存溢出

// Mock功能相关状态
let mockEnabled = false;
let mockRules = [];

// 存储用户偏好设置
const defaultSettings = {
  enableAutoCapture: false,
  highlightTimeout: 3000,
  logLevel: 'info',
  mockEnabled: false,
  enableRequestLogging: true // 添加请求日志开关
};

// 当前设置
let settings = defaultSettings;

// 初始化设置
chrome.runtime.onInstalled.addListener((details) => {
  console.log('DevHelper 插件已安装/更新:', details.reason);
  
  // 初始化存储设置
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['settings'], (result) => {
      if (!result.settings) {
        chrome.storage.local.set({ settings: defaultSettings });
      }
    });
    
    // 初始化Mock规则存储
    chrome.storage.local.get(['mockRules'], (result) => {
      if (!result.mockRules) {
        chrome.storage.local.set({ mockRules: [] });
      } else {
        mockRules = result.mockRules;
      }
    });
  }
  
  // 注册网络请求监听器
  setupNetworkListeners();
  
  // 创建右键菜单
  createContextMenus();
});

// 从存储中加载Mock规则和设置
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['mockRules', 'settings'], (result) => {
    if (result.mockRules) {
      mockRules = result.mockRules;
    }
    if (result.settings) {
      settings = result.settings;
      if (result.settings.mockEnabled !== undefined) {
        mockEnabled = result.settings.mockEnabled;
      }
    }
    // 已在上面处理设置加载
  });
}

// 监听存储变化，更新Mock状态
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.settings && changes.settings.newValue) {
        const newSettings = changes.settings.newValue;
        if (newSettings.mockEnabled !== undefined && newSettings.mockEnabled !== mockEnabled) {
          mockEnabled = newSettings.mockEnabled;
          // 发送消息给所有标签页，更新Mock开关状态
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'toggleMock',
                  enabled: mockEnabled
                });
              }
            });
          });
        }
      }
      if (changes.mockRules && changes.mockRules.newValue) {
        mockRules = changes.mockRules.newValue;
        // 发送消息给所有标签页，更新Mock规则
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, {
                action: 'updateMockRules',
                rules: mockRules
              });
            }
          });
        });
      }
    }
  });
}

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
    case 'openMockTool':
      // 在新标签页中打开Mock工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('mock/dist/index.html'),
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
    case 'open_mock_tool':
      // 在新标签页中打开Mock工具
      chrome.tabs.create({
        url: chrome.runtime.getURL('mock/dist/index.html'),
        active: true
      });
      break;
  }
});

// 设置网络请求监听器
function setupNetworkListeners() {
  // 监听网络请求（用于捕获和Mock）
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      // 捕获请求
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
      
      // Mock拦截逻辑
      if (mockEnabled) {
        const mockRule = findMatchingMockRule(details.url, details.method);
        if (mockRule) {
          console.log('匹配到Mock规则:', mockRule.name, 'URL:', details.url);
          
          // 阻止原始请求，返回Mock数据
          return {
            redirectUrl: `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(mockRule.response))}`
          };
        }
      }
    },
    { urls: ['<all_urls>'] },
    ['blocking'] // 需要blocking权限来拦截请求
  );
  
  // 监听响应
  chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (networkCaptureActive) {
        // 查找匹配的请求并更新响应信息
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

// 查找匹配的Mock规则 - 与injected.js保持一致的匹配逻辑
function findMatchingMockRule(url, method) {
  for (const rule of mockRules) {
    // 检查规则是否启用
    if (!rule.enabled) continue;
    
    // 检查方法匹配
    if (rule.method && rule.method.toUpperCase() !== method.toUpperCase() && rule.method !== 'ALL') {
      continue;
    }
    
    // 检查URL匹配
    const urlPattern = rule.urlPattern;
    if (!urlPattern) continue;
    
    // 根据匹配类型进行URL匹配
    const patternType = rule.urlPatternType || 'contains';
    let urlMatch = false;
    
    switch (patternType) {
      case 'contains':
        urlMatch = url.includes(urlPattern);
        break;
      case 'exact':
        urlMatch = url === urlPattern;
        break;
      case 'startsWith':
        urlMatch = url.startsWith(urlPattern);
        break;
      case 'endsWith':
        urlMatch = url.endsWith(urlPattern);
        break;
      case 'regex':
        try {
          const regex = new RegExp(urlPattern);
          urlMatch = regex.test(url);
        } catch (e) {
          console.error('Invalid regex in mock rule:', e);
          continue;
        }
        break;
      default:
        urlMatch = url.includes(urlPattern);
    }
    
    if (urlMatch) {
      return rule;
    }
  }
  return null;
}

// 处理来自popup和content脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message.action, '来自:', sender.tab ? sender.tab.url : 'background');
  
  // 确保消息有action属性
  if (!message.action) {
    console.error('收到无action属性的消息:', message);
    sendResponse({ 
      success: false, 
      error: '消息缺少action属性',
      receivedMessage: message 
    });
    return false;
  }
  
  // 支持的action列表
  const supportedActions = ['startNetworkCapture', 'stopNetworkCapture', 'getCapturedRequests', 'pageLoaded', 
                          'getSettings', 'updateSettings', 'getMockRules', 'updateMockRules', 
                          'toggleMock', 'openMockTool', 'injectCss', 'removeCss'];
  
  switch (message.action) {
    case 'startNetworkCapture':
      networkCaptureActive = true;
      capturedRequests = [];
      sendResponse({ success: true, message: '网络捕获已启用' });
      return false;
      
    case 'stopNetworkCapture':
      networkCaptureActive = false;
      sendResponse({ 
        success: true, 
        message: '网络捕获已禁用',
        capturedRequests: capturedRequests
      });
      return false;
      
    case 'getCapturedRequests':
      sendResponse({
        success: true,
        requests: capturedRequests,
        isActive: networkCaptureActive
      });
      return false;
      
    case 'pageLoaded':
      // 记录页面加载事件
      console.log('页面已加载:', message.data);
      sendResponse({ success: true });
      return false;
      
    case 'getSettings':
      // 获取用户设置
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['settings'], (result) => {
          sendResponse({ 
            success: true, 
            settings: result.settings || defaultSettings 
          });
        });
      } else {
        sendResponse({ 
          success: true, 
          settings: defaultSettings 
        });
      }
      return true; // 保持消息通道开放以支持异步响应
      
    case 'updateSettings':
      // 更新用户设置
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ settings: message.settings }, () => {
          // 如果更新了mockEnabled设置，同步到内存中
          if (message.settings.mockEnabled !== undefined) {
            mockEnabled = message.settings.mockEnabled;
          }
          sendResponse({ success: true });
        });
      } else {
        // 如果更新了mockEnabled设置，同步到内存中
        if (message.settings.mockEnabled !== undefined) {
          mockEnabled = message.settings.mockEnabled;
        }
        sendResponse({ success: true });
      }
      return true;
      
    case 'getMockRules':
      // 获取Mock规则
      sendResponse({
        success: true,
        rules: mockRules,
        enabled: mockEnabled
      });
      return false;
      
    case 'updateMockRules':
      // 更新Mock规则
      try {
        console.log('收到更新Mock规则请求，规则数量:', message.rules ? message.rules.length : '无规则');
        
        // 验证规则数据
        if (!Array.isArray(message.rules)) {
          throw new Error('规则数据必须是数组格式');
        }
        
        mockRules = message.rules;
        
        // 保存到存储
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ mockRules: mockRules }, () => {
            // 检查是否有存储错误
            if (chrome.runtime.lastError) {
              console.error('保存Mock规则到存储失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: '保存规则失败: ' + chrome.runtime.lastError.message 
              });
            } else {
              console.log('Mock规则保存成功，当前规则数量:', mockRules.length);
              sendResponse({ 
                success: true,
                savedCount: mockRules.length,
                message: '规则保存成功' 
              });
            }
          });
        } else {
          console.log('Mock规则更新成功，但未保存到存储（chrome.storage不可用）');
          sendResponse({ 
            success: true,
            savedCount: mockRules.length,
            message: '规则更新成功，但未保存到存储' 
          });
        }
        return true; // 保持消息通道开放以支持异步响应
      } catch (error) {
        console.error('处理Mock规则更新时发生错误:', error);
        sendResponse({ 
          success: false, 
          error: '保存规则失败: ' + error.message 
        });
        return true; // 保持消息通道开放以支持异步响应
      }
      
    case 'toggleMock':
      // 切换Mock功能开关
      mockEnabled = message.enabled;
      // 更新设置中的mockEnabled状态
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['settings'], (result) => {
          const settings = result.settings || defaultSettings;
          settings.mockEnabled = mockEnabled;
          chrome.storage.local.set({ settings: settings }, () => {
            sendResponse({ success: true, enabled: mockEnabled });
          });
        });
      } else {
        sendResponse({ success: true, enabled: mockEnabled });
      }
      return true; // 保持消息通道开放以支持异步响应
      
    case 'requestRecorded':
      // 记录请求日志
      const requestData = message.data;
      // 确保settings.enableRequestLogging有默认值，即使settings未加载
      const enableLogging = settings && typeof settings.enableRequestLogging === 'boolean' ? settings.enableRequestLogging : defaultSettings.enableRequestLogging;
      
      if (enableLogging) {
        requestLogs.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9), // 生成唯一ID
          timestamp: requestData.timestamp || Date.now(),
          url: requestData.url,
          method: requestData.method,
          requestData: requestData.requestData,
          isMocked: requestData.isMocked || false,
          mockRuleId: requestData.mockRuleId,
          mockRuleName: requestData.mockRuleName,
          status: null, // 将在responseRecorded时更新
          statusText: null,
          responseText: null,
          responseTime: null
        });
        
        // 限制日志数量
        if (requestLogs.length > MAX_REQUEST_LOGS) {
          requestLogs.shift(); // 移除最旧的日志
        }
      }
      sendResponse({ success: true });
      return false;
      
    case 'responseRecorded':
      // 更新响应日志
      const responseData = message.data;
      // 确保settings.enableRequestLogging有默认值，即使settings未加载
      const enableResponseLogging = settings && typeof settings.enableRequestLogging === 'boolean' ? settings.enableRequestLogging : defaultSettings.enableRequestLogging;
      
      if (enableResponseLogging) {
        // 尝试找到对应的请求日志
        const logIndex = requestLogs.findIndex(log => 
          log.url === responseData.url && 
          log.method === responseData.method &&
          !log.responseTime // 确保只更新没有响应时间的日志
        );
        
        if (logIndex !== -1) {
          // 更新日志信息
          requestLogs[logIndex].status = responseData.status;
          requestLogs[logIndex].statusText = responseData.statusText;
          requestLogs[logIndex].responseText = responseData.responseText;
          requestLogs[logIndex].responseTime = responseData.timestamp - requestLogs[logIndex].timestamp;
        } else {
          // 如果找不到对应的请求日志，创建一个新的完整日志
          requestLogs.push({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: responseData.timestamp - (responseData.timestamp % 1000), // 估算请求时间
            url: responseData.url,
            method: responseData.method,
            requestData: null,
            isMocked: false,
            mockRuleId: null,
            mockRuleName: null,
            status: responseData.status,
            statusText: responseData.statusText,
            responseText: responseData.responseText,
            responseTime: 0
          });
          
          // 限制日志数量
          if (requestLogs.length > MAX_REQUEST_LOGS) {
            requestLogs.shift();
          }
        }
      }
      sendResponse({ success: true });
      return false;
      
    case 'getAllRequestLogs':
      // 获取所有请求日志
      const request = message.data || {};
      const searchParams = request.searchParams || {};
      const page = request.page || 1;
      const pageSize = request.pageSize || 20;
      
      // 过滤日志
      let filteredLogs = [...requestLogs];
      
      // 根据搜索参数过滤
      if (searchParams.path) {
        filteredLogs = filteredLogs.filter(log => log.url.includes(searchParams.path));
      }
      if (searchParams.method) {
        filteredLogs = filteredLogs.filter(log => log.method === searchParams.method);
      }
      if (searchParams.statusCode) {
        filteredLogs = filteredLogs.filter(log => String(log.status) === String(searchParams.statusCode));
      }
      if (searchParams.ip) {
        // IP过滤在当前实现中不支持，因为没有记录IP
      }
      if (searchParams.timeRange && searchParams.timeRange.length === 2) {
        const startTime = new Date(searchParams.timeRange[0]).getTime();
        const endTime = new Date(searchParams.timeRange[1]).getTime();
        filteredLogs = filteredLogs.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
      }
      
      // 计算总数
      const total = filteredLogs.length;
      
      // 分页
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
      
      sendResponse({
        success: true,
        logs: paginatedLogs,
        total: total
      });
      return false;
      
    case 'clearRequestLogs':
      // 清空请求日志
      requestLogs = [];
      sendResponse({ success: true });
      return false;
      
    case 'exportRequestLogs':
      // 导出请求日志
      sendResponse({
        success: true,
        logs: requestLogs,
        exportTime: new Date().toISOString()
      });
      return false;
      
    case 'openMockTool':
      // 打开Mock工具页面
      chrome.tabs.create({
        url: chrome.runtime.getURL('mock/dist/index.html'),
        active: true
      });
      sendResponse({ success: true });
      return false;
      
    case 'injectCss':
      // 注入CSS到当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('发送CSS注入命令失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: `发送CSS注入命令失败: ${chrome.runtime.lastError.message}`
              });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ success: false, error: '未找到活动标签页' });
        }
      });
      return true;
      
    case 'removeCss':
      // 从当前活动标签页移除CSS
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('发送CSS移除命令失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: `发送CSS移除命令失败: ${chrome.runtime.lastError.message}`
              });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ success: false, error: '未找到活动标签页' });
        }
      });
      return true;
      
    default:
      console.error('收到未知action:', message.action, '来自:', sender.tab ? sender.tab.url : 'background');
      sendResponse({ 
        success: false, 
        error: `未知操作: ${message.action}`,
        unknownAction: message.action,
        availableActions: supportedActions,
        messageDetails: {
          sender: sender.tab ? sender.tab.url : 'background',
          timestamp: new Date().toISOString()
        }
      });
      return false;
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
    requestLogs = [];
    return { success: true, message: '数据已清除' };
  },
  
  // 获取插件版本
  getVersion: function() {
    return chrome.runtime.getManifest().version;
  },
  
  // 请求日志相关API
  requestLogs: {
    // 获取所有请求日志
    getAll: function() {
      return {
        success: true,
        logs: requestLogs,
        total: requestLogs.length
      };
    },
    
    // 清空请求日志
    clear: function() {
      requestLogs = [];
      return { success: true, message: '请求日志已清空' };
    },
    
    // 导出请求日志
    export: function() {
      return {
        success: true,
        logs: requestLogs,
        exportTime: new Date().toISOString()
      };
    }
  },
  
  // Mock相关API
  mock: {
    // 获取Mock状态
    getStatus: function() {
      return { enabled: mockEnabled, rules: mockRules };
    },
    
    // 切换Mock开关
    toggle: function(enabled) {
      mockEnabled = enabled;
      return { success: true, enabled: mockEnabled };
    },
    
    // 更新Mock规则
    updateRules: function(rules) {
      mockRules = rules;
      return { success: true };
    }
  }
};