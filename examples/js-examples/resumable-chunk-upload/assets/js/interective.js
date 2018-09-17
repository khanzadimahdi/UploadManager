allDownload = []; // storing all current active download


function bufferHeight( elt, container )
{
	container = container || document.body;
	var tempElt = elt.cloneNode( true );
	tempElt.classList.remove('zeroHeight');
	tempElt.style.cssText = "position:fixed; top:0px; left:0px";
	container.appendChild( tempElt );
	var height = tempElt.offsetHeight;
	container.removeChild( tempElt );
	return height;
}

function showGraph()
{
	var graphHeight = "375px";
	var graph = document.querySelector('#speedGraph');

	graph.classList.remove( 'zeroHeight' );
	graph.style.cssText = 'height:'+graphHeight;


}

function hideGraph()
{
	var graph = document.querySelector('#speedGraph');
	graph.style.cssText = "";
	graph.classList.add('zeroHeight');

	// clearing canvas
	var canvas = document.querySelector('#graph');
	canvas.width = canvas.width;

	var progressDisplay = document.querySelector('.progress .info');
	var spanXdetail = progressDisplay.parentNode.previousElementSibling.querySelectorAll('span.xDetail');
	spanXdetail[0].textContent = '0 KBps';
	spanXdetail[1].textContent = '0 KBps';
	spanXdetail[2].textContent = '0 sec';
	spanXdetail[3].textContent = '-';
	spanXdetail[4].textContent = '-';

	progressDisplay.textContent = "";
	progressDisplay.nextElementSibling.style.width = '0'; 

}

function addNewRow( filename, type, size )
{
	var row = document.createElement( 'tr' );

	row.setAttribute( 'class', type+' active' );
	row.setAttribute( 'data-status', 'active' );
	row.setAttribute( 'title', filename );

	var date = new Date;
	var timePart = date.toTimeString();
	date = date.toDateString() + ' ' + timePart.slice( 0, timePart.indexOf( ' ') );

	var content = '<td>'+filename+'</td><td>'+size+'</td><td>0%</td><td>0 KBps</td><td>'+date+'</td>';
	row.innerHTML = content;
	

	var tableBody = document.querySelector( '.allFiles tbody');
	tableBody.appendChild( row );

	reOrderTable();

	return row;
}

function playSound( file )
{
	var audio = new Audio;
	audio.volume = 1;
	audio.src = file;
	audio.play();
}

function displayDialog( type, msg )
{
	var lightbox = document.querySelector('.lightbox');
	var index;
	var song;
	if( type == 'error' )
	{
		index = 0;
		song = 'data/error.mp3';
	}
	else if( type == 'complete' )
	{
		index = 1;
		song = 'data/success.mp3';
	}

	playSound( song );

	lightbox.classList.remove('hidden');

	var dialog = lightbox.children[index].cloneNode(true);
	dialog.children[2].textContent = msg;
	dialog.classList.remove('hidden');
	var dialogHeight = bufferHeight( dialog, lightbox );
	dialog.style.height = dialogHeight +'px';
	dialog.style.marginTop = (window.innerHeight - dialogHeight ) /2 + 'px';
	lightbox.appendChild( dialog );
}

var menu = document.querySelector('.menuOptions');
menu.addEventListener( 'click', menuHandler, false );

