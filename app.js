'use strict';
const $=id=>document.getElementById(id);
let last='AI Vision Assist listo para pruebas.', position=null, stream=null;
function say(message){last=message;$('status').textContent=message;if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(message);u.lang='es-US';u.rate=.9;speechSynthesis.speak(u)}}
$('test').onclick=()=>say('Prueba de audio correcta. Este prototipo no sirve para caminar sin asistencia.');
$('repeat').onclick=()=>say(last);
$('quiet').onclick=()=>{if('speechSynthesis' in window)speechSynthesis.cancel();$('status').textContent='Audio detenido.'};
$('loc').onclick=()=>{if(!navigator.geolocation){say('El GPS no está disponible. Abre esta aplicación por HTTPS.');return}say('Solicitando ubicación.');navigator.geolocation.getCurrentPosition(p=>{position=p;const accuracy=Math.round(p.coords.accuracy);$('coords').textContent=`Latitud ${p.coords.latitude.toFixed(5)}, longitud ${p.coords.longitude.toFixed(5)}. Precisión estimada ${accuracy} metros.`;$('maps').disabled=false;say(accuracy>30?`Ubicación recibida, pero la precisión estimada es de ${accuracy} metros. No uses esta posición para tomar decisiones de movilidad.`:`Ubicación aproximada recibida. Precisión estimada ${accuracy} metros. No garantiza una ruta segura.`)},e=>say('No se pudo obtener ubicación: '+e.message),{enableHighAccuracy:true,timeout:15000,maximumAge:0})};
$('maps').onclick=()=>{if(!position)return;const {latitude,longitude}=position.coords;window.open(`https://maps.apple.com/?ll=${encodeURIComponent(latitude+','+longitude)}`,'_blank','noopener')};
$('cam').onclick=async()=>{try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Se necesita HTTPS y un navegador compatible');if(stream)stream.getTracks().forEach(t=>t.stop());stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});$('video').srcObject=stream;say('Cámara activada. No hay detección de objetos ni obstáculos.')}catch(e){say('No se pudo activar la cámara: '+e.message)}};
$('stop').onclick=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;say('Cámara detenida.')};
$('sos').onclick=()=>{const phone=$('phone').value.trim();if(!/^\+?[0-9 ()-]{7,20}$/.test(phone)){say('Introduce un número de teléfono válido antes de preparar el mensaje.');return}let msg='Necesito ayuda. Por favor, llámame.';if(position){const {latitude,longitude,accuracy}=position.coords;msg+=` Mi última ubicación aproximada (precisión estimada ${Math.round(accuracy)} m): https://maps.google.com/?q=${latitude},${longitude}`;}if(!confirm(`¿Abrir Mensajes para ${phone}? El mensaje NO se enviará automáticamente.`))return;const sep=/iPad|iPhone|iPod/.test(navigator.userAgent)?'&':'?';window.location.href=`sms:${phone}${sep}body=${encodeURIComponent(msg)}`;say('Se intentó abrir Mensajes. Verifica destinatario y contenido antes de enviar.')};
window.addEventListener('pagehide',()=>{if(stream)stream.getTracks().forEach(t=>t.stop())});
let visionModel = null;
let visionRunning = false;
async function loadVisionAI() {
  try {
    speak("Cargando inteligencia visual.");
    visionModel = await cocoSsd.load();
    speak("Inteligencia visual lista.");
    console.log("AI Vision Assist: modelo cargado");
  } catch (error) {
    console.error("Error cargando IA:", error);
    speak("No pude cargar la inteligencia visual.");
  }
}

async function analyzeCameraFrame() {
  if (!visionRunning || !visionModel) return;

  const video = document.querySelector("video");

  if (!video || video.readyState < 2) {
    requestAnimationFrame(analyzeCameraFrame);
    return;
  }

  try {
    const predictions = await visionModel.detect(video);

    const usefulObjects = predictions
      .filter(item => item.score >= 0.65)
      .sort((a, b) => b.score - a.score);

    if (usefulObjects.length > 0) {
      const object = usefulObjects[0];

      console.log(
        `Detectado: ${object.class} ${Math.round(object.score * 100)}%`
      );
    }
  } catch (error) {
    console.error("Error analizando cámara:", error);
  }

  setTimeout(analyzeCameraFrame, 500);
}

function startVisionAI() {
  if (!visionModel) {
    speak("La inteligencia visual todavía se está cargando.");
    return;
  }

  visionRunning = true;
  speak("Visión inteligente activada.");
  analyzeCameraFrame();
}

function stopVisionAI() {
  visionRunning = false;
  speak("Visión inteligente detenida.");
}

window.addEventListener("load", loadVisionAI);
