/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/style/app.scss":
/*!****************************!*\
  !*** ./src/style/app.scss ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_app_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../style/app.scss */ "./src/style/app.scss");


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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wdHNfdGVzdC8uL3NyYy9zdHlsZS9hcHAuc2Nzcz8yYzUwIiwid2VicGFjazovL3B0c190ZXN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3B0c190ZXN0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcHRzX3Rlc3QvLi9zcmMvanMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3JCQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7Ozs7Ozs7O0FDTjJCOztBQUUzQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUMsT0FBTztBQUNQO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5QkFBeUIsU0FBUyxHQUFHLEdBQUc7QUFDeEMsNkJBQTZCLGlCQUFpQjtBQUM5Qzs7QUFFQTtBQUNBLHlCQUF5QixTQUFTLEdBQUcsVUFBVTtBQUMvQztBQUNBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUMsT0FBTztBQUNQO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLFVBQVU7QUFDaEM7QUFDQSxvRkFBb0YsZUFBZTtBQUNuRztBQUNBO0FBQ0EsbUZBQW1GLGNBQWM7QUFDakc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsbUNBQW1DO0FBQ3hEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0ICcuLi9zdHlsZS9hcHAuc2Nzcyc7XHJcblxyXG5jb25zdCBBcGlVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwL3BlcnNvbic7XHJcblxyXG5jbGFzcyBQYWdlQ29udHJvbGxlciB7XHJcbiAgY29uc3RydWN0b3IobWFpblNlbGVjdG9yLCBhcGlVcmwpIHtcclxuICAgIHRoaXMubWFpblNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihtYWluU2VsZWN0b3IpO1xyXG4gICAgdGhpcy5hcGlTZXJ2aWNlID0gbmV3IEFwaVNlcnZpY2UoYXBpVXJsKTtcclxuICAgIHRoaXMudGFibGVTZWx0Y3RvciA9ICcjbGlzdFVzZXInO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLm1haW5TZWxlY3Rvci5xdWVyeVNlbGVjdG9yKHRoaXMudGFibGVTZWx0Y3RvcikuaW5uZXJIVE1MID0gYGA7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5pbml0SGVhZGVyQWN0aW9ucygpO1xyXG4gICAgdGhpcy5yZW5kZXIoKVxyXG4gIH1cclxuXHJcbiAgaW5pdEhlYWRlckFjdGlvbnMoKSB7XHJcbiAgICBjb25zdCBidXR0b25Nb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNidXR0b25Nb2RhbCcpO1xyXG4gICAgYnV0dG9uTW9kYWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgbmV3IEFkZFVzZXJNb2RhbCgodXNlcikgPT4ge1xyXG4gICAgICAgIHRoaXMuYXBpU2VydmljZS5hZGRVc2VyKHVzZXIpLnRoZW4oKCkgPT4gdGhpcy5yZW5kZXIoKSk7XHJcbiAgICAgIH0pLm9wZW4oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVuZGVyKCkge1xyXG4gICAgdGhpcy5jbGVhcigpO1xyXG4gICAgdGhpcy5yZW5kZXJMaXN0VXNlcigpLnRoZW4oKCkgPT4gdGhpcy5pbml0VXNlckxpc3RBY3Rpb25zKCkpXHJcbiAgfVxyXG5cclxuICBhc3luYyByZW5kZXJMaXN0VXNlcigpIHtcclxuICAgIGNvbnN0IGxpc3RVc2VyID0gYXdhaXQgdGhpcy5nZXRVc2VycygpO1xyXG4gICAgbGlzdFVzZXIucmVuZGVyKHRoaXMudGFibGVTZWx0Y3RvcilcclxuICB9XHJcblxyXG4gIGluaXRVc2VyTGlzdEFjdGlvbnMoKSB7XHJcbiAgICBjb25zdCBidXR0b25zRGVsZXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2J1dHRvbkRlbGV0ZScpO1xyXG4gICAgYnV0dG9uc0RlbGV0ZS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGxldCB0ciA9IGl0ZW0uY2xvc2VzdCgndHInKTtcclxuICAgICAgICBsZXQgaWRVc2VyID0gdHIuZ2V0QXR0cmlidXRlKCdpZCcpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFwaVNlcnZpY2UuZGVsZXRlVXNlcihpZFVzZXIpLnRoZW4oKCkgPT4gdGhpcy5yZW5kZXIoKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIGNvbnN0IGJ1dHRvbnNFZGl0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2J1dHRvbkVkaXQnKTtcclxuICAgIGJ1dHRvbnNFZGl0LmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHRyID0gaXRlbS5jbG9zZXN0KCd0cicpO1xyXG4gICAgICAgIC8vIHRyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5pbnB1dCcpO1xyXG4gICAgICAgIGxldCBpZFVzZXIgPSB0ci5nZXRBdHRyaWJ1dGUoJ2lkJyk7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuYXBpU2VydmljZS5lZGl0aW5nVXNlcihpZFVzZXIpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRWRpdFVzZXJDb250cm9sbGVyKHRyLCBpZFVzZXIsIGFzeW5jICh1c2VyKSA9PiB7XHJcbiAgICAgICAgICBhd2FpdCB0aGlzLmFwaVNlcnZpY2UuZWRpdGluZ1VzZXIodXNlcik7XHJcbiAgICAgICAgICBhd2FpdCB0aGlzLnJlbmRlcigpXHJcbiAgICAgICAgfSkuaW5pdCgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBnZXRVc2VycygpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaVNlcnZpY2UubGlzdFVzZXIoKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEFwaVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKHVybCkge1xyXG4gICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgfVxyXG5cclxuICBhZGRVc2VyKHVzZXIpIHtcclxuICAgIHJldHVybiBmZXRjaCh0aGlzLnVybCwge1xyXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04J1xyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh1c2VyKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBsaXN0VXNlcigpIHtcclxuICAgIHJldHVybiBmZXRjaCh0aGlzLnVybClcclxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxyXG4gICAgICAudGhlbihyZXNwb25zZSA9PiBuZXcgbGlzdFVzZXJzKHJlc3BvbnNlKSk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVVc2VyKGlkKSB7XHJcbiAgICBjb25zdCB1cmxJZFVzZXIgPSBgJHt0aGlzLnVybH0vJHtpZH1gO1xyXG4gICAgcmV0dXJuIGZldGNoKHVybElkVXNlciwge21ldGhvZDogJ0RFTEVURSd9KTtcclxuICB9XHJcblxyXG4gIGVkaXRpbmdVc2VyKHVzZXIpIHtcclxuICAgIGNvbnN0IHVybElkVXNlciA9IGAke3RoaXMudXJsfS8ke3VzZXIudXVpZH1gO1xyXG4gICAgcmV0dXJuIGZldGNoKHVybElkVXNlciwge1xyXG4gICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHVzZXIpXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSXRlbVVzZXIge1xyXG4gIGNvbnN0cnVjdG9yKGZpcnN0TmFtZSwgbGFzdE5hbWUsIHV1aWQpIHtcclxuICAgIHRoaXMuZmlyc3ROYW1lID0gZmlyc3ROYW1lO1xyXG4gICAgdGhpcy5sYXN0TmFtZSA9IGxhc3ROYW1lO1xyXG4gICAgdGhpcy51dWlkID0gdXVpZDtcclxuICB9XHJcblxyXG4gIHRlbXBsYXRlKCkge1xyXG4gICAgcmV0dXJuIGA8dHIgaWQ9XCIke3RoaXMudXVpZH1cIj5cclxuICAgICAgICAgICAgPHRkPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IG5hbWU9XCJmaXJzdE5hbWVcIiB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaW5wdXRcIiBkaXNhYmxlZCB2YWx1ZT1cIiR7dGhpcy5maXJzdE5hbWV9XCI+XHJcbiAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBuYW1lPVwibGFzdE5hbWVcIiB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaW5wdXRcIiBkaXNhYmxlZCB2YWx1ZT1cIiR7dGhpcy5sYXN0TmFtZX1cIj5cclxuICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgPHRoPlxyXG4gICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdEJ1dHRvbnNcIiBjbGFzcz1cImJ1dHRvbnNcIj5cclxuICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ1dHRvbkVkaXRcIiBjbGFzcz1cImJ1dHRvbiBpcy1wcmltYXJ5IFwiPtCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidXR0b25TYXZlXCIgY2xhc3M9XCJidXR0b24gaXMtaW5mbyBpcy1oaWRkZW5cIj7QodC+0YXRgNCw0L3QuNGC0Yw8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgIDx0aD5cclxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJidXR0b25EZWxldGVcIiBjbGFzcz1cImJ1dHRvbiBpcy1wcmltYXJ5XCI+0KPQtNCw0LvQuNGC0Yw8L2Rpdj5cclxuICAgICAgICAgICAgPC90aD5cclxuICAgICAgICA8L3RyPmA7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBsaXN0VXNlcnMge1xyXG4gIGNvbnN0cnVjdG9yKGxpc3QpIHtcclxuICAgIHRoaXMubGlzdCA9IGxpc3Q7XHJcbiAgfVxyXG5cclxuICByZW5kZXIoc2VsZWN0b3IpIHtcclxuICAgIGxldCB0YWJsZXRCb2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB0aGlzLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgY29uc3QgdXNlckl0ZW0gPSBuZXcgSXRlbVVzZXIoaXRlbS5maXJzdE5hbWUsIGl0ZW0ubGFzdE5hbWUsIGl0ZW0udXVpZCk7XHJcbiAgICAgIHRhYmxldEJvZHkuaW5uZXJIVE1MICs9IHVzZXJJdGVtLnRlbXBsYXRlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEVkaXRVc2VyQ29udHJvbGxlciB7XHJcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3IsIGlkLCBzYXZlTWV0aG9kKSB7XHJcbiAgICB0aGlzLiRlbCA9IHNlbGVjdG9yO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5zYXZlTWV0aG9kID0gc2F2ZU1ldGhvZDtcclxuICAgIHRoaXMuaW5wdXRzID0gQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuaW5wdXQnKSk7XHJcbiAgICB0aGlzLmVkaXRCdXR0b25zID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2VkaXRCdXR0b25zJyk7XHJcbiAgICB0aGlzLmVkaXRCdXR0b24gPSB0aGlzLmVkaXRCdXR0b25zLnF1ZXJ5U2VsZWN0b3IoJyNidXR0b25FZGl0Jyk7XHJcbiAgICB0aGlzLnNhdmVCdXR0b24gPSB0aGlzLmVkaXRCdXR0b25zLnF1ZXJ5U2VsZWN0b3IoJyNidXR0b25TYXZlJyk7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5pbml0QWN0aW9ucygpXHJcbiAgICB0aGlzLmVuYWJsZUlucHV0cygpO1xyXG4gICAgdGhpcy5zaG93U2F2ZUJ1dHRvbigpO1xyXG4gIH1cclxuXHJcbiAgaGFzQWxsQ29tcHV0ZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pbnB1dHMuZmlsdGVyKGlucHV0ID0+IHRoaXMuaGFzVm9pZChpbnB1dCkpLmxlbmd0aCA9PT0gMDtcclxuICB9XHJcblxyXG4gIHNob3dTYXZlQnV0dG9uKCkge1xyXG4gICAgdGhpcy5lZGl0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpO1xyXG4gICAgdGhpcy5zYXZlQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgZW5hYmxlSW5wdXRzKCkge1xyXG4gICAgdGhpcy5pbnB1dHMuZm9yRWFjaChlbCA9PiBlbC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSk7XHJcbiAgfVxyXG5cclxuICBoYXNWb2lkKGlucHV0KSB7XHJcbiAgICByZXR1cm4gQm9vbGVhbihpbnB1dC52YWx1ZS5sZW5ndGggPT09IDApO1xyXG4gIH1cclxuXHJcbiAgaW5pdEFjdGlvbnMoKSB7XHJcbiAgICB0aGlzLnNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmhhc0FsbENvbXB1dGVkKCkpIHJldHVybiB0aGlzLnNhdmUoKTtcclxuICAgICAgYWxlcnQoJ9C/0L7Qu9GPINC90LUg0LzQvtCz0YPQuyDQsdGL0YLRjCDQv9GD0YHRgtGL0LzQuCcpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHNhdmUoKSB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLiRlbCk7XHJcbiAgICBjb25zdCBmaXJzdE5hbWUgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKFwiW25hbWU9J2ZpcnN0TmFtZSddXCIpLnZhbHVlO1xyXG4gICAgY29uc3QgbGFzdE5hbWUgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKFwiW25hbWU9J2xhc3ROYW1lJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLnNhdmVNZXRob2Qoe3V1aWQ6IHRoaXMuaWQsIGZpcnN0TmFtZSwgbGFzdE5hbWV9KTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEFkZFVzZXJNb2RhbCB7XHJcbiAgY29uc3RydWN0b3IoYWN0aW9uKSB7XHJcbiAgICB0aGlzLmVsID0gbnVsbDtcclxuICAgIHRoaXMudXNlciA9IHt9O1xyXG4gICAgdGhpcy5hY3Rpb24gPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgYWN0aW9uKHRoaXMudXNlcik7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgdGVtcGxhdGUoKSB7XHJcbiAgICByZXR1cm4gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZ3JvdW5kXCIgZGF0YS1jbG9zZT1cImNsb3NlXCI+PC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIj5cclxuICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cIm1vZGFsLWNhcmQtaGVhZFwiPlxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtb2RhbC1jYXJkLXRpdGxlXCI+0JTQvtCx0LDQstC40YLRjCDQvdC+0LLQvtCz0L4g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPPC9wPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbGV0ZVwiIGRhdGEtY2xvc2U9XCJjbG9zZVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2hlYWRlcj5cclxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJtb2RhbC1jYXJkLWJvZHlcIj5cclxuICAgICAgICAgICAgICAgIDxmb3JtIGlkPVwiYWRkRm9ybVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZmlyc3ROYW1lXCIgY2xhc3M9XCJsYWJlbFwiPkZpcnN0IG5hbWU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiZmlyc3ROYW1lXCIgY2xhc3M9XCJpbnB1dFwiIHR5cGU9XCJ0ZXh0XCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJUZXh0IGlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibGFzdE5hbWVcIiBjbGFzcz1cImxhYmVsXCI+TGFzdCBuYW1lPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImxhc3ROYW1lXCIgY2xhc3M9XCJpbnB1dFwiIHR5cGU9XCJ0ZXh0XCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJUZXh0IGlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBpcy1ncm91cGVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ1dHRvbiBpcy1saW5rXCI+0JTQvtCx0LDQstC40YLRjDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZm9ybT5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICAgIDwvZGl2PmA7XHJcbiAgfVxyXG5cclxuICBvcGVuKCkge1xyXG4gICAgdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdtb2RhbCcpO1xyXG4gICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdpZCcsICdtb2RhbCcpO1xyXG4gICAgdGhpcy5lbC5pbm5lckhUTUwgPSB0aGlzLnRlbXBsYXRlKCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh0aGlzLmVsKTtcclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIGNvbnN0IGJ1dHRvbkNsb3NlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtY2xvc2VdJyk7XHJcbiAgICBidXR0b25DbG9zZS5mb3JFYWNoKChidXR0b24pID0+IHtcclxuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jbG9zZSgpKVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3VibWl0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xyXG4gICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5pbnB1dCcpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkSW5wdXQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XHJcbiAgICAgICAgdGhpcy51c2VyW2lkSW5wdXRdID0gZWwudmFsdWU7XHJcbiAgICAgIH0pXHJcbiAgICAgIHRoaXMuc2VuZERhdGEoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY2xvc2UoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2VuZERhdGEoKSB7XHJcbiAgICB0aGlzLmFjdGlvbigpO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgY3VycmVudENvbnRyb2xsZXIgPSBuZXcgUGFnZUNvbnRyb2xsZXIoJyNwYWdlJywgQXBpVXJsKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBjdXJyZW50Q29udHJvbGxlci5pbml0KCkpO1xyXG4iXSwic291cmNlUm9vdCI6IiJ9