(function ($) {
    "use strict";
    $(document).ready(function () {
        console.log('rhis is running')

        $('form').submit(function (e) {
            fetch('/message', {
                method='POST',
                mode='cors',
                body={
                    name: document.getElementById('form-name').value,
                    email: document.getElementById('form-email').value,
                    subject: document.getElementById('form-subject').value,
                    content: document.getElementById('form-content').value,
                }
            })
                .then(json)
                .then(function (data) {
                    if (data.success == true) {
                        document.getElementById('sent-message').innerHTML = "Meaage Sent!"
                    }
                    else {
                        document.getElementById('sent-message').innerHTML = "Internal Server Error Try again later."
                    }
                })
                .catch(function (error) {
                    document.getElementById('sent-message').innerHTML = error
                });
            e.preventDefault(e);
        })
    });
})(jQuery)