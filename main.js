class ControllerUI{
  
  constructor(){
    this.init();
  }
  init(){

    this.connectToServer();

    this.createUI();
  }
  createUI(){
    let _me = this;

    const sectionMain = document.createElement('div');
    sectionMain.id = "sectionMain";

    this.sectionResponseServerStatus= document.createElement('div');
    this.sectionResponseServerStatus.id = "sectionResponseServerStatus";
    
    this.sectionResponseAI = document.createElement('div');
    this.sectionResponseAI.id = "sectionResponseAI";
    this.firstimage = false;



    // Crear un botón y un input text y agregarlo al DOM
    const sectionControlUser = document.createElement('div');
    sectionControlUser.id = "sectionControlUser";

    this.inputText = document.createElement('textarea');
    this.inputText.id = "inputText";
    this.inputText.textContent = 'Get AI Response';
    this.inputText.value = "an astronaut riding a horse on mars, hd, dramatic lighting";
    this.inputText.setAttribute('tabindex', '0');
    this.inputText.setAttribute('autocomplete', 'off');
    this.inputText.setAttribute('autocorrect', 'off');
    this.inputText.setAttribute('autocapitalize', 'off');
    this.inputText.setAttribute('spellcheck', 'false');
    this.inputText.setAttribute('name', 'q');
    this.inputText.setAttribute('rows', '2');
    this.inputText.setAttribute('placeholder', 'Imagine anything. What image do you need?');
    this.inputText.setAttribute('aria-label', 'Imagine anything. What image do you need?');

    this.inputText.addEventListener('input', () => {
      ajustarAltura();
      if (this.inputText.value.trim() === '') {
        this.button.disabled = true;
      } else {
        this.button.disabled = false;
      }
    });

    function ajustarAltura() {
      _me.inputText.style.height = 'auto'; // Restablece la altura a automática para obtener el nuevo tamaño
      _me.inputText.style.height = _me.inputText.scrollHeight + 'px'; // Establece la altura según el contenido
    }

    const sectionBtn = document.createElement('div');
    sectionBtn.className = 'sectionBtn'

    this.button = document.createElement('button');
    this.button.textContent = 'Generate Image';
   
    this.button.addEventListener('click', ()=>{
      _me.requestToServer();
    });

    sectionBtn.appendChild(this.button);

    sectionControlUser.appendChild(this.inputText);
    sectionControlUser.appendChild(sectionBtn);


    const sectionControllerDivBasic = document.createElement('div');
    sectionControllerDivBasic.id ="sectionControllerDivBasic";
    const bgsectionbeauty = document.createElement('div');
    bgsectionbeauty.id ="bgsectionbeauty";
    const responsiveSectionContainerController = document.createElement('div');
    responsiveSectionContainerController.id ="responsiveSectionContainerController";

    sectionControllerDivBasic.appendChild(sectionControlUser);
    bgsectionbeauty.appendChild(sectionControllerDivBasic);
    responsiveSectionContainerController.appendChild(bgsectionbeauty);

    sectionMain.appendChild(responsiveSectionContainerController);
    sectionMain.appendChild(this.sectionResponseAI);
    sectionMain.appendChild(this.sectionResponseServerStatus);
    
    document.body.appendChild(sectionMain)

  }
  async connectToServer(){
    // Crear una conexión WebSocket al servidor
    let url = import.meta.env.VITE_url_Backend;
    this.ws = new WebSocket(url);

    // Manejar la conexión abierta
    this.ws.onopen = () => {
        console.log('Connected to the WebSocket server');
    };

    // Manejar mensajes recibidos del servidor
    this.ws.onmessage = (event) => {
      const message = event.data;
      console.log('Message from server:', message);

      // Parsear el mensaje recibido
      const parsedMessage = JSON.parse(message);
      
      switch (parsedMessage.type) {
        case "log":
          // Mostrar la respuesta en el DOM (si no es del tipo esperado)
          const respElement = document.createElement('div');
          respElement.className = 'logServer';
          respElement.textContent = `Server says: ${parsedMessage.message}`;
          this.sectionResponseServerStatus.appendChild(respElement);
          break;
        case "output":
          if(!this.firstimage){
            // Crear un elemento de imagen
            this.img = document.createElement('img');
            this.img.src = parsedMessage.data[0]; // Usar el primer URL de la lista
            this.img.alt = 'Generated Image';
            this.img.className = "imgServer firstimage";
  
            // Añadir un evento 'load' a la imagen
            this.img.addEventListener('load', () => {
              // Añadir la imagen al DOM
              this.sectionResponseAI.appendChild(this.img);
              if(!this.firstimage){
                this.sectionResponseAI.style.height = '500px';
                this.firstimage = true;
              }
  
              // Hacer scroll hacia abajo
              this.sectionResponseAI.scrollTop = this.sectionResponseAI.scrollHeight;
            });
          }else{
            this.img.src = parsedMessage.data[0];
          }

          this.button.innerHTML = "Generate other image?"
          this.button.classList.remove("cargando");


          this.button.disabled = false;
          break;
        case "error":
          // Mostrar la respuesta en el DOM (si no es del tipo esperado)
          const responseDiv = document.createElement('div');
          responseDiv.className = "alertServer"
          responseDiv.textContent = `Server says Error: ${parsedMessage.message}`;
          this.sectionResponseServerStatus.appendChild(responseDiv);
          break;
      
        default:
          break;
      }

    };

    // Manejar errores de la conexión
    this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    // Manejar el cierre de la conexión
    this.ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
  }
  requestToServer(){
    this.button.innerHTML = "Generating image"
    this.button.classList.add("cargando");
    this.button.disabled = true;
    const prompt = this.inputText.value; // Ejemplo de prompt
    const message = {
        type: 'prompt',
        prompt: prompt
    };
    this.ws.send(JSON.stringify(message));

  }
}

const controllerUI =  new ControllerUI();