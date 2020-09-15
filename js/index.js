$(function(){
const page_type = $('.contents').attr('id');
const categorys = ['men','woman','kids'];
const param_key = location.search.substring(1).split('=')[0];
const param_value = location.search.substring(1).split('=')[1];



let more_count = {
  'brand': 3,
  'items': 10
}

//もっと見る
function moreControl(el, num){
const more_type = $(el).attr('data-more-btn');
const target_list = $(`[data-more-list="${more_type}"]`)
const max_count = target_list.find('li').length;
more_count[more_type] += num;

//?
target_list.find(`li:lt(${more_count[more_type]})`).fadeIn();
if(more_count[more_type] >= max_count){
  $(el).hide();
}
}

$('[data-more-btn="brand"]').on('click',function(){
  moreControl($(this),3);
});

$('[data-more-btn="items"]').on('click',function(){
  moreControl($(this),10);
});

//評細画面の取得
function getItemSingle(){
 return item_data.find(function(item){
   return item['id'] == param_value;
 });
}



//オブジェクトをHTMLに変換する
//返り値:html
//カートからアイテムを削除
   function createDom(items, delate_btn_flg = null){
		let html_template = '';
		let delate_dom = '';
		if(delate_btn_flg){
    delate_dom = '<div class="cart-delate"><img src="img/icon_delete.svg"></div>';
		}
  items.forEach(function(item,index){
    html_template +=`<li class="item" data-item-id="${item['id']}">
       <a href="main.html?id=${item['id']}">
        <div class="item-cap"><img src="img/item/${item['id']}.png" alt="" loading="lazy">
        </div>
        <div class="item-info">
          <h3 class="item-name">${item['name']}</h3>
          <p class="item-text">${item['text']}</p>
          <div class="item-price">¥${item['price']}</div>
        </div>
       </a>
       ${delate_dom}
      </li>`;
  });
    return html_template;
  }

//フリーワード検索
//検索　金額
  function searchWordShow(){
     let result_text;
    if(param_key == 'price'){
      result_text = `~${param_value}円`;
      $(`.price-select option[value="${param_value}"]`).prop('selected',true);
    }
    else{
      result_text = param_value;
    }
    $('.result-text').text(decodeURI(result_text));
  }




//c-sectionの表示　関数
//カテゴリー検索
//フリーワード検索
function getItemlist(key, value=null){
  const search_value = value? value:param_value;
  const freewords = ['name','text'];
  const items = item_data.filter(function(item,index){
      switch(key){
        case'brand':
        case'category':
         return item[key] == search_value
         break;
      case'freeword':
      return freewords.find(function(freeword){
        return item[freeword].indexOf(decodeURI(param_value)) !==-1
      });
         break;

      case'price':
      return item['price'] <= search_value
     break;

       case'new':
          return item['new']
          break;
      }
    });
    searchWordShow();
    return items;
}



//PICKUP シャッフル　定義
function pickUpShuffle(item_data){
let items = [];
let rand_check = [];
for( let i=0; i<6; i++){
  let j = Math.floor(Math.random() * item_data.length);
  if(rand_check.indexOf(j) !== -1){
    i--;
    continue;
  }else{
    rand_check.push(j);
    items.push(item_data[j]);
  }
}
  return items;
}

//ストレージ1
function doneFlash(text){
  $('body').append(`<div class="flash">${text}</div>`);
  setTimeout(function(){
    location.reload();
  },1000);
}

//ストレージ１
function storageControl(id, storage_type){
let storage_data = JSON.parse(localStorage.getItem(`ninco_${storage_type}`));
id = Number(id);
if(storage_data == null){
  storage_data =[id];
}
else{
  if(storage_data.indexOf(id) !== -1){
    storage_data.splice(storage_data.indexOf(id),1);
  }
  else{
  storage_data.push(id);
}
}
localStorage.setItem(`ninco_${storage_type}`,JSON.stringify(storage_data));
}

function storageSavejudge(id, storage_type){
  let storage_data = JSON.parse(localStorage.getItem(`ninco_${storage_type}`));
  id = Number(id);
  if(storage_data !== null){
    return storage_data.indexOf(id) !== -1;
  }
}

//カートに追加
$('.btn--cart').on('click',function(){
const item_id = $(this).parents('.item-detail').attr('data-item-id');
    storageControl(item_id,'cart');
  if(storageSavejudge(item_id,'cart')){
    doneFlash('カートに追加しました。');


  }
  else{
  doneFlash('カートから外しました。');

  }
});

//カートに入れたアイテムの生成
const cart_storage = JSON.parse(localStorage.getItem('ninco_cart'));
if(cart_storage !== null){
  let cart_price = 0;
  const cart_items = item_data.filter(function(item){
    if(cart_storage.indexOf(item['id']) !== -1){
      cart_price += item['price'];
      return item;
    }
  });

//カートの合計金額を出力
　$('.cart-total-price').text(cart_price+'円');

//カートの合計点数を計算
//cart_storage.length
$('.cart-batch, .cart-total-num').text(cart_storage.length);
if(cart_storage.length<=0){
  $('.cart-batch').hide();
}
  $('#cart-list').append(createDom(cart_items,true));
}else{
  $('.cart-batch').hide();

}

//お気に入りに追加
$('.btn--fav').on('click',function(){
const item_id = $(this).parents('.item-detail').attr('data-item-id');
    storageControl(item_id,'fav');
  if(storageSavejudge(item_id,'fav')){
    doneFlash('お気に入りに追加しました。');
  }
  else{
  doneFlash('お気に入りから外しました。');
  }
});

const fav_storage = JSON.parse(localStorage.getItem('ninco_fav'));
if(fav_storage !== null){
  const fav_items = item_data.filter(function(item){
    if(fav_storage.indexOf(item['id']) !== -1){
      return item;
    }
  });
  $('[data-item-list="fav"]').append(createDom(fav_items));

//お気入りのスライダー
const fav_slide_count=$(window).width() >= 768? 5: 3;
if(fav_items.length > fav_slide_count){
  $('[data-item-list="fav"]').slick({
 arrows:true,
 autoplay:true,
 dots:false,
 speed:1500,
 easing:'swing',
 slidesToShow:3,
 slideToScroll:1,
   prevArrow:'<div class="slide-btn prev-btn"></div>',
   nextArrow:'<div class="slide-btn next-btn"></div>',

   responsive:[
     {
     breakpoint:768,
     settings:{
       centerPadding:'0%',
       slidesToShow:3,
       slideToScroll:1,
     }
   }]
  });
}
}




//TOPSLIDER
  $('.top-slider').slick({
    arrows:true,
    autoplay:true,
    dots:true,
    speed:1500,
    easing:'swing',
    centerMode:true,
    centerPadding:'25%',
   prevArrow:'<div class="slide-btn prev-btn"></div>',
   nextArrow:'<div class="slide-btn next-btn"></div>',
   responsive:[{
     breakpoint:768,
     settings:{
       centerPadding:'0%',
       slidesToShow:1,
       slideToScroll:1,
     }
   }
 ]
  });



//ハンバーガーメニュー
$('.menu-trigger').on('click',function(){
  $(this).toggleClass('is-active');
  $('.header-links').toggleClass('is-active');
});

//サイズの選択
$('.item-size-list li').on('click',function(){
  const select_size = $(this).text();

 $(this).addClass('is-active');
$(this).siblings('li').removeClass('is-active');
$('.item-size-select span').text(select_size);
});

//レビュー
let review_num=0;
$('.review li').on('click',function(){

  if(review_num == $('.review li').index(this)+1){
    $('.review li').removeClass('is-active');
    review_num=0;
  }
  else{
  review_num = $('.review li').index(this)+1;
 $(`.review li:lt('${review_num}')`).addClass('is-active');
}
});

//アイテム評細説明文アコーディオン
$('[data-accordion="trigger"]').on('click',function(){
  $(this).toggleClass('is-active');
  $(this).next().slideToggle();
});

//フォーカス操作
$('.word-search').focus(function(){
  $(this).addClass('is-cursor');
}).blur(function(){
  $(this).removeClass('is-cursor');

});

//モーダル
$('.controls-cart').on('click',function(e){
  e.preventDefault();
  $('.modal-wrap').fadeToggle();
  $('.menu-trigger, .header-links').removeClass('is-active');
});

$('.modal-close, .modal-wrap').on('click',function(){
  $('.modal-wrap').fadeOut();
});

//カートからアイテムを削除
$('body').on('click', '.cart-delate' ,function(){
  if(confirm('本当に解除しても良いですか？')){
    const item_id = $(this).parents('[data-item-id]').attr('data-item-id');
    storageControl(item_id,`cart`);
    setTimeout(function(){
      location.reload();
    }, 500);
  }
});

//購入ボタンを押した時の処理
$('.btn--buy').on('click',function(){
  if(confirm('本当に購入良いですか？')){
localStorage.removeItem('ninco_cart');
alert('購入しました');
  }
});

//c-sectionの表示
if(page_type == 'page-index'){
  let item_list_new = getItemlist('new');
  $('[data-item-list="new"]').append(createDom(item_list_new));

  categorys.forEach(function(category){
    let item_list_category = getItemlist('category',category);
    item_list_category = createDom(item_list_category);
    $(`[data-item-list="${category}"]`).append(item_list_category);
  })
}

//PICKUP ランダム
let item_list_pickup =createDom(pickUpShuffle(item_data));
$('[data-item-list="pickup"]').append(item_list_pickup)


//プラグイン使用　画像拡大機能
//評細画面の情報取得
if( page_type == 'page-detail' ){
	const item_detail = getItemSingle();
 const storage_types = ['cart', 'fav'];
  Object.keys(item_detail).forEach(function(key){
  $(`[data-item-parts="${key}"]`).text(item_detail[key]);
    });
		$('#zoom-img').attr('src', `./img/item/${item_detail['id']}.png`);
		$('#zoom-img').attr('data-zoom-image', `./img/item/${item_detail['id']}_l.png`);
//ストレージ１
$('.item-detail').attr('data-item-id',item_detail['id']);
//評細画面の取得〜NEW〜
if(!item_detail['new']){
  $('.new-label').remove();
}

//お気入りに追加
const storage_type = ['cart','fav'];
storage_types.forEach(function(type){
  if(storageSavejudge(item_detail['id'],type)){
    $(`.btn--${type}`).addClass('is-storage');
  }
})



$('[data-zoom-image]').elevateZoom({
zoomType:"lens",
});
}





//カテゴリー検索　テキストの表示
//検索機能　金額
if(page_type == 'page-list'){
  const item_list = createDom(getItemlist(param_key));
  $('.sort-list').append(item_list);
  $('.price-select').on('change',function(){
    $('#price-form').submit();
  });
}



});

$(window).on("scroll",function(){

//ころりん
if($(window).scrollTop()>100){
  $('.circle-banner').addClass('is-over');
}else{
  $('.circle-banner').removeClass('is-over');
}
if($(window).scrollTop()>$('.footer').offset().top - 1000){
  $('.circle-banner').removeClass('is-over');

}

//フェードイン
$('[data-fadeIn]').each(function(index, el){
console.log($(window).scrollTop());
if($(window).scrollTop()>($(el).offset().top-$(window).height()/2)){
  $(el).addClass('is-over');
  }
});
});

//ローディング
$(window).on("load",function(){
setTimeout(function(){
  $('.loader').fadeOut();
},600)

});


`<li class="item">
        <a href="#">
          <div class="item-cap"><img src="image/item/${item['id']}.jpg" loading="lazy"></div>
          <div class="item-info">
            <h3 class="item-name">${item['name']}</h3>
            <h3 class="item-text">${item['text']}</h3>
            <div class="item-price">¥${item['price']}</div>
          </div>
        </a>
      </li>`
