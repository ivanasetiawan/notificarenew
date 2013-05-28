//@TODO: Replace XMLHTTP by prototype ajax for ie
Notificare.FileAPI = Class.create({
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsConfig);

		this.element = $(element);
		this.options = Object.extend({
			maxUploadSize: '1',
			extensions: 'jpeg,jpg,gif',
			fieldName: 'file',
			dropArea: 'drop-area',
			fileList: 'file-list',
			language: pH8.currentLanguage
		}, options || {});

		this.waitForDictionary(this.onDictionaryLoaded.bind(this), this.options.language);
		this.waitForConfig(this.onConfigLoaded.bind(this));
		
		this.maxUploadSize = this.options.maxUploadSize;
		this.extensions = this.options.extensions;
		this.fieldName = this.element.up('form')[this.options.fieldName];
		this.dropArea = this.element.down(this.options.dropArea);	
		this.fileList = this.element.down(this.options.fileList);
		this.counter = this.fileList.childElements().length + 1;
		this.applicationID = $F(this.element.up('form')['app']);

	},
	onTemplatesLoaded: function(){
		this.templatesLoaded = true;
		this.onReady();
	},
	/**
	 * Gets called when the dictionary is loaded
	 */
	onDictionaryLoaded: function(){
		this.dictionary = new pH8.Dictionary();
		this.dictionaryLoaded = true;
		this.onReady();
	},
	/**
	 * handle loaded config
	 */
	onConfigLoaded: function(){
		var tempConfig = new pH8.Config();
		this.config = new Hash();
		$H(tempConfig.getList()).each(function(pair){
			this.config.set(pair.key, new Hash());
			$H(pair.value).each(function(secondPair){
					this.config.get(pair.key).set(secondPair.value, secondPair.key);
			}.bind(this));
		}.bind(this));
		this.configLoaded = true;
		this.onReady();
	},
	/**
	 * The all the dependancies are loaded, apply this method
	 */
	onReady: function(){
		if(this.dictionaryLoaded && this.configLoaded){
			this.setEventDelegates();
		}
	},
	/**
	 * Loops over delegates and create event listeners for it
	 */
	setEventDelegates: function(){
		$H(this.delegates).each(function(pair){
			if(pair.key == 'blur'){
				$H(pair.value).each(function(couple){
					this.setEventListenerOnElement(couple.key, pair.key, couple.value);
				}.bind(this));
			}else{
				this.element.observe(pair.key, Event.delegate(this.delegates[pair.key]).bindAsEventListener(this));

			}
		}.bind(this));
	},
	/**
	 * Helper function to set a EventListener to a event
	 * @param cssQuery
	 * @param eventType
	 * @param listener
	 */
	setEventListenerOnElement: function(cssQuery, eventType, listener){
		var element = this.element.down(cssQuery);
		if(element){
			element.observe(eventType, listener.bindAsEventListener(this));
		}
	},
	/**
	 * Event delegates
	 */
	delegates: {
		'click':{
			'.delete-file': function(e){
				e.stop();
				var file = e.findElement(),index = file.readAttribute('href');
				this.deleteFile(this.applicationID,file.up(),index,this.onDeleteFailure.bind(this));
				//generate new indexes
				var images = this.fileList.childElements();
				images.each(function(e,i){
					e.down().setAttribute('href', i+1);
				});
			}
		},
		'change':{
			'input[name="file"]': function(e){
				this.traverseFiles(e.findElement().files);
			}
		},
		'dragleave':{
			'.drop-area': function(e){
				e.stop();
				var target = e.target,element = e.findElement(),dropInstructions = element.down();
				dropInstructions.update(this.dictionary.getText('drag_here'));
				if (target && target === element) {
					element.removeClassName("over");
				}
			}
		},
		'dragenter':{
			'.drop-area': function(e){
				e.stop();
				var element = e.findElement(),dropInstructions = element.down();
				element.addClassName("over");
				dropInstructions.update(this.dictionary.getText('drop_here'));
			}
		},
		'dragover':{
			'.drop-area': function(e){
				e.stop();
			}
		},
		'drop':{
			'.drop-area': function(e){
				e.stop();
				var element = e.findElement(),dropInstructions = element.down();
				this.traverseFiles(e.dataTransfer.files);
				dropInstructions.update(this.dictionary.getText('drag_here'));
				element.removeClassName("over");
			}
		}
	},
	traverseFiles: function(files){

		if (typeof files !== "undefined") {

			for (var i=0, l=files.length; i<l; i++) {
				
				var li = new Element('li'),
				deleteButton = new Element('a',{'class':'delete-file'}),
				img,
				loader,
				reader;

				deleteButton.hide();
				deleteButton.setAttribute('href',this.counter);
				deleteButton.update(this.dictionary.getText('x'));
				li.insert(deleteButton);

				//@TODO: check for extensions
				if (typeof FileReader !== "undefined" && (/image/i).test(files[i].type)) {
					img = new Element('img',{'class':'thumbnails'});
					loader = new Element('img',{src:'/images/ajax-loader.gif','class':'loader-images'});
					img.hide();
					li.insert(img);
					li.insert(loader);
					reader = new FileReader();
					reader.onload = (function (theImg) {
						return function (evt) {
							theImg.src = evt.target.result;
						};
					}(img));
					reader.readAsDataURL(files[i]);
				}
				
				this.uploadFile(this.applicationID,li,files[i]);
			}
		}
		else {
			this.fileList.innerHTML = "No support for the File API in this web browser";
		}		
	},
	uploadFile: function(applicationID,thumbnail,file){		
//		new Ajax.Request('/api/addfile?filename=myfile', {
//			method: 'POST',
//			//contentType: "multipart/form-data",
//			parameters:{
//				applicationID: applicationID
//			},
//			postBody: file,
//			onInteractive: progress.bind(this),
//			onSuccess: success.bind(this),
//			onFailure: (failure) ? failure.bind(this) : null
//		});
		
		var formData = new FormData(), me = this;
	    formData.append('file', file);
	    formData.append('applicationID', applicationID);

		// Uploading - Supported by latest versions of all major vendors except Opera Mini
		xhr = new XMLHttpRequest();
		
		// Update progress bar
		xhr.upload.addEventListener("progress", function (e) {
			me.fileList.insert(thumbnail);
		}, false);
		
		// File uploaded
		xhr.addEventListener("load", function () {
			if (this.status == 200) {
				thumbnail.down('.delete-file').show();
				thumbnail.down('.thumbnails').show();
				thumbnail.down('.loader-images').hide();
			}else{
				thumbnail.remove();
			}

		}, false);
		
		xhr.open("post", "/api/addfile", true);
		
		// Set appropriate headers
		//xhr.setRequestHeader("Content-Type", "multipart/form-data");
		xhr.setRequestHeader("X-File-Name", file.name);
		xhr.setRequestHeader("X-File-Size", file.size);
		xhr.setRequestHeader("X-File-Type", file.type);

		// Send the file (doh)
		xhr.send(formData);

	},
	/*,
	onUploadSuccess: function(thumbnail){
		this.fileList.insert(thumbnail);
	},
	onUploadProgress: function(e){
		console.log(e);
		if (e.lengthComputable) {
			progressBar.style.width = (e.loaded / e.total) * 100 + "%";
			console.log((e.loaded / e.total) * 100 + "%");
		} else {
			console.log('No data to calculate on');
		}
		
	},
	onUploadFailure: function(){
		console.log('failed to upload file');
	}
	*/
	deleteFile: function(applicationID,file,index,failure){
		new Ajax.Request('/api/removefile', {
			method: 'GET',
			parameters:{
				index: index,
				applicationID: applicationID
			},
			onSuccess: new Effect.Fade(file),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onDeleteFailure: function(){
		console.log('failed to delete file');
	}
});