function menuHandler( event )
{
	var clicked 		 =	 event.target,
		allMenuOptions 	 =	 document.querySelectorAll('.menuOptions span.bigMenu'),
		totalOptions 	 =	 allMenuOptions.length,
		bigMenuElt,
		allBigMenu,
		totalBigMenu,
		menuName,
		i,
		j;

	
	for( i = 0; i < totalOptions; i++ )
	{
		if( clicked === allMenuOptions[i] )
		{
			// menu is clicked perform sliding of menu
			menuName = clicked.getAttribute('data-menu');
			bigMenuElt = this.parentNode.querySelector('.allMenu .'+menuName).parentNode;
			
			if( bigMenuElt.classList.contains( 'zeroHeight') )
			{
				// first hiding all menu
				allBigMenu 		=	 document.querySelectorAll( '.allMenu .menuContainer' );
				totalBigMenu 	=	 allBigMenu.length;
				
				for( j = 0; j < totalBigMenu; j++ )
				{
					//allBigMenu[j].classList.remove( 'block' );
					allBigMenu[j].children[0].style.display = "none";
					allBigMenu[j].classList.add( 'zeroHeight' );
					allBigMenu[j].style.cssText = "";
					allBigMenu[j].children[0].style.cssText = "";

				}

				// display the menu
				
				bigMenuElt.style.height = bufferHeight(bigMenuElt, bigMenuElt.parentNode) + 'px';
				bigMenuElt.classList.remove( 'zeroHeight' );				
			}
			else
			{
				// hide the menu
				bigMenuElt.style.cssText = "";
				bigMenuElt.classList.add( 'zeroHeight' );		
			}
		}
	}
}	

//--------------------------------------------------------------------------

// for resuming download

var resumeMenu = document.querySelector('.menuOptions span.resume');
resumeMenu.addEventListener('click',function()
	{
		if(!this.classList.contains('deactive'))
		{
			var row = document.querySelector('.allFiles tr.active');

			var activeIndex = document.querySelector('#speedGraph').getAttribute('data-active');
			console.log(activeIndex);
			if( !activeIndex )
			{
				activeIndex = getIndex(row.getAttribute('filename'));
				console.log(activeIndex);
			}
			resumeHandler(row,activeIndex);
		}
	},false);

function resumeHandler(row,index)
{
	console.log(index);
	var filename = row.getAttribute('title');
	
	
	
	showGraph();
	if(index >= allDownload.length )
	{
		// new
		var newDownload = new DownloadFile('',filename,index, '');
		newDownload.startStream(true);
		allDownload.push(newDownload);
	}
	else
	{
		var newDownload = new DownloadFile(allDownload[index].url, allDownload[index].filename, index, '');
		newDownload.startStream(true);
		allDownload[index] = newDownload;
		//allDownload[index].active = true;
		//allDownload[index].stream = new EventSource('php/download.php?type=get&support=&resume=true&filename='+filename+'&url=');
	}
	
	console.log(index);
	document.querySelector('#speedGraph').setAttribute('data-active',index);
	row.setAttribute('data-status','active');
	var button = document.querySelectorAll('.menuOptions span.resume, .menuOptions span.stop');
	button[0].classList.add('deactive');
	button[1].classList.remove('deactive');
	row.classList.add('active');

}

// -----------------------------------------------------------------------


function getIndex( filename )
{
	for( var each in allDownload)
	{
		if( allDownload[each].filename == filename)
		{
			return each;
		}
	}

	return allDownload.length;
}

// ----------------------------------------------------------------

var stopMenu = document.querySelector('.menuOptions span.stop');
stopMenu.addEventListener('click',function(event)
	{
		if(!this.classList.contains('deactive'))
		{
			var activeRow =document.querySelector('.allFiles tr.active');
			//var id = activeRow.getAttribute('data-id');
			//activeRow.setAttribute('data-status','pause');
			var graph = document.querySelector('#speedGraph');
			var activeIndex = graph.getAttribute('data-active');
			//graph.setAttribute('data-active');
			//allDownload[activeIndex].active = false;
			//allDownload[activeIndex].stream.close();
			
			stopHandler( activeRow, activeIndex );
			hideGraph();

			// making it deactive
			this.classList.add('deactive');
			document.title = "KINK Download Manager";
		}
	},false);


function stopHandler( row, index )
{
	var id = row.getAttribute('data-id');
	row.setAttribute('data-status','pause');
	

	if( row.classList.contains('active'))
	{
		//row.classList.remove('active');
		// activating resume button
		document.querySelector('.menuOptions span.resume').classList.remove('deactive');
	}
	//var request = new XMLHttpRequest;
	//request.open('GET','php/stopDownload.php?id='+id);
	//request.send(null);

	allDownload[index].active = false;
	allDownload[index].stream.close();
}

//----------------------------------------------------------------------

