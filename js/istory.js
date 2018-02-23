$(function() {
    app_gallery = new Vue({
        el: '#app-gallery',
        data: {
            test: "abcdefg",
            seen: false,
            isFirstTimeEnter: false,
            isCollapsed: true,
            bucketlist: [],
            browsedImageCount: 0,
            newBucketName: '',
            currentBucket: ''
        },
        created: function ()
        {
            // $('#galleryBrowse').on('change', function() {
            //     this.browsedImageCount = $(this).get(0).files;
            //   });
        },
        mounted: function (){
            var _self = this;
            $.ajax({
                type: 'get',
                url: '/listBuckets',
                success: function (data) {
                    console.log(data);
                    data.forEach(function(result){
                        if(!result.id.includes("thumbnail-istory-"))
                        {
                            if(result.id.includes("istory-"))
                            {
                                _self.bucketlist.push({id: result.id.split("istory-")[1], name:result.name.split("istory-")[1]});
                            }
                            else
                            {
                                _self.bucketlist.push({id: result.id, name:result.name});
                            }
                        }
                    });
                    _self.currentBucket = _self.bucketlist[0].id;
                    _self.listfiles();
                }
              });
              
            $('#galleryBrowse').on('change', function() {
                _self.browsedImageCount = $(this).get(0).files.length;
              console.log(_self.browsedImageCount);
            });
        },
        computed: {
            browsedImageCountString: function(){
                return this.browsedImageCount + " images is selected.";
            }  
        },
        methods: {
            showapp: function () {
              this.seen = true;
              $("#my_nanogallery2").nanogallery2('refresh');
            },
            addBucket: function(name){
                this.bucketlist.push(name);
            },
            listfiles: function(){
                var _self = this
                $.ajax({
                    type: 'get',
                    url: '/listFiles?bucket=' + this.currentBucket,
                    success: function (data) {
                        console.log(data);
                        data.files.forEach(function(result){
                            console.log(result);
                        });
                        _self.addFilesToGallery(data.files);
                    }
                  });
            },
            createBucket: function(){
                if(this.newBucketName != '')
                {
                    $.ajax({
                        url: '/createBucket',
                        type: 'POST',
                        dataType: "json",
                        data: 
                        JSON.stringify({
                            bucketName: this.newBucketName
                        }),
                        async: false,
                        success: function (res) {
                            console.log(res);
                        },
                        error: function() {
                            console.log('process error');
                        },
                        cache: false,
                        contentType: "application/json; charset=utf-8",
                        timeout: 5000
                    });
                }
            },
            changeBucket: function() {
                this.listfiles();
            },
            addFilesToGallery1: function(files){
                $('#gallery_section').empty();
                $("#gallery_section").append('<div id="my_nanogallery2_1"></div>');
                
                var items = [];
                files.forEach(function(file){
                    var base_url = "https://storage.googleapis.com";
                    var bucket_name = file.bucket.id;
                    var file_name = file.id;
                    var abs_path = base_url + '/' + bucket_name + '/' + file_name;
                    var abs_path_thumbnail =  base_url + '/thumbnail-' + bucket_name + '/thumbnail-' + file_name;
                    items.push({ src: bucket_name + '/' + file_name, srct: 'thumbnail-' + bucket_name + '/thumbnail-' + file_name, title: 'Title Image 1' });
                });

                $("#my_nanogallery2_1").nanogallery2({
                    thumbnailHeight:  200,
                    thumbnailWidth:   200,
                    thumbnailBorderVertical: 0,
                    thumbnailBorderHorizontal: 0,
                    thumbnailAlignment: "center",
                    thumbnailLabel: {
                        "display": false
                      },
                    itemsBaseURL:     'https://storage.googleapis.com/',
                  
                    items: items
                  });
            },
            addFilesToGallery: function(files){
                $('#links').empty();
                
                var items = [];
                files.forEach(function(file){
                    var base_url = "https://storage.googleapis.com";
                    var bucket_name = file.bucket.id;
                    var file_name = file.id;
                    var abs_path = base_url + '/' + bucket_name + '/' + file_name;
                    var abs_path_thumbnail =  base_url + '/thumbnail-' + bucket_name + '/thumbnail-' + file_name;
                    items.push({ img: bucket_name + '/' + file_name, thumbnail: 'thumbnail-' + bucket_name + '/thumbnail-' + file_name, title: file_name});

                    var linksContainer = $('#links');
                    $('<a/>')
                    .append($('<img>').prop('src', abs_path_thumbnail))
                    .prop('href', abs_path)
                    .prop('title', file_name)
                    .attr('data-gallery', '')
                    .appendTo(linksContainer);
                });
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

    createBucket = function(){
        $.ajax({
            url: '/createBucket',
            type: 'POST',
            dataType: "json",
            json: 
            {
                name:"abcde"
                //bucketName: 'abcde'
            },
            async: false,
            success: function (res) {
                console.log(res);
            },
            error: function() {
                console.log('process error');
            },
            cache: false,
            contentType: "application/json",
            timeout: 5000
        });
    }

    $("#photoUpload").submit(function(event){
        event.preventDefault();
        photoUpload();
    });






//   $("#my_nanogallery2").nanogallery2({
//     thumbnailHeight:  200,
//     thumbnailWidth:   200,
//     thumbnailBorderVertical: 0,
//     thumbnailBorderHorizontal: 0,
//     thumbnailAlignment: "center",
//     thumbnailLabel: {
//         "display": false
//       },
//     itemsBaseURL:     'https://storage.googleapis.com/',
  
//     items: [
//         {src: "istory-test222/148070d1-0b4e-482f-820c-761562036cbd.png", srct: "thumbnail-istory-test222/thumbnail-148070d1-0b4e-482f-820c-761562036cbd.png", title: "Title Image 1"},
//         {src: "istory-test222/98384988-7f16-455e-81c6-d56e83b0124e.png", srct: "thumbnail-istory-test222/thumbnail-98384988-7f16-455e-81c6-d56e83b0124e.png", title: "Title Image 1"}
//     ]
//   });
  
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

//   $(document).on('change', ':file', function() {
//     var input = $(this),
//         numFiles = input.get(0).files ? input.get(0).files.length : 1,
//         label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
//     input.trigger('fileselect', [numFiles, label]);
//   });



  
});

