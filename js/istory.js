$(function() {
    function getRandomSize(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    } 
    function photoUpload(){
        var dataform = new FormData($("#photoUpload")[0]);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: dataform,
            async: false,
            success: function (res) {
                console.log(res);
            },
            cache: false,
            contentType: false,
            processData: false
        });
    }

    $("#photoUpload").submit(function(event){
        event.preventDefault();
        photoUpload();
    });

  
  var allImages = "";
  
  for (var i = 0; i < 0; i++) {
    var width = getRandomSize(200, 400);
    var height =  getRandomSize(200, 400);
    allImages += '<img src="https://placekitten.com/'+width+'/'+height+'" alt="pretty kitty">';
  }
  
  $('#photos').append(allImages);

  $.ajax({
    type: 'get',
    url: '/listBuckets',
    success: function (data) {
        console.log(data);
    }
  })
});

