function uploader(options){

    this.fileElem=options.fileElem;//file element
    this.showElem=(options.showElem)?options.showElem:undefined;//an element to show upload progress
    this.uploadPath=options.uploadPath;
    this.chunkSize=(options.chunkSize==undefined||options.chunkSize<=0)?(512*1024):options.chunkSize;//file chunks in each upload request
    this.requestDelay=(options.requestDelay==undefined||options.requestDelay<=0)?(100):options.requestDelay;
    this.validExtensions=(options.validExtensions==undefined||options.validExtensions.length<=0)?([]):options.validExtensions;

    var self=this;

    this.states={};//keep upload state
    this.counter=0;//keep number of files

    this.init=function(){
        if(self.fileElem){
            self.fileElem.addEventListener('change', self.process, false);
        }else{
           console.error('file input element not found');
        }
        return self;
    };

    this.checkExtension=function(file){
        if(self.validExtensions.length>0){
            for (var j = 0; j < self.validExtensions.length; j++){
                var sCurExtension = self.validExtensions[j];
                if (file.name.substr(file.name.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()){
                    return true;
                }
            }
            return false;
        }
        return true;
    };

    this.process=function(){
        if(self.fileElem.files.length>0){
            var length=self.fileElem.files.length;
            var counter=0;
            var UI='';
            for(counter=0;counter<length;counter++){
                var file = self.fileElem.files[counter];
                //check for valid extensions
                if(!self.checkExtension(file)){
                    alert('file extension is not valid');
                }else{
                    //set initial values
                    self.counter++;

                    var request=self.httpRequest();//create new xmlHttpRequest

                    self.preSetState(0,file,request,null,0,false,false,self.counter);//set state

                    UI=self.createUI(self.counter);
                    self.updateStateUI(self.counter,UI);

                    self.setUploadHandlers(self.counter);//upload event handlers
                    self.setUIHandlers(self.counter);

                    self.showElem.appendChild(self.states[self.counter].UI.row);

                    setTimeout(self.request,self.requestDelay,self.counter,'add');
                }
            }
        }
    };

    this.preSetState=function(id,file,request,UI,chunkPointer,complete,pause,stateNumber){
        self.states[stateNumber]={
                                    'id':((chunkPointer!=undefined || chunkPointer<=0)?id:0),
                                    'file':file,
                                    'chunkPointer':((chunkPointer!=undefined && chunkPointer>0)?parseInt(chunkPointer):0),
                                    'complete':complete,
                                    'pause':pause,
                                    'UI':UI,
                                    'request':request
                                  };
    };

    this.updateStateUI=function(stateNumber,UI){
        self.states[stateNumber].UI=UI;
    };

    this.updateStateChunk=function(stateNumber,chunkPointer){
        self.states[stateNumber].chunkPointer=chunkPointer;
    };

    this.updateStateComplete=function(stateNumber,complete){
        self.states[stateNumber].complete=complete;
    };

    this.updateStatePause=function(stateNumber,pause){
        self.states[stateNumber].pause=pause;
    };

    this.request=function(stateNumber,action){
        if(self.states[stateNumber].pause==true){
            self.states[stateNumber].request.abort();
            return;
        }
        self.states[stateNumber].UI.pauseBtn.querySelector('i').className='fa fa-pause';

        var formData = new FormData();

        switch(action){
            case 'add':
                //add file info into DB and recieve its id
                formData.append('action', 'add');
                formData.append('name', self.states[stateNumber].file.name);
                formData.append('size', self.states[stateNumber].file.size);
                self.states[stateNumber].request.open('POST', self.uploadPath, true);
                self.states[stateNumber].request.send(formData);
                break;
            case 'get':
                //get file info
                formData.append('action', 'get');
                formData.append('id', self.states[stateNumber].id);
                self.states[stateNumber].request.open('POST', self.uploadPath, true);
                self.states[stateNumber].request.send(formData);
                break;
            case 'upload':
                //upload file
                var sliceSize=self.chunkSize;
                var end = self.states[stateNumber].chunkPointer + sliceSize;
                if (self.states[stateNumber].file.size - end < 0){
                    end = self.states[stateNumber].file.size;
                }
                var piece=self.fileChunk(self.states[stateNumber].file,self.states[stateNumber].chunkPointer,end);
                formData.append('action', 'upload');
                formData.append('id', self.states[stateNumber].id);
                formData.append('name', self.states[stateNumber].file.name);
                formData.append('size', self.states[stateNumber].file.size);
                formData.append('start', self.states[stateNumber].chunkPointer);
                formData.append('end', end);
                piece=new File([piece], self.states[stateNumber].file.name, {type: self.states[stateNumber].file.type});
                formData.append('data', piece);
                self.updateStateChunk(stateNumber,end);
                self.states[stateNumber].request.open('POST', self.uploadPath, true);
                self.states[stateNumber].request.send(formData);
                break;
        }
    };

    this.pause=function(){};

    this.resume=function(){};

    this.delete=function(){};

    this.updateUI=function(UI,stateNumber){
        for(var key in UI){
            switch(key){
                case 'progress'://update progress bar
                    self.states[stateNumber].UI.uploadProgress.innerHTML=UI[key];
                    self.states[stateNumber].UI.uploadProgress.style.width=UI[key];
                    break;
                default:
                    console.warn('UI element to update not found');
            }
        }
    };

    this.createUI=function(stateNumber){
        var tableRow=document.createElement('tr');
        var progress=parseInt((self.states[stateNumber].chunkPointer/self.states[stateNumber].file.size)*100);
        tableRow.innerHTML=
                        '    <th class="align-middle" scope="row">'+stateNumber+'</th>\n' +
                        '    <td class="align-middle">'+self.states[stateNumber].file.name+'</td>\n' +
                        '    <td class="align-middle text-center">\n' +
                        '        <div class="progress">\n' +
                        '            <div class="progress-bar" role="progressbar" style="width: '+progress+'%;" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100">'+progress+'%</div>\n' +
                        '        </div>\n' +
                        '    </td>\n' +
                        '    <td class="align-middle text-center">\n' +
                        '        <button class="btn btn-sm btn-danger delete text-white" data-type="delete">\n' +
                        '            <i class="fa fa-trash"></i>\n' +
                        '        </button>\n' +
                        '        <button class="btn btn-sm btn-warning pause text-white" data-type="pause">\n' +
                        '            <i class="fa fa-play"></i>\n' +
                        '        </button>\n' +
                        '    </td>';
        var uploadProgress=tableRow.querySelector('.progress-bar');
        var deleteBtn=tableRow.querySelector('.delete');
        var pauseBtn=tableRow.querySelector('.pause');
        uploadProgress.id='uploadfile_' + stateNumber;
        return {'row':tableRow,'uploadProgress':uploadProgress,'deleteBtn':deleteBtn,'pauseBtn':pauseBtn};
    };

    this.setUIHandlers=function(stateNumber){
        //pause btn
       self.states[stateNumber].UI.pauseBtn.addEventListener('click',self.setUploadPauseHandler.bind(this,stateNumber),false);
       self.states[stateNumber].UI.deleteBtn.addEventListener('click',self.setUploadDeleteHandler.bind(this,stateNumber),false);
    };



    this.setUploadHandlers=function(stateNumber){
        self.states[stateNumber].request.addEventListener("progress", self.setUploadProgressHandler);
        self.states[stateNumber].request.addEventListener("error", self.setUploadFailHandler);
        self.states[stateNumber].request.onreadystatechange = function(){
            if(self.states[stateNumber].request.readyState==4){
                if(self.states[stateNumber].request.status == 200){
                    if(self.showElem){
                        //show progress percent
                        var response=JSON.parse(this.responseText);
                        if(response.id){
                            self.states[stateNumber].id=response.id;
                        }
                        if(response.data){
                            if(response.data.id){
                                self.states[stateNumber].id=response.data.id;
                            }
                            if(response.data.chunkPointer){
                                self.states[stateNumber].chunkPointer=response.data.chunkPointer;
                            }
                        }
                        if(response.progressPercent){
                            self.updateUI({'progress':response.progressPercent},stateNumber);
                        }
                    }
                    if(self.states[stateNumber].chunkPointer<self.states[stateNumber].file.size){
                        setTimeout(self.request,self.requestDelay,stateNumber,'upload');
                    }else{
                        //upload completed:
                        self.updateStateComplete(stateNumber,true);
                        self.states[stateNumber].UI.pauseBtn.parentNode.removeChild(self.states[stateNumber].UI.pauseBtn);
                        var fileLink;
                        if(response.data && response.data.address){
                            fileLink='<a target="_blank" class="btn btn-sm btn-info text-white margin-l-3 margin-r-3" href="./'+response.data.address+'"><span class="fa fa-eye"></span></a>';
                        }
                        self.states[stateNumber].UI.uploadProgress.parentNode.parentNode.innerHTML=fileLink;
                        console.log('upload succeed',self.states[stateNumber].file.name);
                    }
                }else{
                    console.error('error:','request status', self.states[stateNumber].request.status);
                }
            }
        };
    };

    this.setUploadPauseHandler=function(stateNumber){
        if(self.states[stateNumber].pause==true){
            if(!(self.states[stateNumber].file instanceof File)){
                var file=document.createElement('input');
                file.type='file';
                file.addEventListener('change',function(){
                    if(file.files[0].size==self.states[stateNumber].file.size){
                        console.log('start to resume');
                        self.states[stateNumber].file=file.files[0];
                        self.states[stateNumber].UI.pauseBtn.querySelector('i').className='fa fa-pause';
                        self.states[stateNumber].pause=false;
                        setTimeout( self.request,
                            self.requestDelay,
                            stateNumber,
                            'get'
                        );
                    }else{
                        alert('فایل انتخاب شده باید دقیقا همان فایلی باشد که قبلا قصد آپلود آن را داشته بودید');
                    }
                },false);
                file.click();
            }else{
                console.log('start to resume');
                self.states[stateNumber].UI.pauseBtn.querySelector('i').className='fa fa-pause';
                self.states[stateNumber].pause=false;
                setTimeout( self.request,
                            self.requestDelay,
                            stateNumber,
                            'get'
                            );
            }
        }else{
            console.log('aborted');
            self.states[stateNumber].UI.pauseBtn.querySelector('i').className='fa fa-play';
            self.states[stateNumber].pause=true;
        }
    };

    this.setUploadDeleteHandler=function(stateNumber){
        if(self.states[stateNumber].pause!=true){
            self.states[stateNumber].UI.pauseBtn.click();
        }
        var request=self.httpRequest();
        var formData = new FormData();

        formData.append('action', 'delete');
        formData.append('id', self.states[stateNumber].id);
        request.onreadystatechange=function(){
            if(request.readyState==4){
                if(request.status==200){
                    self.states[stateNumber].UI.row.parentNode.removeChild(self.states[stateNumber].UI.row);
                }else{
                    self.states[stateNumber].UI.pauseBtn.style.display='inline-block';
                    self.states[stateNumber].UI.deleteBtn.querySelector('i').className="fa fa-trash";
                    alert('error:'+request.statusText);
                }
            }else{
                self.states[stateNumber].UI.pauseBtn.style.display='none';
                self.states[stateNumber].UI.deleteBtn.querySelector('i').className="fa fa-refresh fa-spin";
            }
        };
        request.open('POST', self.uploadPath, true);
        setTimeout(function(){request.send(formData);},(self.requestDelay+10));
    };

    this.setUploadFailHandler=function(event,file){
        console.log('failed', event.status);
    };

    this.setUploadProgressHandler=function(event){
        if(event.lengthComputable){
            var percentComplete = event.loaded / event.total;
            return percentComplete;
            // ...
        }else{
            // Unable to compute progress information since the total size is unknown
            return 0;
        }
    };

    this.fileChunk=function(file,start,end){
        var slice = file.mozSlice ? file.mozSlice :
                    file.webkitSlice ? file.webkitSlice :
                    file.slice ? file.slice : (file);
        return slice.bind(file)(start, end);
    };

    this.httpRequest=function(){
        var xhr =   window.XMLHttpRequest ? window.XMLHttpRequest : ActiveXObject("Microsoft.XMLHTTP");
        return (new xhr);
    };

    this.loadFromDB=function(URL){
        var DBLoad=self.httpRequest();
        DBLoad.open('post',URL,true);
        DBLoad.onreadystatechange=function(){
            if(this.readyState==4&&this.status==200){
                var datas=JSON.parse(this.responseText);
                if(datas && datas.length>0){
                    var length=datas.length;
                    var counter=0;
                    var UI='';
                    for(counter=0;counter<length;counter++){
                        var file = datas[counter].file;

                        self.counter++;

                        var request=self.httpRequest();//create new xmlHttpRequest

                        self.preSetState(datas[counter].id,file,request,UI,datas[counter].chunkPointer,datas[counter].complete,datas[counter].pause,self.counter);//set state

                        UI=self.createUI(self.counter);
                        self.updateStateUI(self.counter,UI);

                        self.setUploadHandlers(self.counter);//upload event handlers
                        self.setUIHandlers(self.counter);

                        self.showElem.appendChild(self.states[self.counter].UI.row);

                        setTimeout(self.request,self.requestDelay,self.counter,'get');
                    }
                }
            }
        };
        DBLoad.send('rnd='+Math.random());
    };
}

//start uploader
(new uploader({
    fileElem:document.querySelector('#file'),
    uploadPath:'./server/upload.php',
    requestDelay:100,
    chunkSize:(1024),
    validExtensions:["jpg", "jpeg", "bmp", "gif", "png","mp3"],
    showElem:document.querySelector('#uploadTable tbody')
}).init().loadFromDB('./server/upload.php'));