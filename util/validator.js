// 表单校验 - 策略模式

// 策略对象
const strategies = {
    isEmpty(value, errorMsg) {
        return value === '' ? void 0 : errorMsg;
    },
    minLength(value, length, errorMsg) {
        return value.length < length ? void 0 : errorMsg;
    },
    maxLength(value, length, errorMsg) {
        return value.length > length ? void 0 : errorMsg;
    },
    isUserName(value, errorMsg) {
        return /[a-zA-Z0-9_\u4e00-\u9fa5]{2,10}/.test(value) ? void 0 : errorMsg;
    },
    isMoblie(value, errorMsg) {
        return !/^1(3|5|7|8|9)[0-9]{9}$/.test(value) ? void 0 : errorMsg;
    },
    isEmail(value, errorMsg) {
        return !/^\w+([+-.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value) ? void 0 : errorMsg;
    }
}

class Validator {
    constructor() {
        this.validationFns = [];    // 校验函数
    }
    add(value, rules) {
        for (let rule of rules) {
            let strategyAry = rule.strategy.split(':'); // such as ['minLength', 6]
            let strategy = strategyAry[0];
            let limitLen = strategyAry[1];
            let errorMsg = rule.errorMsg;   // such as '用户名不能为空'
            this.validationFns.push(() => {
                if (limitLen) {
                    return strategies[strategy](value, limitLen, errorMsg);
                } else {
                    return strategies[strategy](value, errorMsg);
                }
            });
        }
    }
    start() {
        for (let validationFn of this.validationFns) {
            let errorMsg = validationFn();
            if (errorMsg) {
                return errorMsg;
            }
        }
    }
}
export default Validator;