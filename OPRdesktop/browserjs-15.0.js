// a4K0f4ZmQmxKP0aXxhGEGHALuRGVUxEQDdW1q8PwiZtVQpyqjc6Q/gmTnD6kQnbVoOSQcQ7tHavDBclk4GH24gdC3XFxTwnvZrwGV0SuWMkulNF67Y92a13U3gn21v9MyxUZbntYgUgCi7XJo0uWWKx/IKT6plGdO31H5nHPjTk2+5sqNgnMcK+XC+g7Tjtd/guP1z8WOarzIWqH2SJX9pQbkOUH7H8ejv1YUin3du3E2nOR7c2c9EZJj0wT6klCXWCr4yYBy7CznmQuIeR+LrP8EX+tzb/XcOurm3kW6Ce4wsxyXDzGL4RWQqqv1O0zpuikhJilOkU74Wt2S0SoYw==
/**
** Copyright (C) 2000-2014 Opera Software ASA.  All rights reserved.
**
** This file is part of the Opera web browser.
**
** This script patches sites to work better with Opera
** For more information see http://www.opera.com/docs/browserjs/
**
** If you have comments on these patches (for example if you are the webmaster
** and want to inform us about a fixed site that no longer needs patching) please
** report issues through the bug tracking system
** https://bugs.opera.com/
**
** DO NOT EDIT THIS FILE! It will not be used by Opera if edited.
**/
// Generic fixes (mostly)
(function(){
	var bjsversion=' Opera OPRDesktop 15.00 core 1326.63, February 7, 2014. Active patches: 15 ';
	// variables and utility functions
	var navRestore = {}; // keep original navigator.* values
	var shouldRestore = false;
	var hostname = {
		value:location.hostname, 
		toString:function(){return this.value;},
		valueOf:function(){return this.value;}, 
		indexOf:function(str){return this.value.indexOf(str);},
		match: function(rx){ return this.value.match(rx); },
		contains:function(str){ return this.value.indexOf(str)>-1; },
		endsWith:function(str){ var pos=this.value.indexOf(str);return pos>-1 && this.value.length===pos+str.length; }
	}
	var href = location.href;
	var pathname=location.pathname;
	var call = Function.prototype.call,
	getElementsByTagName=Document.prototype.getElementsByTagName,
	addEventListener=Window.prototype.addEventListener,
	createElement=Document.prototype.createElement,
	createTextNode=Document.prototype.createTextNode,
	insertBefore=Node.prototype.insertBefore,
	setAttribute=Element.prototype.setAttribute,
	appendChild=Node.prototype.appendChild,
	setTimeout=window.setTimeout;
	function log(str){if(self==top && !str.match(/^0,/))console.log('Opera has modified script or content on '+hostname+' ('+str+'). See browser.js for details');}


	// Utility functions

	function addCssToDocument2(cssText, doc, mediaType){
		getElementsByTagName.call=addEventListener.call=createElement.call=createTextNode.call=setAttribute.call=appendChild.call=call;
		doc = doc||document;
		mediaType = mediaType||'';
		addCssToDocument2.styleObj=addCssToDocument2.styleObj||{};
		var styles = addCssToDocument2.styleObj[mediaType];
		if(!styles){
			var head = getElementsByTagName.call(doc, "head")[0];
			if( !head ){//head always present in html5-parsers, assume document not ready
				addEventListener.call(doc, 'DOMContentLoaded',
					function(){ addCssToDocument2(cssText, doc, mediaType); },false);
				return;
			}
			addCssToDocument2.styleObj[mediaType] = styles = createElement.call(doc, "style");
			setAttribute.call(styles, "type","text/css");
			if(mediaType)setAttribute.call(styles, "media", mediaType);
			appendChild.call(styles, createTextNode.call(doc,' '));
			appendChild.call(head, styles)
		}
		styles.firstChild.nodeValue += cssText+"\n";
		return true;
	}



	if((hostname.endsWith('.nic.in') || hostname.endsWith('.gov.in')) && hostname.contains('ssc')){
		if(hostname.match(/ssc(?:online)?2?\.(?:nic|gov)\.in/)) {
			document.addEventListener('DOMContentLoaded', function() {
				Object.defineProperty(window.navigator, "appName", {
					get: function() { return 'Opera'}
				});
			}, false)
		}
		
		log('PATCH-1173, ssc[online][2].{nic,gov}.in - Netscape not supported message - workaround browser sniffing');
	} else if(hostname.endsWith('lingualeo.ru')){
		addCssToDocument2('div.body-bg-top, div.body-bg-bot {-webkit-transform: none}')
		log('PATCH-1171, lingualeo.ru - show embedded videos from ted.com');
	} else if(hostname.endsWith('my.tnt.com')){
		var _orig_clearPrintBlock;
		function handleMediaChange(mql) {
			if (mql.matches) {
				if(typeof clearPrintBlock == "function"){
					_orig_clearPrintBlock = clearPrintBlock;
					clearPrintBlock = function(){}
				}
			} else {
				if(typeof _orig_clearPrintBlock == "function"){
					setTimeout(_orig_clearPrintBlock, 500);
				}
			}
		}
		
		document.addEventListener('DOMContentLoaded', function() {
			var mpl = window.matchMedia("print");
			mpl.addListener(handleMediaChange);
		},false);
		log('PATCH-1156, my.tnt.com - fix empty printout');
	} else if(hostname.endsWith('vimeo.com')){
		var isPatched = false;
		function patch(){
			document.body.addEventListener('click',function(){
				if(isPatched)return
				if(document.querySelector('object') && document.querySelector('object').SetVariable === undefined ){
					addCssToDocument2('div.target{display:none !important;}');
					document.querySelector('div.player').addEventListener('mousedown',function(e){
						e.stopPropagation();
					},true);
				}
				isPatched = true;
			},false);
		}
		window.addEventListener('load',patch,false);
		log('PATCH-1166, vimeo.com - make click-to-play and turbo mode work');
	} else if(hostname.endsWith('www.stanserhorn.ch')){
		Object.defineProperty(navigator, 'vendor', { get: function(){ return 'Google Inc.' } });
		log('OTWK-21, stanserhorn.ch - fix UDM sniffing');
	} else if(hostname.indexOf('.google.')>-1){
		/* Google */
	
	
		if(hostname.contains('docs.google.')){
			document.addEventListener('DOMContentLoaded',function(){
				var elm = document.querySelector('a[href="http://whatbrowser.org"] + a + a');
				if(elm){elm.click();}
			},false);
			log('PATCH-1032, Google Docs - auto-close unsupported browser message');
		}
		if(hostname.contains('mail.google.')){
			addCssToDocument2('div.n6 {display: block !important} table.cf.hX{display:inline-table}');//"more", labels
			log('PATCH-1163, No "More" button in Gmail and misaligned labels');
		}
		if(hostname.contains('otvety.google.')){
			document.addEventListener('DOMContentLoaded', function() {
				var elm = document.querySelector('div.unspbr');
				if (elm) { elm.remove(); }
			});
			log('PATCH-1168, otvety.google.ru - remove "unsupported browser" banner');
		}
		if(hostname.contains('translate.google.')){
			document.addEventListener('DOMContentLoaded',
				function(){
					var obj = '<object type="application/x-shockwave-flash" data="//ssl.gstatic.com/translate/sound_player2.swf" width="18" height="18" id="tts"><param value="//ssl.gstatic.com/translate/sound_player2.swf" name="movie"><param value="sound_name_cb=_TTSSoundFile" name="flashvars"><param value="transparent" name="wmode"><param value="always" name="allowScriptAccess"></object>';
					var aud = document.getElementById('tts');
					if(aud && aud instanceof HTMLAudioElement && aud.parentNode.childNodes.length == 1){
						aud.parentNode.innerHTML = obj;
					}
				}
			,false);
			log('PATCH-1148, Google Translate: use flash instead of mp3-audio');
		}
		log('0, Google');
	} else if(hostname.indexOf('.yahoo.')>-1){
		/* Yahoo! */
		log('0, Yahoo!');
	} else if(hostname.indexOf('.youtube.com')>-1){
		if( navigator.mimeTypes['application/x-shockwave-flash'] && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin ){
		 HTMLMediaElement.prototype.canPlayType = function(){return ''}
		}
		log('PATCH-1164, YouTube force Flash player for HTML5 content');
	} else if(hostname.indexOf('opera.com')>-1&& pathname.indexOf('/docs/browserjs/')==0){
		document.addEventListener('DOMContentLoaded',function(){
			if(document.getElementById('browserjs_active')){
				document.getElementById('browserjs_active').style.display='';
				document.getElementById('browserjs_active').getElementsByTagName('span')[0].appendChild(document.createTextNode(bjsversion));
				document.getElementById('browserjs_status_message').style.display='none';
			}else if(document.getElementById('browserjs_status_message')){
				document.getElementById('browserjs_status_message').firstChild.data='Browser.js is enabled! '+bjsversion;
			}
		}, false);
		log('1, Browser.js status and version reported on browser.js documentation page');
	} else if(href==='https://bugs.opera.com/wizarddesktop/'){
		document.addEventListener('DOMContentLoaded', function(){
			var frm;
			if(document.getElementById('bug') instanceof HTMLFormElement){
				frm=document.getElementById('bug');
				if(frm.auto)frm.auto.value+='\n\nBrowser JavaScript: \n'+bjsversion;
			}
		}, false);
		log('PATCH-221, Include browser.js timestamp in bug reports');
	} else if(pathname.indexOf('/AnalyticalReporting/')==0){
		if(pathname.indexOf('AnalyticalReporting/WebiModify.do')>-1 || pathname.indexOf('AnalyticalReporting/WebiCreate.do')>-1){
			Object.defineProperty(window, 'embed_size_attr', {
				get:function(){return this._foobar},
				set:function(arg){
					if(arg=='style="width: 100%; height: 100%;')this._foobar='style="width: 100%; height: 100%;"';
					else this._foobar = arg;
				}
			});	
		}
		log('PATCH-555, Analytix: add missing end quote');
	}

})();
