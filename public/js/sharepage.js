 /**
 * sharenet bootstrap style page ui javascript commons tools
 * this tool base on jquery & bootstrap, provide a quickly base foundation 
 * for build CRUD page, which was most tasks of sharenet project.
 * the goal of this tools was:
 * <li> 1. 这不是一个通用库，唯一的目的是能够最快速的开发CRUD界面型程序
 * <li> 2. 界面简洁，目前基于bootstrap & jquery
 * <li> 3. 和后台主要通过Ajax通信,后台主要是nodejs实现,
 * <li> 4. 依赖一些工具型的第三方库，不依赖框架型的代码(要工具，不要框架):
 *            juery, bootstrap, juery-bbq, spin 
 */

var debug = true;
if(!debug){
  window.console = {
    log : function(){},
  }
}

/**
 * $M : 模块，提供对模块数据的CRUD操作
 */
var $M = function(argument) {
  $.extend(this, arguments);
};
!function ($) {
  "use strict";
  var fn = $M.prototype;
  
  /**
   * 绑定跟对象CRUD相关的一些事件,通过命名约定自动绑定事件,
   * 寻找当前对象的所有 onXXXClick开头的函数，绑定到$('#XXX').click()方法上
   */
  fn.bindbyname = function(){
    //TODO: add automatic function for bind by name
  };

  fn.lines = function(lines, linebuilderfn){
    var trs =[];
    if(lines){
      $.each(lines, function(idx, line){
              var $line = $(linebuilderfn(line));
              $line.data('linedata',line);
                  trs.push($line);
              });
    }
    return trs;
  };

  fn.getSelectData = function(tbselector){
    var list = [];
    $(tbselector).find(":checked")
    .each(function(i, v){ 
      var x = $(v).closest('tr').data('linedata');
      if(x)
        list.push(x);
    });
    return list ;
  };

  fn.getline = function(selector, fn){
    var cells = this.getSelectData(selector);
    if(!$.assert(cells.length == 1 , '#serviceCtlBar', '请选择一行进行修改.', 30000)){
      return;
    }

    fn(cells[0]);
  };
}(window.jQuery);

$.extend($M, {
  _post : function(url, args, options){
    $.post(url, args, function(data){
      if(data.R === 'Y'){
        options.successfn && options.successfn(data.M);
      }else{
        $.alert('#topNavbar', options.errmsg + data.M, 30000);
        options.failfn && options.failfn(data.M);
      } 
    });
  },

    // options: { successfn , failfn , errmsg }
  doquery : function(url, condition, options){
    options = $.extend({ errmsg: "查询错误:" }, options); 
    $M._post(url, condition, options);
  },

  dodelete : function(url, condition, options){
    options = $.extend({ errmsg: "删除错误:" }, options); 
    $M._post(url, condition, options);
  },

  doupdate : function(url, condition, options){
    if(typeof options === 'function'){
      options = {successfn : options};
    }
    options = $.extend({ errmsg: "更新对象错误错误:" }, options);
    $M._post(url, condition, options);
  },

  docreate : function(url, condition, options){
    options = $.extend({ errmsg: "创建对象错误:" }, options); 
    $M._post(url, condition, options); 
  }
});

/**
 * $P:页面控制对象，相应onhashchange事件做一些状态处理,支持ajax的前进和后退行为
 * state.s: start 记录开始位置
 * state.l: limit 记录结束位置
 * state.sc: search condition 查询条件
 */
var $P = function(options) {
  $.extend(this, options);
  this.state = options.default || {};
};
!function ($) {
  "use strict";
  
  var fn = $P.prototype;

  fn.onhashchange = function(e){
    var state = $.bbq.getState(),
      $this = $(this);
      
    this.state = $.extend(this.default, state) ;
    $this.trigger('statechange', state);
  };

  fn.pushState = function(state){
    if(state){
      $.bbq.pushState(state);     
    }else{
      $.bbq.pushState(this.state);
    }
  };

  /** 绑定页面全局级别的各个事件，尤其是onhashchange事件 */
  fn.bindhash = function(){
    var that = this;
    $(window).bind('hashchange', function(e){
      that.onhashchange(e);
    });
  };
}(window.jQuery);


/**
 * some comment tools function, for quickly do some basic things
 * $.ask : ask user about something
 * $.alert : alert some message to user 
 */
(function ($) {
  "use strict";
  $.extend({

    /** 
     * ask for confirm something
     */
    ask : function(title, message, ok){
      $('#confirmDlg').find('div.modal-header h3').text(title) ; 
      $('#confirmDlg').find('div.modal-body p').text(message);
      $('#confirmDlg').modal().find("button.ok").one('click', ok);
    },

    /**
     * 弹出modal对话框，保存完成调用okFn, 保存失败调用 cancleFn
     */
    showmodal : function(dlgSelector, okfn, canclefn){
      var dlg = dlgSelector;
      if(typeof dlgSelector === "string"){
         dlg = $(dlgSelector);
      };

      dlg.modal().find("button.btn-primary").off('click').on('click', function(){
        if(okfn(dlg)){
          dlg.state = 'OK'
          dlg.modal('hide');
        }
      });
      dlg.off('hide').on('hide', function(){
        if(dlg.state !== 'OK')
          canclefn && canclefn();
      });
    },

    /**
     * show a alert bar on top of given element
     * @closetime if has close time, will automatic close after closetime secs.
     */
    alert : function(selector, message, closetime){
      $('.alert').alert('close');
      $('.alert').remove();
      $(selector).before('<div class="alert fade in"><button type="button" class="close" data-dismiss="alert">×</button>'+ message +'</div>');
      if(closetime)
        setTimeout(function(){
          $('.alert').alert('close');
        },closetime);
    },

    assert : function(condition, selector, message, closetime){
      if(!condition)
        $.alert(selector, message, closetime);

      return condition;
    },

    switchcontext : function(that, fn){
      return function(e){
        fn.apply(that,[e]);
      }
    }
  });
})(window.jQuery);


