// 正则表达式数据库
const regexDatabase = {
    // 验证类
    'email': {
        title: '邮箱验证',
        category: '验证类',
        description: '验证电子邮件地址的合法性，支持@前的各种字符组合，@后必须是域名格式',
        patterns: {
            javascript: '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/',
            python: 'r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"',
            php: '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/',
            java: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        }
    },
    'phone': {
        title: '手机号验证',
        category: '验证类',
        description: '验证中国大陆手机号码，支持最新号段',
        patterns: {
            javascript: '/^1[3-9]\\d{9}$/',
            python: 'r"^1[3-9]\\d{9}$"',
            php: '/^1[3-9]\\d{9}$/',
            java: '^1[3-9]\\d{9}$'
        }
    },
    'tel': {
        title: '固定电话验证',
        category: '验证类',
        description: '验证固定电话号码，支持带区号和不带区号的格式',
        patterns: {
            javascript: '/^(0\\d{2,3}-?)?\\d{7,8}$/',
            python: 'r"^(0\\d{2,3}-?)?\\d{7,8}$"',
            php: '/^(0\\d{2,3}-?)?\\d{7,8}$/',
            java: '^(0\\d{2,3}-?)?\\d{7,8}$'
        }
    },
    'password': {
        title: '密码强度验证',
        category: '验证类',
        description: '密码必须包含大小写字母、数字和特殊字符，长度8-16位',
        patterns: {
            javascript: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/',
            python: 'r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$"',
            php: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/',
            java: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$'
        }
    },
    'postal': {
        title: '邮政编码验证',
        category: '验证类',
        description: '验证中国邮政编码，6位数字',
        patterns: {
            javascript: '/^\\d{6}$/',
            python: 'r"^\\d{6}$"',
            php: '/^\\d{6}$/',
            java: '^\\d{6}$'
        }
    },
    'account': {
        title: '账号验证',
        category: '验证类',
        description: '验证账号，字母开头，允许5-16位，字母数字下划线组合',
        patterns: {
            javascript: '/^[a-zA-Z]\\w{4,15}$/',
            python: 'r"^[a-zA-Z]\\w{4,15}$"',
            php: '/^[a-zA-Z]\\w{4,15}$/',
            java: '^[a-zA-Z]\\w{4,15}$'
        }
    },
    'url': {
        title: 'URL验证',
        category: '验证类',
        description: '验证URL格式，支持http/https/ftp等协议',
        patterns: {
            javascript: '/^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$/',
            python: 'r"^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$"',
            php: '/^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$/',
            java: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$'
        }
    },
    'id-card': {
        title: '身份证验证',
        category: '验证类',
        description: '验证18位身份证号码，包括生日范围和校验码',
        patterns: {
            javascript: '/^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9X]$/',
            python: 'r"^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9X]$"',
            php: '/^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9X]$/',
            java: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9X]$'
        }
    },
    'date': {
        title: '日期验证',
        category: '验证类',
        description: '验证YYYY-MM-DD格式的日期',
        patterns: {
            javascript: '/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/',
            python: 'r"^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$"',
            php: '/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/',
            java: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$'
        }
    },
    'number': {
        title: '数字验证',
        category: '验证类',
        description: '验证数字（整数、小数）',
        patterns: {
            javascript: '/^-?\\d+(\\.\\d+)?$/',
            python: 'r"^-?\\d+(\\.\\d+)?$"',
            php: '/^-?\\d+(\\.\\d+)?$/',
            java: '^-?\\d+(\\.\\d+)?$'
        }
    },
    'chinese': {
        title: '中文字符验证',
        category: '验证类',
        description: '验证中文汉字',
        patterns: {
            javascript: '/[\\u4e00-\\u9fa5]/',
            python: 'r"[\\u4e00-\\u9fa5]"',
            php: '/[\\u4e00-\\u9fa5]/',
            java: '[\\u4e00-\\u9fa5]'
        }
    },
    'strong-password': {
        title: '强密码验证',
        category: '验证类',
        description: '强密码验证，必须包含大小写字母、数字和特殊字符，长度不小于8位',
        patterns: {
            javascript: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/',
            python: 'r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"',
            php: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/',
            java: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
        }
    },
    'version': {
        title: '版本号验证',
        category: '验证类',
        description: '验证版本号格式，如1.0.0',
        patterns: {
            javascript: '/^\\d+(\\.\\d+)*$/',
            python: 'r"^\\d+(\\.\\d+)*$"',
            php: '/^\\d+(\\.\\d+)*$/',
            java: '^\\d+(\\.\\d+)*$'
        }
    },
    'html-tag': {
        title: 'HTML标签验证',
        category: '验证类',
        description: '验证HTML标签格式',
        patterns: {
            javascript: '/<\\/?[a-z][a-z0-9]*[^<>]*>/i',
            python: 'r"<\\/?[a-z][a-z0-9]*[^<>]*>"i',
            php: '/<\\/?[a-z][a-z0-9]*[^<>]*>/i',
            java: '<\\/?[a-z][a-z0-9]*[^<>]*>'
        }
    },
    'ipv4': {
        title: 'IPv4地址验证',
        category: '验证类',
        description: '验证IPv4地址格式',
        patterns: {
            javascript: '/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/',
            python: 'r"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"',
            php: '/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/',
            java: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
        }
    },
    'qq': {
        title: 'QQ号验证',
        category: '验证类',
        description: '验证QQ号，必须是5-11位数字，第一位不能为0',
        patterns: {
            javascript: '/^[1-9][0-9]{4,10}$/',
            python: 'r"^[1-9][0-9]{4,10}$"',
            php: '/^[1-9][0-9]{4,10}$/',
            java: '^[1-9][0-9]{4,10}$'
        }
    },
    // 提取类
    'extract-link': {
        title: '链接提取',
        category: '提取类',
        description: '从文本中提取URL链接',
        patterns: {
            javascript: '/https?:\\/\\/[^\\s]+/g',
            python: 'r"https?:\\/\\/[^\\s]+"g',
            php: '/https?:\\/\\/[^\\s]+/g',
            java: 'https?:\\/\\/[^\\s]+'
        }
    },
    // 替换类
    'remove-whitespace': {
        title: '首尾空格去除',
        category: '替换类',
        description: '去除字符串首尾的空格',
        patterns: {
            javascript: '/^\\s+|\\s+$/g',
            python: 'r"^\\s+|\\s+$"g',
            php: '/^\\s+|\\s+$/g',
            java: '^\\s+|\\s+$'
        }
    },
    'remove-script': {
        title: '去除Script标签',
        category: '替换类',
        description: '去除HTML中的script标签及其内容',
        patterns: {
            javascript: '/<script[^>]*>[\\s\\S]*?<\\/script>/gi',
            python: 'r"<script[^>]*>[\\s\\S]*?</script>"gi',
            php: '/<script[^>]*>[\\s\\S]*?<\\/script>/i',
            java: '<script[^>]*>[\\s\\S]*?</script>'
        }
    },
    'remove-multiple-space': {
        title: '多余空格去除',
        category: '替换类',
        description: '将多个连续空格替换为单个空格',
        patterns: {
            javascript: '/\\s+/g',
            python: 'r"\\s+"g',
            php: '/\\s+/g',
            java: '\\s+'
        }
    },
    'remove-comments': {
        title: '注释去除',
        category: '替换类',
        description: '去除JavaScript注释',
        patterns: {
            javascript: '/\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//mg',
            python: 'r"\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\/"mg',
            php: '/\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//mg',
            java: '\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\/'
        }
    },
    // 格式化类
    'format-amount': {
        title: '金额格式化',
        category: '格式化类',
        description: '金额格式化，每三位添加一个逗号',
        patterns: {
            javascript: '/\\B(?=(\\d{3})+(?!\\d))/g',
            python: 'r"\\B(?=(\\d{3})+(?!\\d))"g',
            php: '/\\B(?=(\\d{3})+(?!\\d))/g',
            java: '\\B(?=(\\d{3})+(?!\\d))'
        }
    },
    'format-date': {
        title: '日期格式化',
        category: '格式化类',
        description: '日期格式化，将YYYYMMDD转换为YYYY-MM-DD',
        patterns: {
            javascript: '/^(\d{4})(\d{2})(\d{2})$/',
            python: 'r"^(\d{4})(\d{2})(\d{2})$"',
            php: '/^(\d{4})(\d{2})(\d{2})$/',
            java: '^(\d{4})(\d{2})(\d{2})$'
        }
    },
    'format-bank-card': {
        title: '银行卡格式化',
        category: '格式化类',
        description: '银行卡号格式化，每四位添加一个空格',
        patterns: {
            javascript: '/(\\d{4})(?=\\d)/g',
            python: 'r"(\\d{4})(?=\\d)"g',
            php: '/(\\d{4})(?=\\d)/g',
            java: '(\\d{4})(?=\\d)'
        }
    },
    'format-id-card': {
        title: '身份证格式化',
        category: '格式化类',
        description: '身份证号格式化，分为1-6位、7-14位、15-17位、18位四段',
        patterns: {
            javascript: '/(\\d{6})(\\d{8})(\\d{3})([0-9X])/',
            python: 'r"(\\d{6})(\\d{8})(\\d{3})([0-9X])"',
            php: '/(\\d{6})(\\d{8})(\\d{3})([0-9X])/',
            java: '(\\d{6})(\\d{8})(\\d{3})([0-9X])'
        }
    },
    // 特殊字符类
    'emoji': {
        title: 'Emoji表情',
        category: '特殊字符类',
        description: '匹配Emoji表情符号',
        patterns: {
            javascript: '/[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/g',
            python: 'r"[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]"g',
            php: '/[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/g',
            java: '[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]'
        }
    },
    'special-char': {
        title: '特殊字符',
        category: '特殊字符类',
        description: '匹配特殊字符',
        patterns: {
            javascript: '/[!@#$%^&*(),.?":{}|<>]/g',
            python: 'r"[!@#$%^&*(),.?\":{}|<>]"g',
            php: '/[!@#$%^&*(),.?":{}|<>]/',
            java: '[!@#$%^&*(),.?":{}|<>]'
        }
    },
    // 新增验证类正则
    'ipv6': {
        title: 'IPv6地址验证',
        category: '验证类',
        description: '验证IPv6地址格式',
        patterns: {
            javascript: '/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/',
            python: 'r"^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$"',
            php: '/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/',
            java: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$'
        }
    },
    'mac-address': {
        title: 'MAC地址验证',
        category: '验证类',
        description: '验证MAC地址格式',
        patterns: {
            javascript: '/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            python: 'r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"',
            php: '/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            java: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'
        }
    },
    'hex-color': {
        title: '十六进制颜色验证',
        category: '验证类',
        description: '验证十六进制颜色值格式，支持#RRGGBB和#RGB格式',
        patterns: {
            javascript: '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
            python: 'r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"',
            php: '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
            java: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        }
    },
    'time': {
        title: '时间验证',
        category: '验证类',
        description: '验证HH:MM:SS格式的时间',
        patterns: {
            javascript: '/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/',
            python: 'r"^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"',
            php: '/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/',
            java: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
        }
    },
    'international-phone': {
        title: '国际手机号验证',
        category: '验证类',
        description: '验证国际手机号码格式',
        patterns: {
            javascript: '/^\+[1-9]\d{1,14}$/',
            python: 'r"^\+[1-9]\d{1,14}$"',
            php: '/^\+[1-9]\d{1,14}$/',
            java: '^\+[1-9]\d{1,14}$'
        }
    },
    'credit-card': {
        title: '信用卡号验证',
        category: '验证类',
        description: '验证信用卡号格式，支持常见信用卡类型',
        patterns: {
            javascript: '/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/',
            python: 'r"^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$"',
            php: '/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/',
            java: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$'
        }
    },
    // 新增提取类正则
    'extract-email': {
        title: '邮箱提取',
        category: '提取类',
        description: '从文本中提取邮箱地址',
        patterns: {
            javascript: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g',
            python: 'r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"g',
            php: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g',
            java: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        }
    },
    'extract-phone': {
        title: '手机号提取',
        category: '提取类',
        description: '从文本中提取中国大陆手机号',
        patterns: {
            javascript: '/1[3-9]\d{9}/g',
            python: 'r"1[3-9]\d{9}"g',
            php: '/1[3-9]\d{9}/g',
            java: '1[3-9]\d{9}'
        }
    },
    'extract-id-card': {
        title: '身份证号提取',
        category: '提取类',
        description: '从文本中提取18位身份证号码',
        patterns: {
            javascript: '/[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]/g',
            python: 'r"[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]"g',
            php: '/[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]/g',
            java: '[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]'
        }
    },
    'extract-date': {
        title: '日期提取',
        category: '提取类',
        description: '从文本中提取YYYY-MM-DD格式的日期',
        patterns: {
            javascript: '/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/g',
            python: 'r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])"g',
            php: '/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/g',
            java: '\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])'
        }
    },
    'extract-number': {
        title: '数字提取',
        category: '提取类',
        description: '从文本中提取数字（包括整数和小数）',
        patterns: {
            javascript: '/-?\d+(\.\d+)?/g',
            python: 'r"-?\d+(\.\d+)?"g',
            php: '/-?\d+(\.\d+)?/g',
            java: '-?\d+(\.\d+)?'
        }
    },
    // 新增替换类正则
    'remove-html-tags': {
        title: '去除HTML标签',
        category: '替换类',
        description: '去除HTML标签，只保留文本内容',
        patterns: {
            javascript: '/<[^>]*>/g',
            python: 'r"<[^>]*>"g',
            php: '/<[^>]*>/g',
            java: '<[^>]*>'
        }
    },
    'remove-css-comments': {
        title: '去除CSS注释',
        category: '替换类',
        description: '去除CSS注释',
        patterns: {
            javascript: '/\/\*[\s\S]*?\*\//g',
            python: 'r"\/\*[\s\S]*?\*\/"g',
            php: '/\/\*[\s\S]*?\*\//g',
            java: '\/\*[\s\S]*?\*\/'
        }
    },
    'remove-html-entities': {
        title: '去除HTML实体',
        category: '替换类',
        description: '去除HTML实体编码，如&lt;、&gt;等',
        patterns: {
            javascript: '/&[a-zA-Z0-9#]+;/g',
            python: 'r"&[a-zA-Z0-9#]+;"g',
            php: '/&[a-zA-Z0-9#]+;/g',
            java: '&[a-zA-Z0-9#]+;'
        }
    },
    'replace-newline': {
        title: '替换换行符',
        category: '替换类',
        description: '将换行符替换为指定字符',
        patterns: {
            javascript: '/[\r\n]+/g',
            python: 'r"[\r\n]+"g',
            php: '/[\r\n]+/g',
            java: '[\r\n]+'
        }
    },
    // 新增格式化类正则
    'format-phone': {
        title: '手机号格式化',
        category: '格式化类',
        description: '将手机号格式化为XXX-XXXX-XXXX格式',
        patterns: {
            javascript: '/(\d{3})(\d{4})(\d{4})/',
            python: 'r"(\d{3})(\d{4})(\d{4})"',
            php: '/(\d{3})(\d{4})(\d{4})/',
            java: '(\d{3})(\d{4})(\d{4})'
        }
    },
    'format-id-card-mask': {
        title: '身份证号脱敏',
        category: '格式化类',
        description: '将身份证号中间8位替换为*号，保护隐私',
        patterns: {
            javascript: '/(\d{6})\d{8}(\d{4})/',
            python: 'r"(\d{6})\d{8}(\d{4})"',
            php: '/(\d{6})\d{8}(\d{4})/',
            java: '(\d{6})\d{8}(\d{4})'
        }
    },
    'format-amount-unformat': {
        title: '金额去格式化',
        category: '格式化类',
        description: '去除金额中的千分位分隔符',
        patterns: {
            javascript: '/,/g',
            python: 'r","g',
            php: '/,/g',
            java: ','
        }
    },
    // 新增特殊字符类正则
    'chinese-string': {
        title: '中文字符串',
        category: '特殊字符类',
        description: '匹配由中文字符组成的字符串',
        patterns: {
            javascript: '/^[\u4e00-\u9fa5]+$/g',
            python: 'r"^[\u4e00-\u9fa5]+$"g',
            php: '/^[\u4e00-\u9fa5]+$/g',
            java: '^[\u4e00-\u9fa5]+$'
        }
    },
    'english-string': {
        title: '英文字符串',
        category: '特殊字符类',
        description: '匹配由英文字符组成的字符串',
        patterns: {
            javascript: '/^[a-zA-Z]+$/g',
            python: 'r"^[a-zA-Z]+$"g',
            php: '/^[a-zA-Z]+$/g',
            java: '^[a-zA-Z]+$'
        }
    },
    'lowercase-string': {
        title: '小写字母字符串',
        category: '特殊字符类',
        description: '匹配由小写英文字符组成的字符串',
        patterns: {
            javascript: '/^[a-z]+$/g',
            python: 'r"^[a-z]+$"g',
            php: '/^[a-z]+$/g',
            java: '^[a-z]+$'
        }
    },
    'uppercase-string': {
        title: '大写字母字符串',
        category: '特殊字符类',
        description: '匹配由大写英文字符组成的字符串',
        patterns: {
            javascript: '/^[A-Z]+$/g',
            python: 'r"^[A-Z]+$"g',
            php: '/^[A-Z]+$/g',
            java: '^[A-Z]+$'
        }
    }
};

