// DevHelper Homepage JavaScript

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // 立即确保页面可见，避免空白
    document.body.style.visibility = 'visible';
    
    // 延迟初始化非关键功能
    setTimeout(() => {
        initializeHomepage();
        setupIntersectionObserver();
        setupNavigation();
        setupToolCards();
    }, 50);
});

// 确保页面加载时立即可见
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';
});

function initializeHomepage() {
    console.log('Initializing DevHelper homepage...');
    
    // Add loading animation to buttons
    addLoadingStates();
    
    // Setup intersection observer for fade-in animations
    setupIntersectionObserver();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
}

// Show tool launcher modal
function showToolLauncher() {
    const modal = createModal('DevHelper 工具启动器', `
        <div class="tool-launcher">
            <p>选择要使用的工具：</p>
            <div class="launcher-buttons">
                <button class="btn btn-primary" onclick="openTool('colors'); closeModal();">
                    <i class="fas fa-palette"></i>
                    颜色提取工具
                </button>
                <button class="btn btn-primary" onclick="openTool('json-format'); closeModal();">
                    <i class="fas fa-code"></i>
                    JSON格式化工具
                </button>
                <button class="btn btn-primary" onclick="openTool('file-compare'); closeModal();">
                    <i class="fas fa-file-alt"></i>
                    文件对比工具
                </button>
                <button class="btn btn-primary" onclick="openTool('regex-tools'); closeModal();">
                    <i class="fas fa-search"></i>
                    正则表达式工具
                </button>
            </div>
            <div class="launcher-actions" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e4e8;">
                <p class="modal-note" style="margin-bottom: 15px;">
                    <i class="fas fa-download"></i>
                    还没有安装DevHelper扩展？
                </p>
                <a href="https://github.com/jinlin516293816/DevHelper" target="_blank" class="btn btn-secondary btn-large" style="width: 100%; text-align: center; text-decoration: none;">
                    <i class="fas fa-download"></i>
                    免费下载扩展
                </a>
            </div>
            <p class="modal-note">
                <i class="fas fa-info-circle"></i>
                提示：可直接使用快捷键或点击工具按钮
            </p>
        </div>
    `);
}

// Open a specific tool
function openTool(toolName) {
    console.log(`Opening tool: ${toolName}`);
    
    try {
        // 直接打开工具页面
        fallbackOpenTool(toolName);
    } catch (error) {
        console.log('Error:', error);
        fallbackOpenTool(toolName);
    }
}

// Fallback method to open tools directly in new tab
function fallbackOpenTool(toolName) {
    const toolPaths = {
        'colors': 'colors/index.html',
        'json-format': 'json-format/index.html',
        'file-compare': 'file-compare/index.html',
        'regex-tools': 'regex-tools/index.html'
    };
    
    const toolPath = toolPaths[toolName];
    if (toolPath) {
        window.open(toolPath, '_blank');
    } else {
        console.error(`Unknown tool: ${toolName}`);
    }
}

// Show shortcuts for a tool
function showShortcuts(toolName) {
    const shortcuts = {
        'colors': 'Ctrl+Shift+E (Windows/Linux) / Command+Shift+E (Mac)',
        'json-format': 'Ctrl+Shift+J (Windows/Linux) / Command+Shift+J (Mac)',
        'file-compare': 'Ctrl+Shift+C (Windows/Linux) / Command+Shift+C (Mac)',
        'regex-tools': 'Ctrl+Shift+R (Windows/Linux) / Command+Shift+R (Mac)'
    };
    
    const shortcut = shortcuts[toolName];
    if (shortcut) {
        // showNotification(`快捷键提示：${shortcut}`, 'info');
    }
}

// Create modal dialog
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add modal styles if not already added
    if (!document.querySelector('#modal-styles')) {
        addModalStyles();
    }
    
    return modal;
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        addNotificationStyles();
    }
}

// Close notification
function closeNotification(element) {
    const notification = element.closest('.notification');
    if (notification) {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Add button loading states
function addLoadingStates() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (!button.hasAttribute('data-original-text')) {
            button.setAttribute('data-original-text', button.innerHTML);
        }
        
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = this.getAttribute('data-original-text');
                }, 2000);
            }
        });
    });
}

// Setup intersection observer for fade-in animations
let animationObserver = null;

function setupIntersectionObserver() {
    // 断开现有观察者
    if (animationObserver) {
        animationObserver.disconnect();
    }
    
    // 为尚未添加visible类的fade-in元素创建观察者
    const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 观察所有fade-in元素
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // 存储观察者
    animationObserver = observer;
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时，重新初始化动画
        setTimeout(() => {
            setupIntersectionObserver();
        }, 100);
    }
});

// Setup navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Setup smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup tool card interactions
function setupToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolName = this.getAttribute('data-tool');
            if (toolName) {
                openTool(toolName);
            }
        });
        
        // Add hover effect for tool shortcuts
        card.addEventListener('mouseenter', function() {
            const toolName = this.getAttribute('data-tool');
            if (toolName) {
                showShortcuts(toolName);
            }
        });
    });
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // ESC key to close modals
        if (e.key === 'Escape') {
            closeModal();
            const notification = document.querySelector('.notification');
            if (notification) {
                closeNotification(notification);
            }
        }
        
        // Ctrl+Shift+T to show tool launcher
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            showToolLauncher();
        }
    });
}

// Add modal styles
function addModalStyles() {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            animation: fadeIn 0.3s ease-in-out forwards;
        }
        
        .modal {
            background: white;
            border-radius: 12px;
            padding: 0;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            transform: scale(0.7);
            animation: scaleIn 0.3s ease-in-out forwards;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e1e5e9;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px 12px 0 0;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .modal-close:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .modal-content {
            padding: 24px;
        }
        
        .tool-launcher {
            text-align: center;
        }
        
        .launcher-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin: 20px 0;
        }
        
        .launcher-buttons .btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            font-size: 14px;
        }
        
        .modal-note {
            margin-top: 16px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6c757d;
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            to { transform: scale(1); }
        }
    `;
    
    document.head.appendChild(style);
}

// Add notification styles
function addNotificationStyles() {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            transform: translateX(100%);
            animation: slideIn 0.3s ease-in-out forwards;
        }
        
        .notification-info {
            border-left: 4px solid #007bff;
        }
        
        .notification-success {
            border-left: 4px solid #28a745;
        }
        
        .notification-warning {
            border-left: 4px solid #ffc107;
        }
        
        .notification-error {
            border-left: 4px solid #dc3545;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
        }
        
        .notification-message {
            flex: 1;
            font-size: 14px;
            color: #333;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 4px;
            margin-left: 12px;
            border-radius: 4px;
            transition: color 0.2s;
        }
        
        .notification-close:hover {
            color: #333;
            background-color: #f5f5f5;
        }
        
        @keyframes slideIn {
            to { transform: translateX(0); }
        }
        
        @keyframes slideOut {
            to { transform: translateX(100%); }
        }
    `;
    
    document.head.appendChild(style);
}

// Export functions for global access
window.showToolLauncher = showToolLauncher;
window.openTool = openTool;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.closeNotification = closeNotification;