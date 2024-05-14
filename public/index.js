// public/index.js
const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = async() => {
    // define your method to get cart data
    const cartResponse = await fetch(`${URL}/cart`);
    return cartResponse.json();
  };

  const getInventory = async() => {
    // define your method to get inventory data
    const inventoryResponse = await fetch(`${URL}/inventory`);
    return inventoryResponse.json();
  };

  const addToCart = async(inventoryItem) => {
    // define your method to add an item to cart
    const addResponse = await fetch(`${URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...inventoryItem }),
    });
    return addResponse.json();
  };

  const updateCart = async(id, newAmount) => {
    // define your method to update an item in cart
    const updateResponse = await fetch(`${URL}/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: newAmount }),
    });
    return updateResponse.json();
  };

  const deleteFromCart = async(id) => {
    // define your method to delete an item in cart
    const deleteResponse = await fetch(`${URL}/cart/${id}`, {
      method: "DELETE",
    });
    return deleteResponse.json();
  };

  const checkout = async() => {
    // you don't need to add anything here
    return getCart().then(async (data) =>
      await Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const itemsPerPage = 8;
let pageNum = 0;

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    #currentPage;
    #filteredInventory;

    constructor() {
      this.#inventory = {};
      this.#cart = {};
      this.#onChange = () => {};
      this.#currentPage = 0;
    }

    get cart() {
      return this.#cart;
    }
    get inventory() {
      return this.#inventory;
    }
    get currentPage() {
      return this.#currentPage;
    }
    get filteredInventory() {
      return this.#filteredInventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange(this.#cart);
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange(this.#inventory);
    }
    set currentPage(newPage) {
      this.#currentPage = newPage;
    }
    set filteredInventory(newInventory) {
      this.#filteredInventory = newInventory;
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;

  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const inventoryList = document.querySelector(".inventory-container ul");
  const cartList = document.querySelector(".cart-container ul");
  const paginationPage = document.querySelector(".pagination__page");

  const renderInventory = (state, page) => {
    inventory = state.inventory;
    inventoryList.innerHTML = "";

    state.currentPage = page;
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    state.filteredInventory = Object.fromEntries(Object.entries(inventory).slice(start, end));

    for(const [id, item] of Object.entries(state.filteredInventory)) {
      var inventoryItem = document.createElement("li");
      inventoryItem.innerHTML = `
        <div class="item-content" data-id="inventory__content-${id}" id="inventory__content-${id}">${item.content}</div>
        <div class="item-controls">
          <button class="btn btn-minus" data-id="inventory__minus-${id}" id="inventory__minus-${id}">-</button>
          <span class="item-amount" data-id="inventory__amount-${id}" id="inventory__amount-${id}" value="0"> 0 </span>
          <button class="btn btn-plus" data-id="inventory__plus-${id}" id="inventory__plus-${id}">+</button>
          <button class="btn btn-info btn-add-to-cart" data-id="inventory__add-${id}" id="inventory__add-${id}">add to cart</button>
        </div>
      `;
      inventoryList.appendChild(inventoryItem);
    }
  };

  const renderPagination = (state, handlePageNumber) => {
    const totalItems = Object.keys(state.inventory).length;
    pageNum = Math.ceil(totalItems / itemsPerPage);
    console.log('pageNum', totalItems, itemsPerPage, pageNum);

    for (let i = 0; i < pageNum; i++) {
      let button = document.createElement("button");
      button.setAttribute("id", `page_${i}`);
      button.classList.add("pagination__pagenum");
      button.addEventListener("click", () => {
        renderInventory(state, i);
        handlePageNumber(i);
      });
      button.innerHTML = i + 1;
      paginationPage.appendChild(button);
    }
  };

  const renderCart = (cart) => {
    cartList.innerHTML = "";
    for(const [id, item] of Object.entries(cart)) {
      var cartItem = document.createElement("li");
      cartItem.innerHTML = `
        <span class="item-content">${item.content} x ${item.amount}</span>
        <button class="btn btn-delete" data-id="del-${id}" id= "del-${id}">delete</button>
      `;
      cartList.appendChild(cartItem);
    }
  };

  return {
    renderInventory,
    renderCart,
    renderPagination
  };
})();


const Controller = ((model, view) => {
  const state = new model.State();

  const init = async () => {
    await model.getInventory().then((inventory) => {
      for(var item in inventory) {
        state.inventory[inventory[item].id] = inventory[item];
      }
      // view.renderInventory(state, currentPage);
      view.renderPagination(state, handlePageNumber);
      handlePageNumber(state.currentPage);
      state.subscribe(view.renderInventory(state, state.currentPage));
    });

    await model.getCart().then((cart) => {
      for(var item in cart) {
        state.cart[cart[item].id] = cart[item];
      }
      view.renderCart(cart);
    });

    state.subscribe(view.renderCart(state.cart));
  };

  const handleUpdateAmount = (id, newAmount) => {
    const cartItem = state.cart[id];
    cartItem !== undefined ? state.cart[id].amount = newAmount : state.cart[id] = { id: id, amount: newAmount, content: state.inventory[id].content, newItem: true };
  };

  const handleAddToCart = (id) => {
    const selectedItem = state.cart[id];
    // selectedItem['amount'] = state.cart[id].amount;
    if(selectedItem.newItem) {
      model.addToCart(selectedItem).then(() => {
        model.getCart().then((cart) => view.renderCart(cart));
      });
      selectedItem['newItem'] = false;
    } else {
      model.updateCart(id, selectedItem.amount).then(() => {
        model.getCart().then((cart) => view.renderCart(cart));
      });
    }
    const amountElement = document.getElementById(`inventory__amount-${id}`);
    amountElement.textContent = 0;
  };

  const handleDelete = (id) => {
    model.deleteFromCart(id).then(() => {
      model.getCart().then((cart) => view.renderCart(cart));
    }).then(() => {
      delete state.cart[id];
    });
  };

  const handleCheckout = () => {
    model.checkout().then(() => {
      location.reload();
      model.getCart().then((cart) => view.renderCart(cart));
    });
  };

  const handlePage = () => {
    const pageContainer = document.querySelector(".pagination");
    pageContainer.addEventListener("click", (event) => {
      console.log('event', event.target, state.currentPage, pageNum)
      if (event.target.classList.contains("pagination__btn-prev") && state.currentPage >= 1) {
        state.currentPage -= 1;
        view.renderInventory(state, state.currentPage);
        handlePageNumber(state.currentPage);
      } else if (event.target.classList.contains("pagination__btn-next") && state.currentPage < pageNum - 1) {
        state.currentPage += 1;
        view.renderInventory(state, state.currentPage);
        handlePageNumber(state.currentPage);
      }
    });
  };

  const handlePageNumber = (currentPage) => {
    console.log('handlePageNumber', currentPage);
    const currentId = `page_${currentPage}`;
    const buttons = document.querySelectorAll(".pagination__pagenum");

    buttons.forEach((button) => {
      if (button.id === currentId) {
        button.style.color = "black";
        button.style.textDecoration = "none";
        button.style.fontWeight = "bold";
      } else {
        button.style.color = "rgb(0, 153, 255)";
        button.style.textDecoration = "underline";
        button.style.fontWeight = "normal";
      }
    });
  };

  const bootstrap = () => {
    init();
    document.addEventListener("click", (event) => {
      if(event.target.classList.contains("btn-minus")) {
        const itemId = event.target.dataset.id.split("-")[1];
        const amountElement = document.getElementById(`inventory__amount-${itemId}`);
        let newAmount = parseInt(amountElement.textContent) - 1;
        newAmount = Math.max(newAmount, 0);
        amountElement.textContent = newAmount;
        handleUpdateAmount(itemId, (state.cart[itemId] ? state.cart[itemId].amount - 1 : newAmount));
      }
      else if (event.target.classList.contains("btn-plus")) {
        const itemId = event.target.dataset.id.split("-")[1];
        const amountElement = document.getElementById(`inventory__amount-${itemId}`);
        const newAmount = parseInt(amountElement.textContent) + 1;
        amountElement.textContent = newAmount;
        handleUpdateAmount(itemId, (state.cart[itemId] ? state.cart[itemId].amount + 1 : newAmount));
      }
      
      else if (event.target.classList.contains("btn-add-to-cart")) {
        const itemId = event.target.dataset.id.split("-")[1];
        handleAddToCart(itemId);
      }
      
      else if (event.target.classList.contains("btn-delete")) {
        const itemId = event.target.dataset.id.split("-")[1];
        handleDelete(itemId);
      }
      
      else if (event.target.classList.contains("checkout-btn")) {
        handleCheckout();
      }
    });
    handlePage();
  };

  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();