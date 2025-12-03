// background.js - 浏览器插件的后台服务脚本



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
// 网络捕获相关变量已移除

// 请求日志存储 - 保存所有页面请求
let requestLogs = [];
const MAX_REQUEST_LOGS = 5000; // 限制日志数量，避免内存溢出
let currentLogId = 1; // 用于生成递增的日志ID

// Mock功能相关状态
let mockEnabled = true; // 默认启用Mock功能，与content.js保持一致
let mockRules = [];

// 资源拦截功能相关状态
let resourceInterceptors = [];

// 存储用户偏好设置
const defaultSettings = {
  enableAutoCapture: false,
  highlightTimeout: 3000,
  logLevel: 'info',
  mockEnabled: false,
  enableRequestLogging: true, // 添加请求日志开关
  urlRestrictionEnabled: false, // 是否启用网址限制
  allowedUrls: '' // 允许的网址列表，多个以逗号分隔
};

// 当前设置
let settings = defaultSettings;

// 初始化设置
chrome.runtime.onInstalled.addListener((details) => {

  
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
    
    // 初始化资源拦截规则存储
    chrome.storage.local.get(['resourceInterceptors'], (result) => {
      if (!result.resourceInterceptors) {
        chrome.storage.local.set({ resourceInterceptors: [] });
      } else {
        resourceInterceptors = result.resourceInterceptors;
      }
    });
  }
  
  // 创建右键菜单
  createContextMenus();
});