var deleteMenu = document.querySelector('.menuOptions span.delete');
deleteMenu.addEventListener('click',function()
	{
		var activeIndex = document.querySelector('#speedGraph').getAttribute('data-active');
		allDownload[activeIndex].active =false;
		allDownload[activeIndex].stream.close();

		document.querySelector('#speedGraph').removeAttribute('data-active');
		hideGraph();
		
		var row = document.querySelector('.allFiles tbody tr.active');
		if( row != null )
		{
			deleteHandler(row);
		}

		document.title = "KINK Download Manager";

		
	}, false);

function deleteHandler( row )
{
	var filename = row.getAttribute('title');

	var request = new XMLHttpRequest;
	request.open('GET','php/delete.php?filename='+filename);
	request.send(null);
	request.onreadystatechange = function( event )
	{
		if( request.readyState === 4 && request.status == 200 )
		{
			document.querySelector('.allFiles tbody').removeChild(row);
		}
	}
}
// schedule tab 
/*var allTab = document.querySelectorAll('.tab .tabbed');
allTab[0].addEventListener( 'click', scheduleTabHandler, false );
allTab[1].addEventListener( 'click', scheduleTabHandler, false );

function scheduleTabHandler( event )
{
	var target = event.target,
		allTab;
	
	if( !target.classList.contains( 'active' ) )
	{
		// inactive tab is clicked
		allTab = document.querySelectorAll( '.tab .tabbed' );
		
		allTab[0].classList.remove( 'active' );
		allTab[1].classList.remove( 'active' );
		
		target.classList.add( 'active' );
		
		if( target.classList.contains( 'ch1' ) )
		{
			// ch1Detail to be shown
			document.querySelector( '.ch2Detail' ).classList.add( 'hidden' );
			document.querySelector( '.ch1Detail' ).classList.remove( 'hidden' );
		}
		else
		{
			// ch2Detail to be shown
			document.querySelector( '.ch1Detail' ).classList.add( 'hidden' );
			document.querySelector( '.ch2Detail' ).classList.remove( 'hidden' );
		}
	}
}

*/
// add menu 
var addForm = document.querySelector('.addForm');
addForm.addEventListener( 'submit', addFormSubmitHandler, false );

function addFormSubmitHandler( event )
{
	event.preventDefault();

	var form = this;

	// loading gif visible
	form.nextElementSibling.classList.remove( 'hidden' );
	
	// changing height of div
	var addBlock = this.parentNode.parentNode;
	addBlock.style.height = bufferHeight( addBlock )+'px';
	
	form.nextElementSibling.nextElementSibling.querySelector('.resumeCapability .xDetail').classList.remove('yes');
	form.nextElementSibling.nextElementSibling.querySelector('.resumeCapability .xDetail').classList.remove('no');
	var url = form.querySelector('input[name="newUrl"]').value;
	var request = new XMLHttpRequest();
	request.open( 'GET','php/download.php?'+'type=head&url='+url );
	
	request.onerror = function( event )
		{
			// display error
		};
	
	request.onreadystatechange = function()
		{
			if( request.readyState === 4 && request.status === 200 )
			{
				// successful
				// debuging
				console.log( request.response );
				var response = JSON.parse( request.response );
				if( response.hasOwnProperty( "error" ) )
				{
					form.nextElementSibling.classList.add( 'hidden' );
					addBlock.style.height = bufferHeight( addBlock )+'px'; 
					// error
					
					document.title = response.error;

					//var errorSound = 'data/error.mp3';
					//playSound( errorSound ); 

					// show error dialog box
					displayDialog( 'error', response.error );
				}
				else
				{
					console.log(response);
					var detail = form.nextElementSibling.nextElementSibling;
					var name = response.name;
					console.log(name);
					if( name == '')
					{
						name = 'file' + response.ext;
						console.log(name)
					}
					else if( name.indexOf(response.ext) < 0)
					{
						name = name + response.ext;
						console.log(name);
					}
					detail.children[0].setAttribute( 'data-type', response.type );
					detail.children[0].children[0].textContent = response.ext;
					detail.children[1].children[0].textContent = response.size;
					detail.children[2].children[0].value	   = name;
					detail.children[3].children[0].textContent = response.resume;

					detail.children[3].children[0].classList.add( response.resume.toLowerCase() );
					
					// showing details
					detail.classList.remove( 'hidden' );

					// hiding loading gif
					form.nextElementSibling.classList.add( 'hidden' );
					addBlock.style.height = bufferHeight( addBlock )+'px';

					checkFileName( detail.children[2].children[0] );

				}
			}
		};

	request.send( null );

}