/**
 * pageControl, split page, and callback during click page link
 */
(function($){
  $.fn.extend({

    /**
     * page control
     */
    pagectl : function(count, length, pageStart, fn){
      var pgcnt = (count % length == 0 ? 
        Math.floor(count / length) : Math.floor(count / length) + 1),
      pagelist = '<li><a><<</a></li>',
      currentpg = pageStart;
      for(var i = 1 ; i<= pgcnt ; i++){
        pagelist += '<li><a>'+i+'</a></li>';
      }
      pagelist += '<li><a>>></a></li>';

      this.html(pagelist);
      this.on('click','a', function(){
        var txt = $(this).text(),
        pg = 0;
        if(txt === '<<'){
          pg = 0 ;
        }else if(txt === '>>'){
          pg = pgcnt - 1 ;
        }else{
          pg = parseInt(txt) - 1;
        }

        fn(pg * length);
        return false;
      });
    }
  })
})(window.jQuery);


/**
 * form tools plugin
 * 1. autofill: 根据对象属性名自动填充form字段.
 * 2. clearall: 一次性清除所有的字段值.
 */
(function($){
  $.fn.extend({

    /**
     * options.findbyname: 
     *   为true根据input的name属性填充值,为false根据id属性填充值,缺省为true
     * options.restrict: 
     *   为true只填充form中的input，为false在整个document中寻找input,缺省为true
     */
    autofill: function(data, options) {
      var settings = {
          findbyname: true,
          restrict: true
        },
        self = this;

      if ( options ) {
        $.extend( settings, options );
      }

      return this.each(function() {
        $.each( data, function(k, v) {

          // switch case findbyname / findbyid

          var selector, elt;

          if ( settings.findbyname ) { // by name

            selector = '[name="'+k+'"]';
            elt = ( settings.restrict ) ? self.find( selector ) : $( selector );

            if ( elt.length == 1 ) {
              elt.val( ( elt.attr("type") == "checkbox" ) ? [v] : v );
            } else if ( elt.length > 1 ) {
              // radio
              elt.val([v]);
            } else {
              selector = '[name="'+k+'[]"]';
              elt = ( settings.restrict ) ? self.find( selector ) : $( selector );
              elt.each(function(){
                $(this).val(v);
              });
            }

          } else { // by id

            selector = '#'+k;
            elt = ( settings.restrict ) ? self.find( selector ) : $( selector );

            if ( elt.length == 1 ) {
              elt.val( ( elt.attr("type") == "checkbox" ) ? [v] : v );
            } else {
              var radiofound = false;

              // radio
              elt = ( settings.restrict ) ? self.find( 'input:radio[name="'+k+'"]' ) : $( 'input:radio[name="'+k+'"]' );
              elt.each(function(){
                radiofound = true;
                if ( this.value == v ) { this.checked = true; }
              });
              // multi checkbox
              if ( !radiofound ) {
                elt = ( settings.restrict ) ? self.find( 'input:checkbox[name="'+k+'[]"]' ) : $( 'input:checkbox[name="'+k+'[]"]' );
                elt.each(function(){
                  $(this).val(v);
                });
              }
            }
          }
        });
      });
    },

    /**
     * form的内容转换为Data
     */
    getdata: function(options){
      var settings = {
          findbyname: true,
          restrict: true
        },
        self = this;

      if ( options ) {
        $.extend( settings, options );
      }

      var selector = ':input', data = {} ,
          elts = ( settings.restrict ) ? self.find( selector ) : $( selector );

      elts.each(function(i){
        var input = $(this);
        if ( settings.findbyname ) {  
          var name = input.attr('name');
        }else{
          var name = input.attr('id');
        }
        if(!name)
          return;
        
        var value = input.val();
        if(input.attr('type') === 'checkbox'){
          if(input.attr('checked') === 'checked')
            data[name] = value;
        }else{
          data[name] = value;  
        }
      });
      return data;
    },


    /**
     * 清除全部字段
     */
    clearall: function(options){
      var settings = { clearhidden : true };
      if( options ) {
        $.extend( settings, options );
      }
      this.find('input:text, input:password, input:file, select, textarea' + ( settings.clearhidden ? ', input:hidden' :'')).val('');
      this.find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
      return this;
    } 
  });
})(jQuery);

// Simple JavaScript Templating, 
// John Resig - http://ejohn.org/ - MIT Licensed
// http://ejohn.org/blog/javascript-micro-templating/
// sanli : change the tag from  <% -> <@ for prevent conflite with server side template
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<@").join("\t")
          .replace(/((^|@>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)@>/g, "',$1,'")
          .split("\t").join("');")
          .split("@>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();