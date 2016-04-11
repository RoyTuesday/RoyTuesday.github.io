$(document).on('ready', function() {

  $.ajax({
    cache: false,
    url: "/partial-index.html"
  }).done(function(response) {
    $('.main-container').html(response);
  });

  $('nav a').on('click', function(event) {
    event.preventDefault();
    var targetURI = event.currentTarget.dataset.pagePartial;
    $.ajax({
      cache: false,
      url: targetURI
    }).done(function(response) {
      $('.main-container').html(response);
    });
  });

  $('.main-container').on('click', 'a.blog-link, a.home-link', function(event) {
    event.preventDefault();
    var targetURI = event.target.dataset.pagePartial;
    $.ajax({
      cache: false,
      url: targetURI
    }).done(function(response) {
      $('.main-container').html(response);
    });
  });

});