function checkFileName( input )
{
	var request = new XMLHttpRequest;
	request.open('GET','php/checkFileName.php?name='+input.value);
	request.send(null);

	request.onreadystatechange = function()
	{
		if( request.readyState === 4 && request.status == 200 )
		{
			var data = request.response;
			if(data.length > 0)
			{
				console.log(data);
				data = JSON.parse(data);

				displayDialog('error', data.error);

				input.value = data.name;

			}
		}
	}
}
// save as file name
document.querySelector('.saveAs .xDetail').onblur = function()
	{	
		var ext = this.parentNode.parentNode.querySelector('.fileType .xDetail').textContent;

		if( this.value.indexOf( ext ) === -1 )
		{
			this.value = this.value + ext;
		}

		checkFileName( this );
	};

// download button of add big menu
document.querySelector( '.download' ).onclick = function( event )
	{
		event.preventDefault();

		// making height zero of div
		this.parentNode.parentNode.parentNode.classList.remove('block');
		this.parentNode.parentNode.parentNode.classList.add('zeroHeight');
		this.parentNode.parentNode.parentNode.style.cssText = "";

		// hiding details
		this.parentNode.classList.add('hidden');
		
		// showing the graph
		showGraph();

		var urlInput = this.parentNode.parentNode.querySelector('input[name="newUrl"]');
		var url = urlInput.value;
		urlInput.value = "";
		var filename = this.parentNode.querySelector('input[name="fileName"]').value;
		
		var support = this.parentNode.querySelector('.resumeCapability .xDetail').textContent;
		support = (support.toLowerCase() == 'yes') ? 'y' : 'n';
		
		var newDownload = new DownloadFile( url, filename, allDownload.length,support );

		allDownload.push( newDownload );
		console.log( "download_"+allDownload.length );

		newDownload.startStream();
		// adding new row
		var detail = document.querySelector( '.add .detail' );
		var type = detail.children[0].getAttribute( 'data-type' );
		var size = detail.children[1].querySelector( '.xDetail' ).textContent;

		addNewRow( filename, type , size ).scrollIntoView();
		setTableHeadWidth();
		// activating stop and delete button
		var button = document.querySelectorAll('.menuOptions span.stop, .menuOptions span.delete');
		button[0].classList.remove('deactive');
		button[1].classList.remove('deactive');
	};

// lightbox close button
	var lightbox = document.querySelector('.lightbox');
	
	lightbox.addEventListener('click',lightboxHandler,true);

	function lightboxHandler(event)
	{
		var clicked = event.target;
		if( clicked.classList.contains('close'))
		{
			var dialog = clicked.parentNode;
			var hide = dialog.classList.contains('complete');
			
			if( !dialog.classList.contains('properties'))
			{
				dialog.parentNode.removeChild(dialog);
				dialog.classList.add('hidden');
			}
			else
			{
				dialog.classList.add('hidden');
			}

			var allDialog = document.querySelector('.lightbox').children;
			if( allDialog.length == 3 )
			{
				document.querySelector('.lightbox').classList.add('hidden');
				document.title = "KINK Download Manager";
				if( hide )
				{
					hideGraph();
				}
			}
		}
	}


// title
function startChangingTitle( title1, title2, interval )
{
	var timer = setInterval( loop, interval || 1500 /* 1 sec */ ),
		count = 0;
	
	function loop()
	{
		document.title = ( count % 2 == 0 )? title1 : title2;
		count++;
	}

	getTimer = function()
		{
			return timer;
		}
}

