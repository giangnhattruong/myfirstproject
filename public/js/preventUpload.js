const imageUpload = document.querySelector('#choose-files')
const uploadBtn = document.querySelector('#upload-btn')

uploadBtn.disabled = true;
imageUpload.addEventListener('change', () => {
    if (imageUpload.elements.image.value) {
        uploadBtn.disabled = false;
    } else {
        uploadBtn.disabled = true;
    }
    return uploadBtn.disabled;
});