window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const canvasDimensionsLabel = document.getElementById('canvasDimensionsLabel');
    const toggleThemeButton = document.getElementById('toggleThemeButton');
    const lightThemeColor = '#ebebeb';
    const darkThemeColor = '#252525';

    let isDarkTheme = false;

    const backgroundImg = new Image();
    const baseBackgroundPath = 'media/backgrounds/';

    let overlayImg = null;
    const overlayImgLabel = document.getElementById('overlayImgLabel');
    let overlayImgPosition = { x: 0, y: 0 };
    const initialOverlayImgScale = 0.75;
    let overlayImgScale = 1;
    let isDraggingOverlayImg = false;

    const backgroundImgSelect = document.getElementById('backgroundImgSelect');
    const overlayImgInput = document.getElementById('overlayImgInput');
    const saveButton = document.getElementById('saveButton');

    initApp();

    function initApp() {
        loadBackground(backgroundImgSelect.value);
        updateCanvasTheme();
        saveButton.disabled = true;
    }

    function loadBackground(imageName) {
        backgroundImg.src = baseBackgroundPath + imageName;

        backgroundImg.onload = () => {
            canvas.width = backgroundImg.width;
            canvas.height = backgroundImg.height;
            updateCanvasDimensionsLabel();
            drawCanvas();
        };
    }

    function enableSaveButton() {
        if (overlayImg) {
            saveButton.disabled = backgroundImgSelect.value == 'reference.png';
        } else {
            saveButton.disabled = true;
        }
    }

    function isMouseOnOverlayImg(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        return !overlayImg ? false :
            mouseX >= overlayImgPosition.x &&
            mouseX <= overlayImgPosition.x + overlayImg.width &&
            mouseY >= overlayImgPosition.y &&
            mouseY <= overlayImgPosition.y + overlayImg.height;
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImg, 0, 0);
        if (overlayImg) {
            const scaledWidth = overlayImg.width * overlayImgScale;
            const scaledHeight = overlayImg.height * overlayImgScale;

            const drawX = overlayImgPosition.x + (overlayImg.width - scaledWidth) / 2;
            const drawY = overlayImgPosition.y + (overlayImg.height - scaledHeight) / 2;

            ctx.drawImage(overlayImg, drawX, drawY, scaledWidth, scaledHeight);
        }
    }

    function updateCanvasDimensionsLabel() {
        canvasDimensionsLabel.textContent = `${canvas.width} X ${canvas.height}`;
    }

    function updateCanvasTheme() {
        isDarkTheme = !isDarkTheme;
        if (isDarkTheme) {
            canvas.style.backgroundColor = darkThemeColor;
            toggleThemeButton.style.backgroundColor = darkThemeColor;
        } else {
            canvas.style.backgroundColor = lightThemeColor;
            toggleThemeButton.style.backgroundColor = lightThemeColor;
        }
    }

    toggleThemeButton.addEventListener('mouseenter', () => {
        if (isDarkTheme) {
            toggleThemeButton.style.backgroundColor = lightThemeColor;
        } else {
            toggleThemeButton.style.backgroundColor = darkThemeColor;
        }
    });
    
    toggleThemeButton.addEventListener('mouseleave', () => {
        toggleThemeButton.style.backgroundColor = canvas.style.backgroundColor;
    });

    toggleThemeButton.addEventListener('click', () => {
        updateCanvasTheme();
        
        if (isDarkTheme) {
            toggleThemeButton.style.backgroundColor = lightThemeColor;
        } else {
            toggleThemeButton.style.backgroundColor = darkThemeColor;
        }
    });

    window.addEventListener('resize', updateCanvasDimensionsLabel);

    backgroundImgSelect.addEventListener('change', () => {
        loadBackground(backgroundImgSelect.value);
        enableSaveButton();
    });

    overlayImgInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const newOverlayImg = new Image();
                newOverlayImg.src = e.target.result;
                newOverlayImg.onload = () => {    
                    const overlayAspectRatio = newOverlayImg.width / newOverlayImg.height;
                    const canvasAspectRatio = canvas.width / canvas.height;
    
                    let drawWidth, drawHeight;
                    if (overlayAspectRatio > canvasAspectRatio) {
                        drawWidth = canvas.width;
                        drawHeight = canvas.width / overlayAspectRatio;
                    } else {
                        drawHeight = canvas.height;
                        drawWidth = canvas.height * overlayAspectRatio;
                    }
    
                    drawWidth = drawWidth * initialOverlayImgScale;
                    drawHeight = drawHeight * initialOverlayImgScale;
    
                    overlayImg = newOverlayImg;
                    overlayImg.width = drawWidth;
                    overlayImg.height = drawHeight;
    
                    overlayImgPosition = {
                        x: (canvas.width - overlayImg.width) / 2,
                        y: (canvas.height - overlayImg.height) / 2,
                    };
    
                    overlayImgScale = initialOverlayImgScale;
    
                    overlayImgLabel.textContent = file.name;
    
                    drawCanvas();
                    enableSaveButton();
                };
    
                newOverlayImg.onerror = () => {
                    alert('Failed to load overlay image');
                    saveButton.disabled = true;
                };
            };
            
            reader.readAsDataURL(file);
        }
    });

    canvas.addEventListener('mousedown', (event) => {
        if (overlayImg) {
            if (isMouseOnOverlayImg(event)) {
                canvas.style.cursor = 'grabbing';
                isDraggingOverlayImg = true;
            }
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (overlayImg) {
            if (isDraggingOverlayImg) {
                overlayImgPosition.x = mouseX - overlayImg.width / 2;
                overlayImgPosition.y = mouseY - overlayImg.height / 2;
                
                drawCanvas();
            } else {
                if (isMouseOnOverlayImg(event)) {
                    canvas.style.cursor = 'grab';
                } else {
                    canvas.style.cursor = 'default';
                }
            }
        } else {
            canvas.style.cursor = 'default';
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        canvas.style.cursor = 'grab';
        isDraggingOverlayImg = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDraggingOverlayImg = false;
    });

    canvas.addEventListener('wheel', (event) => {
        if (overlayImg) {
            if (isMouseOnOverlayImg(event)) {
                canvas.style.cursor = 'move';
                event.preventDefault();

                const scaleStep = 0.1;
                overlayImgScale += event.deltaY < 0 ? scaleStep : -scaleStep;
                overlayImgScale = Math.max(0.1, Math.min(overlayImgScale, 5));

                drawCanvas();
            }
        }
    });

    saveButton.addEventListener('click', () => {
        let dotIndex = overlayImgLabel.textContent.lastIndexOf('.');
        let newImageTitle = dotIndex !== -1 ? 
            overlayImgLabel.textContent.substring(0, dotIndex) + '_csita_edit.png' :
            overlayImgLabel.textContent;
        //console.log(newImageTitle);

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        tempCtx.drawImage(canvas, 0, 0);
    
        try {
            const dataURL = tempCanvas.toDataURL();
            const link = document.createElement('a');
            link.download = newImageTitle;
            link.href = dataURL;
            link.click();
        } catch (error) {
            console.error('Canvas is tainted and cannot be exported: ', error);
            alert('Failed to save image. The canvas is tainted.');
        }
    });
    
};