function stopChangingTitle( title )
{
	var timer = getTimer();
	clearInterval( timer );
	document.title = title || "KINK Download Manager";
}

var fileTableBody = document.querySelector('.allFiles tbody');
fileTableBody.addEventListener('click',changeActiveHandler, false);

function changeActiveHandler( event )
{
	var clickedRow = event.target.parentNode;

	if( !clickedRow.classList.contains('active') )
	{
		if( clickedRow.getAttribute('data-status') == 'done')
		{
			return;
		}
		else if( clickedRow.getAttribute('data-status') == 'pause')
		{
			hideGraph();
			console.log('hidden');

			var button = document.querySelectorAll('.menuOptions .resume, .menuOptions .stop, .menuOptions .delete');
			button[0].classList.remove('deactive');
			button[1].classList.remove('deactive');
			button[2].classList.remove('deactive');
		}
		var filename = clickedRow.getAttribute('title');

		if(document.querySelector('.allFiles tr.active'))
		{
			document.querySelector('.allFiles tr.active').classList.remove('active');
		}
		clickedRow.classList.add('active');
		

		var graph = document.querySelector('#speedGraph');
		var activeIndex = graph.getAttribute('data-active');
		if( !(activeIndex == null) )
		{
			allDownload[activeIndex].active = false;
		}
		
		
		var totalDownload = allDownload.length;
		for( var i =0; i < totalDownload; i++ )
		{
			if(filename == allDownload[i].filename )
			{
				allDownload[i].active = true;
				break;
			}
		}

		if(clickedRow.getAttribute('data-status') != 'pause')
		{
			graph.setAttribute('data-active', i);
			showGraph();
		}
		
	}

}


DownloadFile = function( url, filename, index, support )
	{
		this.url 		=	 url;
		this.index 		=	 index;
		this.active 	=	 false;
		this.status 	=	 ''; // possible three values connecting downloading, pause, copying, complete
		this.filename 	=	 filename;
		this.support 	=	 support; // with extension
		this.stream 	=	 '';
		this.graph 		=	 new Graph( 80, 42, 1, 5, '#5074a0', 2, 'KBps' );;

		console.log(this);
	}

