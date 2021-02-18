import '../style/app.scss';
// import './app';

const ApiUrl = 'http://localhost:3000/person';

class PageController {
  constructor(mainSelector, apiUrl) {
    this.mainSelector = document.querySelector(mainSelector);
    this.apiService = new ApiService(apiUrl);
    this.tableSeltctor = '#listUser';
  }

  clear() {
    this.mainSelector.querySelector(this.tableSeltctor).innerHTML = ``;
  }

  init() {
    this.initHeaderActions();
    this.render()
  }

  initHeaderActions() {
    const buttonModal = document.querySelector('#buttonModal');
    buttonModal.addEventListener('click', (event) => {
      event.preventDefault();
      new AddUserModal((user) => {
        this.apiService.addUser(user).then(() => this.render());
      }).open();
    });
  }

  async render() {
    this.clear();
    this.renderListUser().then(() => this.initUserListActions())
  }

  async renderListUser() {
    const listUser = await this.getUsers();
    listUser.render(this.tableSeltctor)
  }

  initUserListActions() {
    const buttonsDelete = document.querySelectorAll('#buttonDelete');
    buttonsDelete.forEach(item => {
      item.addEventListener('click', () => {
        let tr = item.closest('tr');
        let idUser = tr.getAttribute('id');
        return this.apiService.deleteUser(idUser).then(() => this.render());
      });
    })
    const buttonsEdit = document.querySelectorAll('#buttonEdit');
    buttonsEdit.forEach(item => {
      item.addEventListener('click', () => {
        let tr = item.closest('tr');
        // tr.querySelectorAll('.input');
        let idUser = tr.getAttribute('id');
        // return this.apiService.editingUser(idUser);
        return new EditUserController(tr, idUser, async (user) => {
          await this.apiService.editingUser(user);
          await this.render()
        }).init();
      });
    })
  }

  getUsers() {
    return this.apiService.listUser();
  }
}

class ApiService {
  constructor(url) {
    this.url = url;
  }

  addUser(user) {
    return fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(user)
    });
  }

  listUser() {
    return fetch(this.url)
      .then(response => response.json())
      .then(response => new listUsers(response));
  }

  deleteUser(id) {
    const urlIdUser = `${this.url}/${id}`;
    return fetch(urlIdUser, {method: 'DELETE'});
  }

  editingUser(user) {
    const urlIdUser = `${this.url}/${user.uuid}`;
    return fetch(urlIdUser, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(user)
    })
  }
}

class ItemUser {
  constructor(firstName, lastName, uuid) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.uuid = uuid;
  }

  template() {
    return `<tr id="${this.uuid}">
            <td>
                <input name="firstName" type="text" class="input" disabled value="${this.firstName}">
            </td>
            <td>
                <input name="lastName" type="text" class="input" disabled value="${this.lastName}">
            </td>
            <th>
            <div id="editButtons" class="buttons">
               <button id="buttonEdit" class="button is-primary ">Редактировать</button>
               <button id="buttonSave" class="button is-info is-hidden">Сохранить</button>
            </div>
            </th>
            <th>
                <div id="buttonDelete" class="button is-primary">Удалить</div>
            </th>
        </tr>`;
  }
}

class listUsers {
  constructor(list) {
    this.list = list;
  }

  render(selector) {
    let tabletBody = document.querySelector(selector);
    this.list.forEach(item => {
      const userItem = new ItemUser(item.firstName, item.lastName, item.uuid);
      tabletBody.innerHTML += userItem.template();
    });
  }
}

class EditUserController {
  constructor(selector, id, saveMethod) {
    this.$el = selector;
    this.id = id;
    this.saveMethod = saveMethod;
    this.inputs = Array.from(this.$el.querySelectorAll('.input'));
    this.editButtons = this.$el.querySelector('#editButtons');
    this.editButton = this.editButtons.querySelector('#buttonEdit');
    this.saveButton = this.editButtons.querySelector('#buttonSave');
  }

  init() {
    this.initActions()
    this.enableInputs();
    this.showSaveButton();
  }

  hasAllComputed() {
    return this.inputs.filter(input => this.hasVoid(input)).length === 0;
  }

  showSaveButton() {
    this.editButton.classList.add('is-hidden');
    this.saveButton.classList.remove('is-hidden');
  }

  enableInputs() {
    this.inputs.forEach(el => el.removeAttribute("disabled"));
  }

  hasVoid(input) {
    return Boolean(input.value.length === 0);
  }

  initActions() {
    this.saveButton.addEventListener('click', () => {
      if (this.hasAllComputed()) return this.save();
      alert('поля не могул быть пустыми');
    })
  }

  save() {
    console.log(this.$el);
    const firstName = this.$el.querySelector("[name='firstName']").value;
    const lastName = this.$el.querySelector("[name='lastName']").value;
    this.saveMethod({uuid: this.id, firstName, lastName});
  }
}

class AddUserModal {
  constructor(action) {
    this.el = null;
    this.user = {};
    this.action = () => {
      this.close();
      action(this.user);
    };
  }

  template() {
    return `
        <div class="modal-background" data-close="close"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Добавить нового пользователя</p>
                <button class="delete" data-close="close"></button>
            </header>
            <section class="modal-card-body">
                <form id="addForm">
                    <div class="field">
                        <label for="firstName" class="label">First name</label>
                        <div class="control">
                            <input id="firstName" class="input" type="text" required placeholder="Text input">
                        </div>
                    </div>
                    <div class="field">
                        <label for="lastName" class="label">Last name</label>
                        <div class="control">
                            <input id="lastName" class="input" type="text" required placeholder="Text input">
                        </div>
                    </div>
                    <div class="field is-grouped">
                        <div class="control">
                            <button type="submit" class="button is-link">Добавить</button>
                        </div>
                    </div>
                </form>
            </section>
        </div>`;
  }

  open() {
    this.el = document.createElement('div');
    this.el.classList.add('modal');
    this.el.classList.add('is-active');
    this.el.setAttribute('id', 'modal');
    this.el.innerHTML = this.template();
    document.body.append(this.el);
    this.init();
  }

  init() {
    const buttonClose = document.querySelectorAll('[data-close]');
    buttonClose.forEach((button) => {
      button.addEventListener('click', () => this.close())
    });

    const submit = this.el.querySelector('[type="submit"]');
    submit.addEventListener('click', () => {
      this.el.querySelectorAll('.input').forEach(el => {
        const idInput = el.getAttribute('id');
        this.user[idInput] = el.value;
      })
      this.sendData();
    });
  }

  close() {
    this.el.remove();
  }

  sendData() {
    this.action();
  }
}

const currentController = new PageController('#page', ApiUrl);

document.addEventListener('DOMContentLoaded', () => currentController.init());
