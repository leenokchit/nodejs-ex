$(function() {
    app_gallery = new Vue({
        el: '#app-gallery',
        data: {
            test: "abcdefg",
          seen: true,
          isFirstTimeEnter: false,
          bucketlist: []
        },
        mounted: function (){
            // $.ajax({
            //     type: 'get',
            //     url: '/listBuckets',
            //     success: function (data) {
            //         console.log(data);
            //         data.forEach(function(result){
            //             app_gallery.bucketlist.push({id: result.id, name:result.name});
            //         });
            //     }
            //   })
        },
        methods: {
            showapp: function () {
              this.seen = true;
              $("#my_nanogallery2").nanogallery2('refresh');
            },
            addBucket: function(name){
                this.bucketlist.push(name);
            }
        }
      })



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






  $("#my_nanogallery2").nanogallery2({
    thumbnailHeight:  200,
    thumbnailWidth:   "auto",
    thumbnailBorderVertical: 0,
    thumbnailBorderHorizontal: 0,
    thumbnailAlignment: "center",
    thumbnailLabel: {
        "display": false
      },
    itemsBaseURL:     'https://storage.googleapis.com/',
  
    items: [
        //{ src: 'istory-bucket/21817fe5-2e16-4bcc-85a1-910687ecbee9.png', srct: 'thumbnail-istory-bucket/thumbnail-21817fe5-2e16-4bcc-85a1-910687ecbee9.png', title: 'Title Image 1' },
        //{ src: 'istory-bucket/52a3acf9-d8a8-4d64-a71c-8f7071451c84.png', srct: 'thumbnail-istory-bucket/thumbnail-52a3acf9-d8a8-4d64-a71c-8f7071451c84.png', title: 'Title Image 2' },
        //{ src: 'istory-bucket/5fcace78-0586-4a32-be44-02e4d932af91.png', srct: 'thumbnail-istory-bucket/thumbnail-5fcace78-0586-4a32-be44-02e4d932af91.png', title: 'Title Image 3' }
    ]
  });
  
  $('#btn_add').on('click', function() {
    var ngy2data=$("#my_nanogallery2").nanogallery2('data');
    var instance=$("#my_nanogallery2").nanogallery2('instance');
           
    // create the new item
    var ID=ngy2data.items.length+1;
    var albumID='0';
    var newItem=NGY2Item.New(instance, 'new berlin ' + ID, 'my desc', ID, albumID, 'image', '' );
   
    // define thumbnail
    newItem.thumbImg('http://nanogallery2.nanostudio.org/samples/berlin1t.jpg', 320, 212); // w,h
    // define URL to image
    newItem.src='http://nanogallery2.nanostudio.org/samples/berlin1.jpg';
     
    // refresh the display (only once if you add multiple items)
    $("#my_nanogallery2").nanogallery2('refresh');
  });

  
});

