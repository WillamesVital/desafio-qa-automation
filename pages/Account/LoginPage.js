export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = this.page.locator('#userName');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.locator('#login');
    this.welcomeUser = this.page.locator('#userName-value');
  }

  async goto() {
    await this.page.goto('https://demoqa.com/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isLoggedInAs(username) {
    await this.welcomeUser.waitFor();
    return this.welcomeUser.textContent().then(t => (t || '').trim() === username);
  }
}
