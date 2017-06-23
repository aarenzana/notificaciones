/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var user_id="";
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Received Device Ready Event');
        console.log('calling setup push');
        app.setupPush();
    },
    setupPush: function() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "31422596226"
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);

            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }

            //alert('Callback Success! V 2= '+data.registrationId);




            var parentElement = document.getElementById('registration');
            var listeningElement = parentElement.querySelector('.waiting');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');

            user_id="";

            var param = "did="+data.registrationId;

           if ( data.registrationId!="" )
            {

                        $.ajax({
                        type:"POST",
                        url: "http://adpdev.com/adp/mx/api/register_id.php",
                       	beforeSend:function(){
                       		listeningElement.setAttribute('style', 'display:none;');
                       	},
                      	data: param,
                      	cache:false,
                      	crossDomain: true,
					    success: function (result) {
					    	console.log(result);
					    	if(result!="register"){

					    		user_id=result;
					    		//localStorage.setItem('user_id', data.registrationId);
					    		receivedElement.setAttribute('style', 'display:block;');
					       		console.log("registrado en adpdev id_usuario="+result);
					       		updateComentarios(user_id);
					       	}else{

					       		redirect("login.html");

					       	}
					    }
               			});

                    //$("#app-status-ul").append('<li>REGISTERED ID is : -> REGID:' + e.regid + "</li>");
                    //console.log("regID = ");
                    //alert("regID = " + e.regid);
            }





        });



        function redirect(page)
	    {
	    	//alert(page);

	        window.location.href=page;
	    }

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        function getTarea(buttonIndex, message){
        	var res = message.split("tarea");
        if (buttonIndex==1){
            window.open(res[1], '_system', 'location=no');
            }

          updateComentarios(user_id);
        }


       function updateComentarios(id_usuario){

       	console.log("Renueva comentarios de "+id_usuario);

        var id_usuario = id_usuario;

        meta = {action:"traer-sin-responder-mis-tareas",version:"2.0"};
        dataset = {id_usuario:id_usuario};
        data_post = {meta:meta, dataset:dataset};

        // console.log(JSON.stringify(data_post, null, 2));


        var request = $.ajax({
          url: "http://adpdev.com/adp/mx/tareas-api-v1.php",
          type: "POST",
          data: JSON.stringify(data_post),
          dataType: "json",
          cache:false,
          success: function(data, status, xhr){
              if(data.meta.status=="ok"){
                  //console.log(data.info,data.dataset);

                  // Pone los números en badgets
                  console.log("Recibí los datos");
                  //&console.log(data.info.comentarios_total);

                  var myHtmlList = "";

                  $.each(data.dataset.comentarios, function(index, value) {


			        var red="";

			        if(value.co_viewed=="muted")
			        	red="";
			        else
			         	red="-unread";


              // if(value.co_id_usuario=="")
              //   value.co_id_usuario = "thumb2";

			       myHtmlList+=`
                 <li class="list-message">
                   <a href="#" class="w-clearfix w-inline-block" data-load="1" >
                     <div class="column-left w-clearfix">
                       <div id="resource-img" class="image-message${red}">
                         <object data="http://adpdev.com/adp/images/linkedin/${value.co_id_usuario}.png" type="image/png">
                          <img src="http://adpdev.com/adp/images/linkedin/avatar.png" />
                         </object>
                       </div>
                       <div class="time time-elapsed${red}">
                         ${value.co_fecha_registro}
                       </div>
                     </div>
                     <div class="column-right">
                       <div class="time-elapsed">
                         <span class="msg-recurso">${value.co_recurso}<span>
                         <span class="msg-title"> en ${value.co_nombre_tarea_full}</span>
                       </div>
                       <div>
                         <div class="message-text">${value.co_comentario_trim}</div>

                         <div class="message-text-full" style="display:none;">${value.co_comentario_full}</div>
                       </div>
                       <div class="tarealink" style="display:none">${value.co_id_tarea}#commid${value.co_id_comentario}</div>
                     </div>
                   </a>
                 </li>
             `;


                  });
                  //console.log(myHtmlList);

                  $("#listamensajes").empty().append(myHtmlList);

              }else{
                  console.log("error");
              }
          },
          error: function (request, status, error) {
                  console.log("error");
          }
        });
    }



     $("#listamensajes").on("click", ".list-message", function(){
       var msgRecurso = $(this).find(".msg-recurso").html()
         , recursoImg = $(this).find("#resource-img").html()
         , msgTitle = $(this).find(".msg-title").html()
         , msgCommentTrim = $(this).find(".message-text").html()
         , msgComment = $(this).find(".message-text-full").html()
         , timeElapsed = $(this).find(".time").html()
         , tareaLink = $(this).find(".tarealink").html()
         , singleMessage = '';

         console.log($('#listamensajes').html());

       singleMessage+=`
            <div id="singleMessage" class="message">
              <div class="message-head">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="20%">
                      <div class="image-message">${recursoImg}</div>
                    </td>
                    <td width="80%">
                      <div class="resource">
                        <b>${msgRecurso}</b>
                        <div class="timeel">Hace ${timeElapsed}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="message-body">
                <p class="full-message-text">${msgComment}</p>
                <br />
              </div>
              <div style="text-align:right;">
                <a href="#" onclick="cordova.InAppBrowser.open('http://t.adp.mx/${tareaLink}', '_system');return false;" class="tarea-link btn" data-load="1" >Ir al comentario</a>
              </div>
            </div>
        `;



       $.fancybox.open({
          src   : singleMessage,
          type  : 'inline',
          opts  : {
            touch : {
                vertical : false
            }
          },
       });

       $(".fancybox-slide").on( "swipeleft", function() {
          parent.$.fancybox.close();
       } );







      //  var singleMsg = window.open('mensaje.html');
      //  singleMsg.$(".single-message").html("mensajeInd");

     });




        push.on('notification', function(data) {
        	 updateComentarios(user_id);
            console.log('notification event');
            /*navigator.notification.alert(
                data.message,         // message
                function(buttonIndex){
		            getTarea(buttonIndex, data.message);
		        },                 // callback
                "¿Ver Tarea?",           // title
                ['Ok']                  // buttonName
            );*/


       });
    }
};
