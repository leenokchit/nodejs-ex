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
            currentBucket: '',
            imagelist: []
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
                hideAllAppExcept('gallery');
                this.seen = true;
                $("#my_nanogallery2").nanogallery2('refresh');
            },
            hideapp: function () {
                this.seen = false;
            },
            setCollapse: function(isCollapsed) {
                this.isCollapsed = isCollapsed;
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
                var _self = this;
                $('#links').empty();
                
                _self.imagelist = [];
                files.forEach(function(file){
                    var base_url = "https://storage.googleapis.com";
                    var bucket_name = file.bucket.id;
                    var file_name = file.id;
                    var abs_path = base_url + '/' + bucket_name + '/' + file_name;
                    var abs_path_thumbnail =  base_url + '/thumbnail-' + bucket_name + '/thumbnail-' + file_name;
                    // items.push({ img: bucket_name + '/' + file_name, thumbnail: 'thumbnail-' + bucket_name + '/thumbnail-' + file_name, title: file_name});

                    var linksContainer = $('#links');
                    $('<a/>')
                    .append($('<img>').prop('src', abs_path_thumbnail))
                    .prop('href', abs_path)
                    .prop('title', file_name)
                    .attr('data-gallery', '')
                    .appendTo(linksContainer);
                    _self.imagelist.push({ img: abs_path, thumbnail: abs_path_thumbnail, title: file_name})
                });
            }
        }
      })
    
      app_calendar = new Vue({
        el: '#app-calendar',
        data: {
            seen: false,
            isFirstTimeEnter: false,
            isCollapsed: true,
            dayEvents: [],
            showBin: false,
            dayEvent:{
                title: '',
                content: '',
                eventDate: '',
                startTime: '',
                endTime: ''
            }
        },
        created: function ()
        {
            
        },
        mounted: function (){
            this.loadCalendar();
            this.getCalendarDetailByDate(moment().format('YYYYMMDD'));

            $('#eventDatePicker').datetimepicker({
                ignoreReadonly: true,
                format: 'L'
            });
            $('#startTimePicker').datetimepicker({
                ignoreReadonly: true,
                format: 'LT'
            });
            $('#endTimePicker').datetimepicker({
                ignoreReadonly: true,
                format: 'LT'
            });

            $('#eventDatePicker').datetimepicker("format","YYYY-MM-DD");
            $('#startTimePicker').datetimepicker("format","HH:mm");
            $('#endTimePicker').datetimepicker("format","HH:mm");
        },
        computed: {
        },
        methods: {
            showapp: function () {
                hideAllAppExcept('calendar');
                this.seen = true;
            },
            hideapp: function () {
                this.seen = false;
            },
            setCollapse: function(isCollapsed) {
                this.isCollapsed = isCollapsed;
            },
            loadCalendar: function(){
                calendar = $("#my-calendar").zabuto_calendar({
                    today: true,
                    nav_icon: {
                        prev: '<i class="fa fa-chevron-circle-left"></i>',
                        next: '<i class="fa fa-chevron-circle-right"></i>'
                    },
                    action: function () {
                        return myDateFunction(this.id, false);
                    },
                    action_nav: function () {
                        return myNavFunction(this.id);
                    },
                    ajax: {
                        url: "getCalendar",
                        modal: true
                    },
                    legend: [
                        {type: "text", label: "Special event", badge: "00"},
                        {type: "block", label: "Regular event"}
                    ]
                });
            },
            reloadCalendar: function(){
                $('#istory-calendar').empty();
                $('<div id="my-calendar"></div>').appendTo($('#istory-calendar'));
                this.loadCalendar();
            },
            getCalendarDetailByDate: function(date){
                var _self = this;
                $.ajax({
                    url: '/getCalendar?date='+date,
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (res) {
                        console.log("getCalendarByDate return with success");
                        res.forEach(function(event){
                            _self.dayEvents.push({
                                id: event._id,
                                date: event.date,
                                dateInt: event.dateInt,
                                title: event.title,
                                startTime: event.startTime || "0000",
                                endTime: event.endTime || "0000",
                                classname: event.classname
                            });
                        });
                        _self.$nextTick(function () {
                            $('#dayEventTrash').droppable({
                                drop: function( event, ui ) {
                                    var event_id = ui.draggable.attr("id");
                                    console.log("remove event with id:" + event_id);
                                    $('#' + event_id).remove();
                                    _self.showBin = false;
                                }
                              });
                            $('#dayDetail').children().each(function(index){
                                $(this).draggable({ revert: "invalid" });
                                $(this).on( "dragstart", function( event, ui ) {
                                    _self.showBin = true;
                                } );
                                $(this).on( "dragstop", function( event, ui ) {
                                    _self.showBin = false;
                                } );
                            });
                        });
                        
                    },
                    error: function() {
                        console.log('process error');
                    },
                    cache: false,
                    contentType: "application/json; charset=utf-8",
                    timeout: 5000
                });
            },
            submitInsertCalendar: function(){
                this.dayEvent.eventDate = $($('#eventDatePicker').children()[0]).val();
                this.dayEvent.startTime = $($('#startTimePicker').children()[0]).val();
                this.dayEvent.endTime = $($('#endTimePicker').children()[0]).val();
                console.log(this.dayEvent);
                this.InsertCalendar();
            },
            InsertCalendar: function(){
                $.ajax({
                    url: '/insertCalendar',
                    type: 'POST',
                    dataType: "json",
                    data: 
                    JSON.stringify({
                        dayEvent: this.dayEvent
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

    eventData = [
        {"date":"2018-02-05","badge":false,"title":"Example 1"},
        {"date":"2018-02-24","badge":true,"title":"Example 2"}
      ];
    //calendar = $("#my-calendar").zabuto_calendar({language: "en"});

    // $('#istory-calendar').empty();
    // calendar = $("#my-calendar").zabuto_calendar({
    //         action: function () {
    //             return myDateFunction(this.id, false);
    //         },
    //         action_nav: function () {
    //             return myNavFunction(this.id);
    //         },
    //         data: [],
    //         legend: [
    //             {type: "text", label: "Special event", badge: "00"},
    //             {type: "block", label: "Regular event"}
    //         ]
    //     });

    function myDateFunction(id, fromModal){
        console.log(id);
    }
    function myNavFunction(id){
        console.log(id);
    }
  
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


    function hideAllAppExcept(app){
        if(app != 'gallery') app_gallery.hideapp();
        if(app != 'calendar') app_calendar.hideapp();
    }
  
});