// 初始化正则表达式列表
function initRegexList() {
    const regexList = document.getElementById('regexList');
    const languages = ['javascript', 'python', 'php', 'java'];
    
    // 清空列表
    regexList.innerHTML = '';
    
    Object.keys(regexDatabase).forEach(key => {
        const regex = regexDatabase[key];
        
        // 创建regex-item容器
        const regexItem = document.createElement('div');
        regexItem.className = 'regex-item';
        regexItem.dataset.category = regex.category;
        
        // 创建头部容器
        const regexHeader = document.createElement('div');
        regexHeader.className = 'regex-header';
        regexHeader.onclick = () => toggleRegexDrawer(key);
        
        // 创建标题
        const regexTitle = document.createElement('div');
        regexTitle.className = 'regex-title';
        regexTitle.textContent = regex.title;
        
        // 创建分类
        const regexCategory = document.createElement('div');
        regexCategory.className = 'regex-category';
        regexCategory.textContent = regex.category;
        
        // 创建展开/收起按钮
        const drawerToggle = document.createElement('button');
        drawerToggle.className = 'drawer-toggle';
        drawerToggle.innerHTML = '<i class="fa fa-chevron-down"></i>';
        drawerToggle.onclick = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            toggleRegexDrawer(key);
        };
        
        // 创建描述
        const regexDescription = document.createElement('div');
        regexDescription.className = 'regex-description';
        regexDescription.textContent = regex.description;
        
        // 创建抽屉容器
        const regexDrawer = document.createElement('div');
        regexDrawer.className = 'regex-drawer';
        regexDrawer.id = `drawer-${key}`;
        
        // 创建语言标签和模式
        const languageTabs = document.createElement('div');
        languageTabs.className = 'language-tabs';
        
        const languagePatterns = document.createElement('div');
        languagePatterns.className = 'language-patterns';
        
        languages.forEach(lang => {
            // 创建语言标签
            const languageTab = document.createElement('button');
            languageTab.className = 'language-tab';
            languageTab.textContent = lang;
            languageTab.dataset.language = lang;
            
            // 创建语言模式
            const languagePattern = document.createElement('div');
            languagePattern.className = 'language-pattern';
            languagePattern.dataset.language = lang;
            languagePattern.textContent = regex.patterns[lang];
            
            // 点击标签切换显示的模式
            languageTab.addEventListener('click', () => {
                // 移除所有active类
                languageTabs.querySelectorAll('.language-tab').forEach(tab => tab.classList.remove('active'));
                languagePatterns.querySelectorAll('.language-pattern').forEach(pattern => pattern.classList.remove('active'));
                
                // 添加当前active类
                languageTab.classList.add('active');
                languagePattern.classList.add('active');
            });
            
            // 点击模式复制到剪贴板
            languagePattern.addEventListener('click', () => {
                navigator.clipboard.writeText(regex.patterns[lang]).then(() => {
                    showMessage('已复制到剪贴板', 'success');
                }).catch(err => {
                    showMessage('复制失败：' + err.message, 'error');
                });
            });
            
            // 添加到容器
            languageTabs.appendChild(languageTab);
            languagePatterns.appendChild(languagePattern);
        });
        
        // 默认激活第一个语言
        languageTabs.querySelector('.language-tab').classList.add('active');
        languagePatterns.querySelector('.language-pattern').classList.add('active');
        
        // 为所有语言模式添加点击复制功能
        const allPatterns = languagePatterns.querySelectorAll('.language-pattern');
        allPatterns.forEach(pattern => {
            pattern.style.cursor = 'pointer';
            pattern.title = '点击复制正则表达式';
        });
        
        // 将语言标签和模式添加到抽屉
        regexDrawer.appendChild(languageTabs);
        regexDrawer.appendChild(languagePatterns);
        
        // 将元素添加到头部
        regexHeader.appendChild(regexTitle);
        regexHeader.appendChild(regexCategory);
        regexHeader.appendChild(drawerToggle);
        
        // 将所有元素添加到regex-item
        regexItem.appendChild(regexHeader);
        regexItem.appendChild(regexDescription);
        regexItem.appendChild(regexDrawer);
        
        // 将regex-item添加到列表
        regexList.appendChild(regexItem);
    });
}

