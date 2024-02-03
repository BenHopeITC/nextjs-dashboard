import { Selector } from 'testcafe';

// when Typescript compiles the global variable for test, 
// it ends up with the Jest declaration instead of the TestCafe declaration.
declare const test: TestFn;

fixture `Login Page (close to code)`
    .page `http://localhost:3000/login`;

test('user can login (close to code)', async t => {
    let emailInput = Selector('#email');
    let passwordInput = Selector('#password');
    let loginButton = Selector('#login');
    let dashboardScreen = Selector('h1');
    await t
        .typeText(emailInput,'user@nextmail.com')
        .expect(emailInput.value).eql('user@nextmail.com')
        .typeText(passwordInput,'Foo123!')
        .expect(passwordInput.value).eql('Foo123!')
        .click(loginButton)
        .expect(dashboardScreen.innerText).eql('Dashboard');
  });
