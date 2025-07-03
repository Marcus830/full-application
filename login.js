class Login {
    constructor(form, fields){
        this.form = form;
        this.fields = fields;
    }
    validateOnSubmit(){
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            // Remove previous error messages
            this.form.querySelectorAll('.error-message').forEach(msg => msg.remove());
            let isValid = true;
            this.fields.forEach(field => {
                const input = this.form.querySelector(`#${field}`);
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('error-message');
                    errorMessage.textContent = `${field} is required`;
                    input.parentElement.appendChild(errorMessage);
                } else {
                    input.classList.remove('error');
                }
                if (field === 'password' && input.value.length < 8) {
                    isValid = false;
                    input.classList.add('error');
                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('error-message');
                    errorMessage.textContent = 'Password must be at least 8 characters long';
                    input.parentElement.appendChild(errorMessage);
                }
                if (field === 'username' && !/^[a-zA-Z0-9]+$/.test(input.value)) {
                    isValid = false;
                    input.classList.add('error');
                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('error-message');
                    errorMessage.textContent = 'Username can only contain letters and numbers';
                    input.parentElement.appendChild(errorMessage);
                }
            });
            if (isValid) {
                //do login api call here
                localStorage.setItem("username", this.form.querySelector('#username').value);
                localStorage.setItem("password", this.form.querySelector('#password').value);
                this.form.submit();
            } else {
                alert("Please fill in all fields.");
            }
        });
    }
}

const form = document.querySelector('#login-form');
if (form) {
    const fields = ["username", "password"];
    const loginInstance = new Login(form, fields);
}