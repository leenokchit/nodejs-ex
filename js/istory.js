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
            imagelist: [],
            isUploading: false,
            isThumbnailUploading: false,
            uploadProgress: 0
        },
        created: function ()
        {
            // $('#galleryBrowse').on('change', function() {
            //     this.browsedImageCount = $(this).get(0).files;
            //   });
        },
        mounted: function (){
            var _self = this;

            ////set up lightbox gallery
            document.getElementById('links').onclick = function (event) {
                event = event || window.event;
                var target = event.target || event.srcElement,
                    link = target.src ? target.parentNode : target,
                    options = {index: link, event: event},
                    links = this.getElementsByTagName('a');
                blueimp.Gallery(links, options);
            };
            ////

            ////get bucket list
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
            ////
              
            $("#photoUpload").submit(function(event){
                event.preventDefault();
                _self.photoUpload();
            });

            $("#calendarForm").submit(function(event){
                event.preventDefault();
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
                //$("#my_nanogallery2").nanogallery2('refresh');
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
            },
            photoUpload: function(){
                var _self = this;
                isUploading = true;
                var dataform = new FormData($("#photoUpload")[0]);
                _self.isUploading = true;

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
            },
            resetFileInput: function(){
                var _self = this;
                $('#galleryBrowse').wrap('<form>').parent('form').trigger('reset');
                $('#galleryBrowse').unwrap();
                _self.browsedImageCount = $('#galleryBrowse').get(0).files.length;
                _self.setCollapse(true);
                $('#closeGalleryCollapseBtn').click();
                
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
            selectClass: 'form-control fa fa-lg',
            dayEvent:{
                title: '',
                content: '',
                eventDate: '',
                startTime: '',
                endTime: '',
                className:'',
                eventclass:''
            },
            selectedDate:'',
        },
        created: function ()
        {
            
        },
        mounted: function (){
            this.loadCalendar();
            this.getCalendarDetailByDate(moment().format('YYYYMMDD'));
            this.selectedDate = moment().format('YYYYMMDD');

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

            var moment_obj = moment(this.selectedDate, 'YYYYMMDD').toDate();
            $('#eventDatePicker').datetimepicker('date', moment_obj);
        },
        computed: {
            selectedClass: function(){
                return this.dayEvent.eventclass + '-icon';
            },
            selectedDate_string: function() {
                return this.selectedDate.slice(0, 4) + '-' + this.selectedDate.slice(4, 6) + '-' + this.selectedDate.slice(6, 8);
            },
            selectedMonth: function(){
                if(this.selectedDate == "")
                    return moment().month() + 1;
                else
                    return moment(this.selectedDate, "YYYYMMDD").month() + 1;
            },
            startTime_string: function() {
                return this.dayEvents.map(function(event) {
                    var time_string = ("0000" + event.startTime).substr(-4,4)
                    return time_string.slice(0, 2) + ':' + time_string.slice(2, 4) + ' ';
                });
            },
            endTime_string: function() {
                return this.dayEvents.map(function(event) {
                    var time_string = ("0000" + event.endTime).substr(-4,4)
                    return time_string.slice(0, 2) + ':' + time_string.slice(2, 4) + ' ';
                });
            }

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
                var _self = this;
                calendar = $("#my-calendar").zabuto_calendar({
                    today: true,
                    month: _self.selectedMonth, 
                    nav_icon: {
                        prev: '<i class="fa fa-chevron-circle-left"></i>',
                        next: '<i class="fa fa-chevron-circle-right"></i>'
                    },
                    action: function () {
                        return _self.myDateFunction(this.id, false);
                    },
                    action_nav: function () {
                        return _self.myNavFunction(this.id);
                    },
                    ajax: {
                        url: "calendar/getCalendar",
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
                    url: '/calendar/getCalendar?startDate='+date+'&endDate='+date,
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (res) {
                        console.log("getCalendarByDate return with success");
                        _self.dayEvents = [];
                        _self.$nextTick(function () {
                            if(JSON.stringify(res) != '{}'){
                                res.forEach(function(event){
                                    _self.dayEvents.push({
                                        id: event._id,
                                        date: event.date,
                                        dateInt: event.dateInt,
                                        title: event.title,
                                        startTime: event.startTime || "",
                                        endTime: event.endTime || "",
                                        content: event.content,
                                        classname: event.classname,
                                        eventclass: event.eventclass
                                    });
                                });
                            }
                            _self.$nextTick(function () {
                                $('#dayEventTrash').droppable({
                                    drop: function( event, ui ) {
                                        var event_id = ui.draggable.attr("id");
                                        console.log("remove event with id:" + event_id);
                                        $('#' + event_id).remove();
                                        _self.showBin = false;
                                        _self.removeEventById(event_id);
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
                var _self = this;
                $.ajax({
                    url: '/calendar/insertCalendar',
                    type: 'POST',
                    dataType: "json",
                    data: 
                    JSON.stringify({
                        dayEvent: this.dayEvent
                    }),
                    async: false,
                    success: function (res) {
                        console.log(res);
                        if(res.isValid)
                        {
                            _self.reloadCalendar();
                            _self.$nextTick(function () {
                                _self.getCalendarDetailByDate(_self.selectedDate);
                                $("#calendarModal .close").click();
                            });
                            
                            
                        }
                        else
                        {
                            console.log('fail to insert Calendar Event');
                        }
                    },
                    error: function() {
                        console.log('process error');
                    },
                    cache: false,
                    contentType: "application/json; charset=utf-8",
                    timeout: 5000
                });
            },
            removeEventById: function(id){
                var _self = this;
                $.ajax({
                    url: '/calendar/removeCalendarEvent',
                    type: 'POST',
                    dataType: "json",
                    data: 
                    JSON.stringify({
                        id: id
                    }),
                    async: false,
                    success: function (res) {
                        console.log(res);
                        _self.reloadCalendar();
                        //_self.getCalendarDetailByDate(_self.selectedDate);
                    },
                    error: function() {
                        console.log('process error');
                    },
                    cache: false,
                    contentType: "application/json",
                    timeout: 5000
                });
            },
            myDateFunction: function(id, fromModal){
                var selectedDateData = $('#' + id).data();
                this.selectedDate = selectedDateData.date.replace(/-/g,'');
                var selectedDate = selectedDateData.date.replace(/-/g,'');
                
                var moment_obj = moment(selectedDate, 'YYYYMMDD').toDate();
                $('#eventDatePicker').datetimepicker('date', moment_obj);

                this.getCalendarDetailByDate(selectedDate);
                if(this.isCollapsed)
                {
                    $('#calendarDetailUpBtn').click();
                    this.setCollapse(false);
                }
            },
            myNavFunction: function(id){
                console.log(id);
            }
        }
      })




    

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

    
   




    function hideAllAppExcept(app){
        if(app != 'gallery') app_gallery.hideapp();
        if(app != 'calendar') app_calendar.hideapp();
    }

    
  
});

$(function () {
    socket = io();
    socket.on('upload done', function(msg){
        console.log('upload done');
        app_gallery.uploadProgress = 100;
        setTimeout(function(){ 
            app_gallery.isUploading = false; 
            if(app_gallery.isUploading == false && app_gallery.isThumbnailUploading == false)
            {
                app_gallery.listfiles();
                app_gallery.resetFileInput();
            }
        }, 1000);
     });
    socket.on('upload thumbnail done', function(msg){
        console.log('upload thumbnail done');
        setTimeout(function(){ 
            app_gallery.isThumbnailUploading = false; 
            if(app_gallery.isUploading == false && app_gallery.isThumbnailUploading == false)
            {
                app_gallery.listfiles();
                app_gallery.resetFileInput();
            }
        }, 1000);
    });
    socket.on('upload progress', function(progress){
        console.log('upload progress '+ progress);
        app_gallery.uploadProgress = progress;
    });
  });

