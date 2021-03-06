/*
 * Logic for esoda result page.
 */

var loadCount = 1, loading = 0, loaded = 0;    // TODO: eliminate global vairables
var QUERY_PARAMS, REF, POSS, SENTENCES_URL, COLLOCATION_URL;
// var keyword = window.location.search;

$(function () {
  'use strict';

  function searchAndFillSentences(params) {
    loadCount = 1;
    loading = 1;
    loaded = 0;
    params['dep_count'] = $(".colloc-usage[state='selected']").children('span').attr('count');
    $.get(SENTENCES_URL, params, function (data) {
      $('#Loading').hide();
      $('#SentenceResult').html(data);
      $('.SentenceContent').fadeIn("fast");
      $("#SentenceLoading").hide();
      $('#SidebarAffix .panel-group').fadeIn("fast");
      $(".CollapseColloc").fadeIn("fast");
      var colNum = ($(".colList").width() > 380) ? 3 : 2;
      $('.colList li').removeClass('second-row');
      $('.colList li').not(':lt(' + colNum + ')').addClass('second-row');
      var exampleNum = $("#ExampleNumber").data('example-number');
      if (exampleNum === 0) {
        $('#Loadbox').hide();
      }
      else if (exampleNum <= 10 && exampleNum > 0) {
        $('#Loadbox').hide();
        $('#ExampleEnd').fadeIn("fast");
        loaded = 1;
      }
      else {
        $("#Loadbox").fadeIn("fast");
      }
      loading = 0;
    });
  }

  $(window).resize(function () {
    var colNum = ($(".colList").width() > 380) ? 3 : 2;
    $('.colList li').removeClass('second-row');
    $('.colList li').not(':lt(' + colNum + ')').addClass('second-row');
  });
  $('.list-btn2').click(function () {
    $('.result-main .CollapseColloc').toggleClass('expanded');
  });

  // $('.not-limited').click(function (e) {
  //   e.preventDefault();
  //   if ($(this).attr('aria-expanded') == 'true') {
  //     return;
  //   }
  //   $("#ExampleEnd").hide();
  //   $("#ManualLoad").hide();
  //   $('#SentenceResult').empty();
  //   $('#Loading').show();

  //   var query = $(this).attr('data');

  //   searchAndFillSentences({t: query, ref: REF, dt: 0});
  // });

  // $('.not-limited').click();
  $('.colloc-sub-btn').click(function (e) {
    e.preventDefault();
    // Prevent click event propagation
    // e.cancelBubble = true;  // IE6-8
    // if (e.stopPropagation) {    // standard
    //     e.stopPropagation();
    // }
    if ($(this).attr('aria-expanded') == 'true') {
      return;
    }
    $('.SentenceContent').fadeOut("fast");
    $('#ExampleEnd').fadeOut("fast");
    $('#SidebarAffix .panel-group').fadeOut("fast");
    $("#Loadbox").fadeOut("fast");
    $("#SentenceLoading").show();
    var id = $(this).attr('href');
    var type = $(this).attr('type');  // TODO: get query tokens from {{ q0 }}
    var type0 = type.replace(/ \(.*\) /g, ' ');
    var i, dt;
    var ref = [];
    var expand = $(this).attr('expand');
    for (i = 0; i < type.split(' ').length; i++) {
      if (type.split(' ')[i] != type0.split(' ')[i]) break;
    }
    for (var j = 0, k = 0; j < type0.split(' ').length; j++) {
      if (type0.split(' ')[j] == '*') ref[j] = '*';
      else {
        ref[j] = REF.split(' ')[k];
        k = k + 1;
      }
    }
    if (i == 0) i = 1;
    dt = id.replace('#', '').split('_')[1];

    // $('#SentenceResult').animate({ opacity: 0 }, function () {
    //   $('#Loading').show();
    // });
    // $('#ManualLoad').hide();
    // $("#ExampleEnd").hide();
    if (type0.indexOf('*') < 0){
      searchAndFillSentences({t: type0.replace('*', ''), ref: ref.join(' '), i: i - 1, dt: dt, pos: POSS, expand: expand});
    }
    $.get(COLLOCATION_URL, {t: type0, ref: ref.join(' '), dt: dt, pos: POSS, expand: expand}, function (data) {
      $(id).html(data);
      $(id + ' .panel-collapse-body').mCustomScrollbar({
        theme: 'dark',
        scrollInertia: 0,
        mouseWheel: {preventDefault: true},
        autoHideScrollbar: true
      });
      if (type0.indexOf('*') > -1) { $(id + ' .single-extend:eq(0) .colloc-usage:eq(0)').click(); }
      // else {
      //   if ($(id + ' .colloc-usage:eq(0)').length) { $(id + ' .colloc-usage:eq(0)').click(); }
      //   else { searchAndFillSentences({t: type0, ref: ref.join(' '), i: i - 1, dt: dt, pos: POSS, expand: expand}); }
      // }
    });
  });

  $('.CollapseColloc').on('click', '.colloc-usage', function (e) {
    e.preventDefault();
    if ($(this).attr('state') == 'selected') return;
    $("#ExampleEnd").fadeOut("fast");
    $('.SentenceContent').fadeOut("fast");
    $("#Loadbox").fadeOut("fast");
    $("#SentenceLoading").show();
    // $('#SentenceResult').animate({opacity: 0}, function () {
    //   if (loading) $('#Loading').show();
    // });

    $('.colloc-usage').removeAttr('state');
    $(this).attr('state', 'selected');

    // var collocQ = $(this).text().split(' ')[0].replace('...', ' ');
    var dt = $(this).parents('.tab-pane').attr('id').split('_')[1];
    var type = $(this).attr('lemma').replace(/ \(.*\)/, '');
    var i = type.replace('...', ' ... ').split(' ').indexOf('...') - 1;
    searchAndFillSentences({t: $(this).attr('lemma'), ref: $(this).attr('ref'), i: i, dt: dt});  // TODO: move to after animation
  });

  // $(".cover").click( function() {
  //   $(".cover").hide();
  //   $(".uncover").css('z-index','0'); 
  // });

  $(window).scroll(function () {
    if ($(document).height() <= $(window).scrollTop() + $(window).height() + 300) {
      if (loading == 1 || loaded == 1) return;
      if ($('#Loading').is(':visible')) return;
      if ($('#ManualLoad').is(':visible')) return;
      $("#ManualLoad").show();
    }
  });

  $('#ManualLoad').click(function (e) {
    var exampleNum = $("#ExampleNumber").data('example-number');
    loading = 1;
    $("#ManualLoad").hide();
    $(".result-table-cell").hide();
    $("#Loading2").show();
    setTimeout(function () {
      $("#Loading2").hide();
      $("#Loadbox").show();
      var i;
      for (i = loadCount * 10 + 1; i <= (loadCount + 1) * 10 && i <= exampleNum; i++) {
        $("#Example" + i).show();
      }
      loadCount++;
      loading = 0;
      if (i > exampleNum || loadCount >= 5) {
        loaded = 1;
        $("#Loadbox").hide();
        $("#ExampleEnd").show();
        return;
      }
    }, 1000);
  });

  $(".back-to-top").click(function () {
    $("html,body").animate({scrollTop: 0}, "fast");
    return false;
  });

  // $("#BackToTopAffix").affix({
  //   offset: {
  //     top: 0,
  //     bottom: function () {
  //       // TODO: fix position bugs on change of window length
  //       return $(".footer").outerHeight(true) + 20;
  //     }
  //   }
  // });
  //
  // $("#Feedback").affix({
  //   offset: {
  //     top: 0,
  //     bottom: function () {
  //       // TODO: fix position bugs on change of window length
  //       return $(".footer").outerHeight(true) + 100;
  //     }
  //   }
  // });

  $.clickStar = function (e) {
    e.preventDefault();
    $(e.target).toggleClass("glyphicon-star-empty");
    $(e.target).toggleClass("glyphicon-star");
  };

  $('.domain-link').attr('href', $('.domain-link').attr('href') + '?' + QUERY_PARAMS);

  $('#SearchBox').hover(function () {
    if ($('#SearchBox').is(':focus')) {
      return false;
    }
    $('#SearchBox').focus();
    $('#SearchBox').select();
  }, function () {
    return false;
  });

  $('#SearchBox').trigger('mouseover');
  $('#first').click();
});
