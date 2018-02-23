$(function() {
    app_gallery = new Vue({
        el: '#app-gallery',
        data: {
            test: "abcdefg",
            seen: true,
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
                    //this.listfile();
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
                $.ajax({
                    type: 'get',
                    url: '/listFiless',
                    success: function (data) {
                        console.log(data);
                        data.forEach(function(result){
                            console.log(result);
                        });
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
            setCollapse: function(isCollapsed){
                this.isCollapsed = isCollapsed;
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

//   $(document).on('change', ':file', function() {
//     var input = $(this),
//         numFiles = input.get(0).files ? input.get(0).files.length : 1,
//         label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
//     input.trigger('fileselect', [numFiles, label]);
//   });



  
});