DownloadFile.prototype.startStream = function( resume )
	{
		this.active = true;
		var thisDownload = this;
		var speedGraph = document.querySelector('#speedGraph');
		var activeIndex =speedGraph.getAttribute('data-active');

		if( !isNaN(parseInt(activeIndex)) )
		{
			allDownload[activeIndex].active = false;
		}
		
		var activeDownload =document.querySelector('.allFiles tr.active');
		console.log(activeDownload);
		if( activeDownload )
		{
			activeDownload.classList.remove('active');
		}


		speedGraph.setAttribute( 'data-active', this.index );
		resume = resume || false;
		this.stream = new EventSource( 'php/download.php?resume='+resume+'&support='+this.support+'&type=get&filename='+this.filename+'&url='+this.url );
		
		this.stream.onerror = function( event )
			{
				// error connecting to the middle server
			};
		
		this.stream.onmessage = function( event )
			{

			};

		this.stream.addEventListener( 'mainerror', mainerrorHandler, false );
		this.stream.addEventListener( 'connecting', connectingHandler, false );
		this.stream.addEventListener( 'receiving', receivingHandler, false );
		this.stream.addEventListener( 'copying', copyingHandler, false );
		this.stream.addEventListener( 'complete', completeHandler, false );

		function mainerrorHandler( event )
		{
			/*
			 *	Error may be of any object it will be displayed in lightbox
			 *	If active also in progress bar
			 */

			// closing the connction 
			this.close();

			var data = event.data;
			if( thisDownload.active )
			{
				var progressDisplay = document.querySelector('.progress .info');
			
				progressDisplay.textContent = data;
				progressDisplay.nextElementSibling.classList.remove('ok');
				progressDisplay.nextElementSibling.classList.add('error');
			}
			
			//var errorSound = 'data/error.mp3';
			//playSound( errorSound );
			document.title = data;

			displayDialog('error',data);

			reOrderTable();
		}


		function connectingHandler( event )
		{
			thisDownload.status = "connecting";

			var data = event.data;

			if( thisDownload.active )
			{	
				var progressDisplay = document.querySelector('.progress .info');
				progressDisplay.nextElementSibling.style.cssText = "";
				progressDisplay.nextElementSibling.classList.remove('error');
				progressDisplay.nextElementSibling.classList.add('ok')
				progressDisplay.textContent = data;

				var spanXdetail = progressDisplay.parentNode.previousElementSibling.querySelectorAll('span.xDetail');
				spanXdetail[0].textContent = '0 KBps';
				spanXdetail[1].textContent = '0 KBps';
				spanXdetail[2].textContent = '0 sec';
				spanXdetail[3].textContent = '-';
				spanXdetail[4].textContent = '-';
			}
		}

		
		function receivingHandler( event )
		{
			thisDownload.status = "downloading";
			var percentDecimal = 2;
			
			// data is JSON object
			var data = JSON.parse( event.data.split('\n').join('') );
			console.log(data);

			// saving the points for the graphing
			thisDownload.graph.setPoints( parseInt( data.cSpeed ), data.cSpeed.substr( data.cSpeed.indexOf(' ') + 1 ) );
			
			if( thisDownload.active )
			{
				var progressDisplay = document.querySelector('.progress .info');
				var percent = ( data.per * 100 ).toFixed( percentDecimal );
				progressDisplay.textContent = "Receiving Data | " + percent + "% Done";
				progressDisplay.nextElementSibling.classList.remove('error');
				progressDisplay.nextElementSibling.classList.add('ok');// green background
				progressDisplay.nextElementSibling.style.width = data.per * 100 + "%";

				var spanXdetail = progressDisplay.parentNode.previousElementSibling.querySelectorAll('span.xDetail');
				spanXdetail[0].textContent = data.cSpeed;
				spanXdetail[1].textContent = data.aSpeed;
				spanXdetail[2].textContent = data.left;
				spanXdetail[3].textContent = data.done;
				spanXdetail[4].textContent = data.size;

				// setting title
				document.title = '('+parseInt( percent ) + '%) '+thisDownload.filename;

				thisDownload.graph.draw();
			}

			// updating corresponding row in table
			var row = document.querySelector('tr[title="'+thisDownload.filename+'"]');
			row.children[1].textContent = data.size;
			row.children[2].textContent = parseInt( data.per * 100 ) + '%';
			row.children[3].textContent = data.aSpeed;

		}

		
		function copyingHandler( event )
		{
			thisDownload.status = "copying";

			var data = event.data;
			
			if( thisDownload.active )
			{
				var progressDisplay = document.querySelector('.progress .info');
				progressDisplay.nextElementSibling.classList.remove('error');
				progressDisplay.nextElementSibling.classList.add('ok')
				progressDisplay.nextElementSibling.style.width = "100%";
				progressDisplay.textContent = data;
			}
		}

		
		function completeHandler( event )
		{
			thisDownload.status = "complete";

			// closing the connection thus preventing to reconnect
			this.close();

			var data = event.data;
			
			if( thisDownload.active )
			{
				thisDownload.active = false;
				var progressDisplay = document.querySelector('.progress .info');
				progressDisplay.nextElementSibling.style.width = "100%";
				progressDisplay.textContent = data;

				document.title = "KINK Download Manager";

				document.querySelector('.allFiles tr.active').classList.remove('active');
				document.querySelector('#speedGraph').removeAttribute('data-active');
			}

			document.querySelector('.allFiles tr[title="'+thisDownload.filename+'"]').setAttribute('data-status','done');

			
			// playing sound
			//var downloadCompleteAudio = 'data/success.mp3';
			//playSound( downloadCompleteAudio );
			
			var row = document.querySelector('tr[title="'+thisDownload.filename+'"]');
			row.setAttribute( 'data-status', 'done' );
			row.classList.remove('active');

			//hideGraph();
			displayDialog('complete', data);

			reOrderTable();
		}
	}
