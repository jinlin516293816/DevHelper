// popup.js - 处理弹出页面的交互逻辑

// 显示操作结果提示
function showStatus(message) {
  // 创建临时提示元素
  let statusElement = document.getElementById('operation-status');
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'operation-status';
    statusElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
    `;
    document.body.appendChild(statusElement);
  }
  
  statusElement.textContent = message;
  statusElement.style.display = 'block';
  
  // 3秒后隐藏提示
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// 打开JSON格式化工具
function openJsonFormatter() {
  showStatus('正在打开JSON美化工具...');
  
  try {
    // 在新标签页中打开JSON格式化工具
    chrome.tabs.create({
      url: chrome.runtime.getURL('json-format/index.html'),
      active: true
    }, (tab) => {
      if (tab) {
        showStatus('JSON美化工具已打开');
      } else {
        showStatus('打开失败，请重试');
      }
    });
  } catch (error) {
    showStatus('打开失败: ' + error.message);
    console.error('打开JSON美化工具失败:', error);
  }
}

// 打开文件对比工具
function openFileCompare() {
  showStatus('正在打开文件对比工具...');
  
  try {
    // 在新标签页中打开文件对比工具
    chrome.tabs.create({
      url: chrome.runtime.getURL('file-compare/index.html'),
      active: true
    }, (tab) => {
      if (tab) {
        showStatus('文件对比工具已打开');
      } else {
        showStatus('打开失败，请重试');
      }
    });
  } catch (error) {
    showStatus('打开失败: ' + error.message);
    console.error('打开文件对比工具失败:', error);
  }
}

// 打开正则公式速查工具
function openRegexTools() {
  showStatus('正在打开正则公式速查...');
  
  try {
    // 在新标签页中打开正则公式速查工具
    chrome.tabs.create({
      url: chrome.runtime.getURL('regex-tools/index.html'),
      active: true
    }, (tab) => {
      if (tab) {
        showStatus('正则公式速查已打开');
      } else {
        showStatus('打开失败，请重试');
      }
    });
  } catch (error) {
    showStatus('打开失败: ' + error.message);
    console.error('打开正则公式速查失败:', error);
  }
}

// 打开颜色工具
function openColorTools() {
  showStatus('正在打开颜色工具...');
  
  try {
    // 在新标签页中打开颜色工具
    chrome.tabs.create({
      url: chrome.runtime.getURL('color-tools/index.html'),
      active: true
    }, (tab) => {
      if (tab) {
        showStatus('颜色工具已打开');
      } else {
        showStatus('打开失败，请重试');
      }
    });
  } catch (error) {
    showStatus('打开失败: ' + error.message);
    console.error('打开颜色工具失败:', error);
  }
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('openJsonFormatter').addEventListener('click', openJsonFormatter);
  document.getElementById('openFileCompare').addEventListener('click', openFileCompare);
  document.getElementById('openRegexTools').addEventListener('click', openRegexTools);
});