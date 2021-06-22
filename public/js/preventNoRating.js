const ratingForm = document.querySelector('.rating');

ratingForm.addEventListener('submit', function (e) {
    if (!ratingForm[1].checked) {
        return true;
    } else {
        e.preventDefault();
        alert('Please leave a star rating!')
    }
});