// 从存储中加载Mock规则、设置和资源拦截规则
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['mockRules', 'settings', 'resourceInterceptors'], (result) => {
    if (result.mockRules) {
      mockRules = result.mockRules;
    }
    if (result.settings) {
      settings = result.settings;
      if (result.settings.mockEnabled !== undefined) {
        mockEnabled = result.settings.mockEnabled;
      }
    }
    if (result.resourceInterceptors) {
      resourceInterceptors = result.resourceInterceptors;
    }
    
    // 网络监听器相关逻辑已移除
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
      
      if (changes.resourceInterceptors && changes.resourceInterceptors.newValue) {
        resourceInterceptors = changes.resourceInterceptors.newValue;
        console.log('资源拦截规则已更新，当前规则数量:', resourceInterceptors.length);
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

// 设置网络请求监听器函数已移除

// 检查URL是否在允许的列表中
function isUrlAllowed(url) {
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

// 资源拦截规则查找函数已移除，随网络捕获功能一起删除

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
  const supportedActions = ['pageLoaded', 
                          'getSettings', 'updateSettings', 'getMockRules', 'updateMockRules', 
                          'toggleMock', 'openMockTool', 'injectCss', 'removeCss', 'injectJs', 'removeJs',
                          'getResourceInterceptors', 'updateResourceInterceptors', 'logMessage'];
  
  switch (message.action) {
    // 网络捕获相关action已移除
      
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
      console.log('[DevHelper] background.js收到getMockRules请求，返回规则数量:', mockRules.length, '当前启用状态:', mockEnabled);
      sendResponse({
        success: true,
        rules: mockRules,
        enabled: mockEnabled
      });
      return false;
      
    case 'updateMockRules':
      // 更新Mock规则
      try {
        console.log('[DevHelper] background.js收到updateMockRules请求，规则数量:', message.rules ? message.rules.length : '无规则');
        
        // 验证规则数据
        if (!Array.isArray(message.rules)) {
          throw new Error('规则数据必须是数组格式');
        }
        
        // 确保规则是可序列化的JSON格式
        let serializableRules;
        try {
          // 使用JSON.parse(JSON.stringify())来深拷贝并去除不可序列化的属性
          serializableRules = JSON.parse(JSON.stringify(message.rules));
          console.log('[DevHelper] 规则序列化成功');
        } catch (serializeError) {
          console.error('[DevHelper] 规则序列化失败:', serializeError);
          throw new Error('规则数据包含不可序列化的内容: ' + serializeError.message);
        }
        
        mockRules = serializableRules;
        console.log('[DevHelper] 更新内存中的Mock规则:', mockRules.length, '条规则');
        
        // 保存到存储
        if (typeof chrome !== 'undefined' && chrome.storage) {
          console.log('[DevHelper] 开始保存Mock规则到存储');
          chrome.storage.local.set({ mockRules: mockRules }, () => {
            // 检查是否有存储错误
            if (chrome.runtime.lastError) {
              console.error('[DevHelper] 保存Mock规则到存储失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: '保存规则失败: ' + chrome.runtime.lastError.message 
              });
            } else {
              console.log('[DevHelper] Mock规则保存成功，当前规则数量:', mockRules.length);
               
              // 广播更新到所有标签页
              console.log('[DevHelper] 开始向所有标签页广播Mock规则更新');
              chrome.tabs.query({}, (tabs) => {
                console.log('[DevHelper] 找到标签页数量:', tabs.length);
                tabs.forEach(tab => {
                  if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
                    console.log('[DevHelper] 向标签页发送updateMockRules消息:', tab.id, tab.url);
                    chrome.tabs.sendMessage(tab.id, {
                      action: 'updateMockRules',
                      rules: mockRules
                    }, (response) => {
                      // 忽略错误，因为有些标签页可能不支持此消息
                      if (response) {
                        console.log('[DevHelper] 标签页', tab.id, '响应:', response);
                      }
                    });
                  } else if (tab.id) {
                    console.log('[DevHelper] 跳过标签页:', tab.id, tab.url ? tab.url : '无URL');
                  }
                });
                console.log('[DevHelper] 所有标签页广播完成');
              });
               
              sendResponse({ 
                success: true,
                savedCount: mockRules.length,
                message: '规则保存成功' 
              });
            }
          });
        } else {
          console.log('[DevHelper] Mock规则更新成功，但未保存到存储（chrome.storage不可用）');
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
      console.log('[DevHelper] background.js收到toggleMock请求，新状态:', message.enabled);
      mockEnabled = message.enabled;
      // 更新设置中的mockEnabled状态
      if (typeof chrome !== 'undefined' && chrome.storage) {
        console.log('[DevHelper] 保存Mock开关状态到存储:', mockEnabled);
        chrome.storage.local.get(['settings'], (result) => {
          const settings = result.settings || defaultSettings;
          settings.mockEnabled = mockEnabled;
          chrome.storage.local.set({ settings: settings }, () => {
            console.log('[DevHelper] Mock开关状态保存成功');
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
          id: currentLogId++, // 使用递增的ID
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
        
        // 同时在控制台输出，便于调试
        if (requestData.isMocked) {
          console.info(`[DevHelper] 拦截请求: ${requestData.method} ${requestData.url}`, 
                       `匹配规则: ${requestData.mockRuleName || requestData.mockRuleId}`);
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
          
          // 在控制台输出响应信息，便于调试
          if (requestLogs[logIndex].isMocked) {
            console.info(`[DevHelper] Mock响应: ${responseData.method} ${responseData.url}`,
                         `状态: ${responseData.status} ${responseData.statusText}`,
                         `耗时: ${requestLogs[logIndex].responseTime}ms`);
          }
        } else {
          // 如果找不到对应的请求日志，创建一个新的完整日志
          const isMockedResponse = responseData.status !== 0 && 
                                  (responseData.statusText !== 'Network Error') && 
                                  (responseData.responseText && responseData.responseText.includes('X-DevHelper'));
          
          requestLogs.push({
            id: currentLogId++, // 使用递增的ID
            timestamp: responseData.timestamp - (responseData.timestamp % 1000), // 估算请求时间
            url: responseData.url,
            method: responseData.method,
            requestData: null,
            isMocked: isMockedResponse,
            mockRuleId: isMockedResponse ? 'unknown' : null,
            mockRuleName: isMockedResponse ? 'Unknown Rule' : null,
            status: responseData.status,
            statusText: responseData.statusText,
            responseText: responseData.responseText,
            responseTime: 0
          });
          
          // 在控制台输出响应信息，便于调试
          if (isMockedResponse) {
            console.info(`[DevHelper] Mock响应 (未匹配到请求日志): ${responseData.method} ${responseData.url}`,
                         `状态: ${responseData.status} ${responseData.statusText}`);
          }
          
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
      
    case 'logMessage':
      // 处理来自content或popup的日志请求
      console.log('[DevHelper]', message.message);
      sendResponse({ success: true });
      return false;
      
    case 'openMockTool':
      // 打开Mock工具页面
      chrome.tabs.create({
        url: chrome.runtime.getURL('mock/dist/index.html'),
        active: true
      });
      sendResponse({ success: true });
      return false;
      
    case 'getResourceInterceptors':
      // 获取资源拦截规则
      sendResponse({
        success: true,
        interceptors: resourceInterceptors
      });
      return false;
      
    case 'updateResourceInterceptors':
      // 更新资源拦截规则
      try {
        console.log('收到更新资源拦截规则请求，规则数量:', message.interceptors ? message.interceptors.length : '无规则');
        console.log('收到的拦截规则:', JSON.stringify(message.interceptors));
        
        // 验证规则数据
        if (!Array.isArray(message.interceptors)) {
          throw new Error('规则数据必须是数组格式');
        }
        
        resourceInterceptors = message.interceptors;
        console.log('资源拦截规则更新成功，当前规则:', JSON.stringify(resourceInterceptors));
        
        // 保存到存储
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ resourceInterceptors: resourceInterceptors }, () => {
            // 检查是否有存储错误
            if (chrome.runtime.lastError) {
              console.error('保存资源拦截规则到存储失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: '保存规则失败: ' + chrome.runtime.lastError.message 
              });
            } else {
              console.log('资源拦截规则保存成功，当前规则数量:', resourceInterceptors.length);
              sendResponse({ 
                success: true,
                savedCount: resourceInterceptors.length,
                message: '规则保存成功' 
              });
            }
          });
        } else {
          console.log('资源拦截规则更新成功，但未保存到存储（chrome.storage不可用）');
          sendResponse({ 
            success: true,
            savedCount: resourceInterceptors.length,
            message: '规则更新成功，但未保存到存储' 
          });
        }
        return true; // 保持消息通道开放以支持异步响应
      } catch (error) {
        console.error('处理资源拦截规则更新时发生错误:', error);
        sendResponse({ 
          success: false, 
          error: '保存规则失败: ' + error.message 
        });
        return true; // 保持消息通道开放以支持异步响应
      }
      
    case 'injectCss':
      // 注入CSS到当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('发送消息到content script失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: `Failed to send message to content script: ${chrome.runtime.lastError.message}`
              });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
        }
      });
      return true;
      
    case 'removeCss':
      // 从当前活动标签页移除CSS
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('发送消息到content script失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: `Failed to send message to content script: ${chrome.runtime.lastError.message}`
              });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
        }
      });
      return true;
      
    case 'injectJs':
      // 注入JS到当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('发送消息到content script失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: `Failed to send message to content script: ${chrome.runtime.lastError.message}`
              });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
        }
      });
      return true;
      
    case 'removeJs':
      // 从当前活动标签页移除JS
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('发送消息到content script失败:', chrome.runtime.lastError);
              sendResponse({ 
                success: false, 
                error: `Failed to send message to content script: ${chrome.runtime.lastError.message}`
              });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
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
// 注意：为了避免全局命名空间污染，仅在需要时才暴露必要的接口
// 可通过 chrome.runtime.getBackgroundPage() 访问这些功能
