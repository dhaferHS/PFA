/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login } from './login';

// dom element 
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
} else {
  console.error('No map element found in the HTML');
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
} else {
  console.error('No login form element found in the HTML');
}
