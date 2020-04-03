function createOption(ele, data, callbacks) {
    this.containerEle = ele; // 存放排序元素的容器
    this.data = data; //选项数据
    this.callbacks = callbacks; //所需要监听的事件回调
    this.listEles = []; //所有选项元素
    this.currOptionEle; //当前触发触摸事件的元素

    var _self = this;
    var events = ['touchstart', 'touchmove', 'touchend'] //给每个选项所需添加的事件

    this.createItem = function(text, index) {
        var li = document.createElement('li');
        var textEle = document.createElement('span');
        var prefixOrder = document.createElement('span'); //前缀序号
        var suffixIcon = document.createElement('i'); //后缀icon

        // li.setAttribute('id', index)
        _self.updataPosition(li, index)
            // li.style.top = index * 50 + 'px';
        this.containerEle.setAttribute('class', 'container')
            // prefixOrder.appendChild(document.createTextNode(index + 1))
        _self.updataSortAndId(li, prefixOrder, index)
        prefixOrder.setAttribute('class', 'po')

        textEle.appendChild(document.createTextNode(text))
        textEle.setAttribute('class', 'text')

        suffixIcon.setAttribute('class', 'si')

        li.appendChild(prefixOrder)
        li.appendChild(textEle)
        li.appendChild(suffixIcon)

        this.addEvent(li)
    }

    this.updataPosition = function(li, index) {
        li.style.top = (index * 50) + 'px';
    }

    this.updataSortAndId = function(li, prefixOrder, index) {
        prefixOrder.childNodes[0] instanceof Node && prefixOrder.removeChild(prefixOrder.childNodes[0]);
        prefixOrder.appendChild(document.createTextNode(index + 1))
        li.setAttribute('id', index)
    }

    this.init = function(li) {
        this.containerEle.appendChild(li)
    }

    this.addEvent = function(li) {
            events.forEach(function(item) {
                li.addEventListener(item, _self.handle)
            });
            this.listEles.push(li);
            _self.init(li);
        }
        // 处理touch事件
    this.handle = function(event) {
        switch (event.type) {
            case 'touchstart':
                _self.touchstart(event)
                break;
            case 'touchmove':
                _self.touchmove(event)
                break;
            case 'touchend':
                _self.touchend(event)
                break;
            default:
                break
        }
    }

    var pointInitPosition = 0; //开始触碰时触点相对于外层容ul的初始位置
    var pointCurrPosition = 0; //触碰点移动时触点相对于外层容器ul的位置
    var currElementPosition = 0; //当前触碰元素相对于外层容器的初始距离

    var ruleNumber = /-?\d+/g; //获取li元素到ul元素的距离时会带上px，当前将匹配正式或者负数
    this.touchstart = function(e) {
        this.currOptionEle = this.listEles.filter(function(item) {
            return item.id === e.target.id
        })[0]
        this.currOptionEle.classList.add('activity');
        pointInitPosition = e.touches[0].clientY - this.containerEle.offsetTop;
        currElementPosition = Number(this.currOptionEle.style.top.match(ruleNumber)[0])
    }
    this.touchmove = function(e) {
        pointCurrPosition = e.touches[0].clientY - this.containerEle.offsetTop;
        var tempTop = currElementPosition + pointCurrPosition - pointInitPosition;
        var tempHeight = this.currOptionEle.offsetHeight
        if (tempTop > 0 && tempTop < tempHeight * (this.data.length - 1)) this.currOptionEle.style.top = tempTop + 'px'
        this.collisionDetection(tempTop, tempHeight)
    }
    this.touchend = function(e) {
        this.listEles.forEach(function(item) {
            if (item.nodeName === 'LI') item.setAttribute('class', '')
        })
        this.updataPosition(_self.currOptionEle, _self.currOptionEle.id)
    }

    // 检测碰撞
    this.collisionDetection = function(tempTop, tempHeight) {
        this.listEles.forEach(function(item, index) {
            var itemTop = Number(item.style.top.match(ruleNumber)[0]);
            //检测是否有碰撞元素
            /**
             * 这一部分逻辑花了我大概五六个小时
             * 错误记录
             * ①上下碰撞检测判断有误只考虑到了下移碰撞的情况未考虑上移碰撞
             * ②获取itemTop值的时候获取到的是一个字符串导致相加后再进行大小判断出现错误
             * ③在向下移动执行top更改的时候 在执行的过程中也会同时进入向上移动的判断导致位置更换之后又会改回去
             * ④位置更换判断只考虑了中间值 导致当缓慢移动到中间位置时元素会快速上下切换
             */
            if (tempTop + tempHeight < itemTop || tempTop > itemTop + tempHeight || item.id === _self.currOptionEle.id) {} else {
                // if (tempTop + tempHeight > itemTop && tempTop + tempHeight < itemTop + tempHeight && _self.currOptionEle.id !== item.id) {
                //当前元素与下一个元素碰撞

                // console.log(item.id, '-', _self.currOptionEle.id, '-itemTop', itemTop, '-tempHeight', tempHeight, '-tempTop', tempTop)
                // console.log(tempTop + tempHeight - itemTop > tempHeight / 2 && item.id > _self.currOptionEle.id)
                if (item.id > _self.currOptionEle.id && (tempTop + tempHeight - itemTop > (tempHeight / 2) + 5)) {
                    _self.updataPosition(item, item.id - 1)
                    _self.updataSortAndId(item, item.childNodes[0], item.id - 1)
                    _self.updataSortAndId(_self.currOptionEle, _self.currOptionEle.childNodes[0], Number(_self.currOptionEle.id) + 1)
                    return
                }
                //当前元素与上一个元素碰撞
                if (item.id < _self.currOptionEle.id && (itemTop + tempHeight - tempTop > (tempHeight / 2) - 5)) {
                    _self.updataPosition(item, Number(item.id) + 1)
                    _self.updataSortAndId(item, item.childNodes[0], Number(item.id) + 1)
                    _self.updataSortAndId(_self.currOptionEle, _self.currOptionEle.childNodes[0], _self.currOptionEle.id - 1)
                }

            }
        })
    }

    if (Array.isArray(this.data) && this.data.length > 0) {
        this.data.forEach(function(text, index) {
            _self.createItem(text, index)
        })
    }

}