// 切换正则表达式抽屉
function toggleRegexDrawer(key) {
    const drawer = document.getElementById(`drawer-${key}`);
    const toggleBtn = drawer.previousElementSibling.querySelector('.drawer-toggle');
    
    if (drawer.style.display === 'none' || drawer.style.display === '') {
        drawer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fa fa-chevron-up"></i>';
    } else {
        drawer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fa fa-chevron-down"></i>';
    }
}

// 显示消息
function showMessage(text, type = 'success') {
    const message = document.getElementById('copy-message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.opacity = '1';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        message.style.opacity = '0';
    }, 3000);
}

// 分类筛选
function filterByCategory(category) {
    const regexItems = document.querySelectorAll('.regex-item');
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    // 更新按钮状态
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 筛选regex-item
    regexItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 搜索功能
function searchRegex() {
    const searchTerm = document.getElementById('regexSearch').value.toLowerCase();
    const regexItems = document.querySelectorAll('.regex-item');
    
    regexItems.forEach(item => {
        const title = item.querySelector('.regex-title').textContent.toLowerCase();
        const description = item.querySelector('.regex-description').textContent.toLowerCase();
        const category = item.querySelector('.regex-category').textContent.toLowerCase();
        const patterns = Array.from(item.querySelectorAll('.language-pattern')).map(pattern => pattern.textContent.toLowerCase());
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm) || patterns.some(pattern => pattern.includes(searchTerm))) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 测试正则表达式
function testRegex() {
    const regexInput = document.getElementById('testRegex').value;
    const flagsInput = document.getElementById('testFlags').value;
    const testText = document.getElementById('testText').value;
    const testResult = document.getElementById('testResult');
    
    if (!regexInput) {
        testResult.className = 'test-result error';
        testResult.innerHTML = '<p>请输入正则表达式</p>';
        return;
    }
    
    if (!testText) {
        testResult.className = 'test-result error';
        testResult.innerHTML = '<p>请输入测试文本</p>';
        return;
    }
    
    try {
        // 支持带/分隔符的正则表达式输入
        let pattern = regexInput;
        let flags = flagsInput;
        
        // 检查是否包含/分隔符
        if (/^\/.+\/$/.test(regexInput)) {
            // 提取模式和标志
            const match = regexInput.match(/^\/(.*)\/(.*)$/);
            if (match) {
                pattern = match[1];
                // 如果用户已经在flagsInput中输入了标志，优先使用flagsInput的内容
                if (!flags) {
                    flags = match[2];
                }
            }
        }
        
        const regex = new RegExp(pattern, flags);
        const matches = testText.match(regex);
        
        if (matches) {
            testResult.className = 'test-result success';
            testResult.innerHTML = `
                <div class="result-count">找到 ${matches.length} 个匹配项：</div>
                <div class="result-list">
                    ${matches.map(match => `<div class="result-item">${match}</div>`).join('')}
                </div>
            `;
        } else {
            testResult.className = 'test-result empty';
            testResult.innerHTML = '<p>没有找到匹配项</p>';
        }
    } catch (error) {
        testResult.className = 'test-result error';
        testResult.innerHTML = `<p>正则表达式错误：${error.message}</p>`;
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 默认激活第一个语言
    const firstLanguage = document.querySelector('.language-selector .language-btn');
    if (firstLanguage) {
        firstLanguage.click();
    }

    // 初始化正则列表
    initRegexList();

    // 初始化事件监听
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const language = btn.dataset.language;
            setActiveLanguage(language);
            initRegexList();
        });
    });

    // 分类筛选事件监听
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterByCategory(category);
        });
    });

    // 搜索事件监听
    const searchInput = document.getElementById('regexSearch');
    searchInput.addEventListener('input', searchRegex);

    // 测试按钮事件监听
    const testBtn = document.getElementById('testBtn');
    testBtn.addEventListener('click', testRegex);

    // 为所有.language-pattern元素设置样式和提示
    const languagePatterns = document.querySelectorAll('.language-pattern');
    languagePatterns.forEach(pattern => {
        pattern.style.cursor = 'pointer';
        pattern.title = '点击复制正则表达式';
    });
});