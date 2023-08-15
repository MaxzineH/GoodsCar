// function UIGoods(g) {
//     this.data = g;
//     this.choose = 0;
// }

// //获取总价
// UIGoods.prototype.getTotalPrice = function() {
//     return this.data.price * this.choose;
// }
// //是否选中了此件商品
// UIGoods.prototype.isChoose = function() {
//     return this.choose > 0;
// }

//es6构造函数
//单个商品的数据
class UIGoods {
    constructor(g) {
        this.data = g;
        this.choose = 0;
    }
    //获取总价
    getTotalPrice() {
        return this.data.price * this.choose;
    }

    //是否选中了此件商品
    isChoose() {
        return this.choose > 0;
    }

    //选择的数量+1
    increase() {
        return this.choose++;
    }

    //选择的数量-1
    decrease() {
        if (this.choose === 0) {
            return;
        }
        return this.choose--;
    }
}

//整个界面的数据
class UIData {
    constructor() {
        var uiGoods = [];
        for (var i = 0; i < goods.length; i++) {
            var uig = new UIGoods(goods[i]);
            uiGoods.push(uig);
        }
        // console.log(uiGoods);
        this.uiGoods = uiGoods;
        this.deliveryPrice = 5;
        this.deliveryThreshold = 30;
    }

    getTotalPrice() {
        var sum = 0;
        this.uiGoods.map(function (val, index, arr) {
            sum += val.getTotalPrice()
        })
        return sum;
    }

    //增加某件商品的选中数量
    increase(index) {
        this.uiGoods[index].increase();
    }

    //减少某件商品的选中数量
    decrease(index) {
        this.uiGoods[index].decrease();
    }

    //得到总共的选中数量
    getTotalChooseNumber() {
        var sum = 0;
        this.uiGoods.map(function (val, index, arr) {
            sum += val.choose;
        })
        return sum
    }

    //购物车里是否有商品
    hasGoodsInCar() {
        return this.getTotalChooseNumber() > 0
    }

    //是否达到配送门槛
    isCrossDeliveryThreshold() {
        return this.getTotalPrice() >= this.deliveryThreshold
    }

    isChoose(index) {
        return this.uiGoods[index].isChoose();
    }
}

//整个界面
class UI {
    constructor() {
        this.uiData = new UIData();
        this.doms = {
            goodsContainer: document.querySelector('.food-list'),
            deliveryPrice: document.querySelector('.price-delivery'),
            footerPay: document.querySelector('.check'),
            totalPrice: document.querySelector('.price-sum'),
            totalItem: document.querySelector('.item-total'),
            carIcon: document.querySelector('.car-icon'),
        }

        var carRect = this.doms.carIcon.getBoundingClientRect();
        var jumpTarget = {
            x: carRect.left + carRect.width / 2,
            y: carRect.top + carRect.height / 5,
        }
        this.jumpTarget = jumpTarget;

        this.createHTML();
        this.updateFooter();
        this.listenEvent();
    }

    //监听各种事件
    listenEvent() {
        this.doms.carIcon.addEventListener('animationend', function () {
            this.classList.remove('car-shake')
        })
    }

    createHTML() {
        var html = '';
        for (var i = 0; i < this.uiData.uiGoods.length; i++) {
            var g = this.uiData.uiGoods[i];

            html += `<div class="food-item">
                <img class="item-img" src="${g.data.pic}" />
                <div class="item-info-content">
                    <div class="item-h1">${g.data.title}</div>
                    <div class="item-h2">${g.data.desc}</div>
                    <div class="item-h3">月销&nbsp;${g.data.sellNumber}&nbsp;&nbsp;好评率&nbsp;${g.data.favorRate}%</div>
                    <div class="item-num">
                        <div class="item-price">￥${g.data.price}</div>
                        <div class="item-icon-list">
                            <div class="not-show">
                                <div class="icon-list-left">
                                    <img index=${i} class="item-icon icon-min" src="./assets/minus.png" />
                                    <span class="item-num-span">${g.choose}</span>
                                </div>
                            </div>
                            <img index=${i} class="item-icon icon-plus" src="./assets/plus.png" />
                        </div>
                    </div>
                </div>
            </div>`
        }
        this.doms.goodsContainer.innerHTML = html;
    }

    increase(index) {
        this.uiData.increase(index);
        this.updateGoodsItem(index);
        this.updateFooter();
        this.jump(index);
    }

    decrease(index) {
        this.uiData.decrease(index);
        this.updateGoodsItem(index);
        this.updateFooter();
    }

    //更新某个商品元素的显示状态
    updateGoodsItem(index) {
        var goodsDom = this.doms.goodsContainer.children[index];
        // console.log(this.uiData)
        if (this.uiData.isChoose(index)) {
            goodsDom.classList.add("active");
        } else {
            goodsDom.classList.remove("active");
        }

        var span = goodsDom.querySelector(".item-icon-list span");
        span.textContent = this.uiData.uiGoods[index].choose;
    }

    //更新页脚
    updateFooter() {
        var total = this.uiData.getTotalPrice();
        this.doms.deliveryPrice.textContent = `配送费￥${this.uiData.deliveryPrice}`;
        //设置起送费还差多少
        if (this.uiData.isCrossDeliveryThreshold()) {
            this.doms.footerPay.classList.add('check-active')
            this.doms.footerPay.textContent = `去结算`
        } else {
            this.doms.footerPay.classList.remove('check-active')

            //更新还差多少钱
            var dis = Math.round(this.uiData.deliveryThreshold - total);
            this.doms.footerPay.textContent = `还差￥${dis}起送`
        }

        //设置总价
        this.doms.totalPrice.textContent = `￥${total.toFixed(2)}`
        //设置商品总数
        this.doms.totalItem.textContent = this.uiData.getTotalChooseNumber();
        //设置购物车样式状态
        if (this.uiData.hasGoodsInCar()) {
            this.doms.carIcon.classList.add('car-active')
        } else {
            this.doms.carIcon.classList.remove('car-active')
        }
    }

    //购物车动画
    carAnimation() {
        this.doms.carIcon.classList.add('car-shake')
    }

    //抛物线跳跃的元素
    jump(index) {
        //找到对应商品的加号
        var btnAdd = this.doms.goodsContainer.children[index].querySelector('.icon-plus')
        var rect = btnAdd.getBoundingClientRect();
        var start = {
            x: rect.left,
            y: rect.top
        }

        //跳吧
        var div = document.createElement('div');
        div.className = 'add-to-car';
        var img = document.createElement('img');
        img.src = './assets/plus.png'
        img.className = 'item-icon'
        //设置初始位置
        div.style.transform = `translateX(${start.x}px)`
        img.style.transform = `translateY(${start.y}px)`
        div.appendChild(img)
        document.body.appendChild(div)
        //强制渲染
        div.clientWidth;

        //设置结束位置
        div.style.transform = `translateX(${this.jumpTarget.x}px)`
        img.style.transform = `translateY(${this.jumpTarget.y}px)`

        var that = this;
        div.addEventListener('transitionend',function(){
            div.remove();
            that.carAnimation();

        },{
            once: true,//事件仅触发一次
        })
    }
}

// var uig = new UIGoods();
// var ui = new UIData();
var ui = new UI();
// console.log(ui)

//事件
ui.doms.goodsContainer.addEventListener('click',function(e){
    if(e.target.classList.contains('icon-plus')) {
        var index = +e.target.getAttribute('index');
        ui.increase(index);
    } else if(e.target.classList.contains('icon-min')){
        var index = +e.target.getAttribute('index');
        ui.decrease(index);
    }
})
